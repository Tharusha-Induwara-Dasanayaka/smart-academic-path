import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { storage } from '../utils/storage';
import {
  MOCK_STUDENT,
  MOCK_MODULES,
  MOCK_GROUPS,
  INITIAL_SELECTED_MODULES,
  INITIAL_NOTIFICATIONS,
  INITIAL_CASES,
  SYSTEM_LOGS,
} from '../constants/mockData';
import {
  detectClashes,
  confirmRegistrationState,
  getAlternatives,
  getConfirmationRedirect,
  getStatus,
  normalizeSelections,
  withGroup,
} from '../utils/registrationLogic.mjs';

const AppContext = createContext(null);
const STORAGE_KEY = 'SAP_APP_STATE_V1';

export const AppProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [student, setStudent] = useState(MOCK_STUDENT);
  const [role, setRoleState] = useState('student');
  const [modules] = useState(MOCK_MODULES);
  const [groups, setGroups] = useState(MOCK_GROUPS);
  const [selectedModules, setSelectedModules] = useState(INITIAL_SELECTED_MODULES);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [cases, setCases] = useState(INITIAL_CASES);
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasReviewedTimetable, setHasReviewedTimetable] = useState(false);
  const confirmationLock = useRef(false);

  useEffect(() => {
    async function loadState() {
      try {
        const saved = await storage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.student) setStudent(parsed.student);
          if (parsed.role) setRoleState(parsed.role);
          if (parsed.groups) setGroups(parsed.groups);
          if (parsed.selectedModules) {
            setSelectedModules(normalizeSelections(parsed.selectedModules));
          }
          if (parsed.isConfirmed !== undefined) setIsConfirmed(parsed.isConfirmed);
          else if (parsed.isExplicitlyConfirmed !== undefined) {
            setIsConfirmed(parsed.isExplicitlyConfirmed);
          }
          if (parsed.notifications) setNotifications(parsed.notifications);
          if (parsed.cases) setCases(parsed.cases);
          if (parsed.hasSeenOnboarding !== undefined) {
            setHasSeenOnboardingState(parsed.hasSeenOnboarding);
          }
          if (parsed.isAuthenticated !== undefined) {
            setIsAuthenticated(parsed.isAuthenticated);
          }
          if (parsed.hasReviewedTimetable !== undefined) {
            setHasReviewedTimetable(parsed.hasReviewedTimetable);
          }
        }
      } catch (error) {
        console.error('Could not load stored app state:', error);
      } finally {
        setIsReady(true);
      }
    }
    loadState();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const persistedState = {
      student,
      role,
      groups,
      selectedModules,
      isConfirmed,
      notifications,
      cases,
      hasSeenOnboarding,
      isAuthenticated,
      hasReviewedTimetable,
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(persistedState)).catch((error) => {
      console.error('Failed to persist app state:', error);
    });
  }, [
    isReady,
    student,
    role,
    groups,
    selectedModules,
    isConfirmed,
    notifications,
    cases,
    hasSeenOnboarding,
    isAuthenticated,
    hasReviewedTimetable,
  ]);

  const clashes = useMemo(
    () => detectClashes(selectedModules, groups),
    [selectedModules, groups]
  );
  const registrationStatus = useMemo(
    () => getStatus(selectedModules, clashes, isConfirmed),
    [selectedModules, clashes, isConfirmed]
  );
  const isClashFree = clashes.length === 0;
  const registrationProgress = useMemo(() => ({
    modules: selectedModules.length,
    totalModules: 5,
    clashes: clashes.length,
    timetableReviewed: hasReviewedTimetable,
  }), [selectedModules.length, clashes.length, hasReviewedTimetable]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastSyncTime((previous) => {
        const elapsedSeconds = Math.floor((Date.now() - previous) / 1000);
        return elapsedSeconds > 75 ? Date.now() : previous;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const selectGroup = useCallback((moduleCode, groupId) => {
    setSelectedModules((previous) => withGroup(previous, moduleCode, groupId));
    setIsConfirmed(false);
    setHasReviewedTimetable(false);
    confirmationLock.current = false;
  }, []);

  const addNextAvailableModule = useCallback(() => {
    const unselected = modules.find(
      (module) => !selectedModules.some((selection) => selection.moduleCode === module.code)
    );
    if (!unselected) return null;

    const group = groups.find((item) => item.moduleCode === unselected.code);
    if (!group) return null;
    selectGroup(unselected.code, group.groupId);
    return unselected.code;
  }, [modules, selectedModules, groups, selectGroup]);

  const removeModule = useCallback((moduleCode) => {
    setSelectedModules((previous) =>
      previous.filter((selection) => selection.moduleCode !== moduleCode)
    );
    setIsConfirmed(false);
    setHasReviewedTimetable(false);
    confirmationLock.current = false;
  }, []);

  const continueFromSelection = useCallback((navigation) => {
    if (selectedModules.length === 0) {
      return { success: false, message: 'Please select at least one module and class group.' };
    }
    const currentClashes = detectClashes(selectedModules, groups);
    if (currentClashes.length > 0) {
      navigation.navigate('ClashWarning');
      return { success: true, destination: 'ClashWarning' };
    }
    navigation.navigate('WeeklyTimetable');
    return { success: true, destination: 'WeeklyTimetable' };
  }, [selectedModules, groups]);

  const resumeRegistration = useCallback((navigation) => {
    const destination = registrationStatus === 'confirmed'
      ? 'Confirmation'
      : registrationStatus === 'clash_free'
        ? 'Timetable'
        : 'Register';
    navigation.navigate(destination);
  }, [registrationStatus]);

  const confirmRegistration = useCallback((navigation, previewGroup) => {
    const currentPreviewGroup = previewGroup
      ? selectedModules.find(
          (selection) => selection.moduleCode === previewGroup.moduleCode
        )?.groupId
      : null;
    const previewChangesSelection =
      !!previewGroup && currentPreviewGroup !== previewGroup.groupId;
    if (confirmationLock.current && !previewChangesSelection) {
      return { success: false, message: 'Registration confirmation is already in progress.' };
    }
    if (isConfirmed && !previewChangesSelection) {
      navigation?.navigate('Confirmation');
      return { success: true, alreadyConfirmed: true };
    }

    const result = confirmRegistrationState({
      selectedModules,
      groups,
      isConfirmed: previewChangesSelection ? false : isConfirmed,
      notifications,
    }, previewGroup);
    if (result.alreadyConfirmed) {
      navigation?.navigate('Confirmation');
      return { success: true, alreadyConfirmed: true };
    }
    if (!result.success && result.reason === 'nothing_selected') {
      return { success: false, message: 'Select at least one group before confirming.' };
    }
    if (!result.success && result.reason === 'has_clash') {
      return { success: false, message: 'Cannot confirm while timetable has clashes.' };
    }
    if (!result.success && result.reason === 'full') {
      navigation?.navigate('AlternativeSelection', {
        moduleCode: result.moduleCode,
      });
      return {
        success: false,
        message: 'A selected group is full. Choose an available alternative.',
      };
    }
    confirmationLock.current = true;
    setSelectedModules(result.nextState.selectedModules);
    setGroups(result.nextState.groups);
    setIsConfirmed(true);
    setNotifications(result.nextState.notifications);
    if (previewChangesSelection) setHasReviewedTimetable(false);
    navigation?.navigate('Confirmation');
    return { success: true };
  }, [isConfirmed, selectedModules, groups, notifications]);

  const createCase = useCallback(({ message, requestType } = {}) => {
    const currentClash = detectClashes(selectedModules, groups)[0];
    if (!currentClash) {
      return { success: false, message: 'There is no current clash to attach to this request.' };
    }
    const suggestions = getAlternatives(currentClash.moduleB, selectedModules, groups);
    const suggestion = suggestions.find((alternative) => alternative.isBestMatch);
    const frozenClash = JSON.parse(JSON.stringify(currentClash));
    const createdCase = {
      id: `case_${Date.now()}`,
      studentName: student.name,
      studentId: student.id,
      clashSummary: currentClash.summary,
      clash: frozenClash,
      message: message || 'Schedule exception requested',
      requestType: requestType || 'Approve an alternative group',
      status: 'conflict',
      suggestedGroup: suggestion?.groupId || null,
      suggestedModule: suggestion?.moduleCode || currentClash.moduleB,
      suggestedSeats: suggestion?.seatsLeft ?? 0,
      suggestedDetails: suggestion
        ? `Suggested: ${suggestion.moduleCode}-${suggestion.groupId} · ${suggestion.seatsLeft} seats available · no new clash`
        : 'No available clash-free group',
      time: 'Just now',
    };
    setCases((previous) => [createdCase, ...previous]);
    return { success: true, createdCase };
  }, [selectedModules, groups, student]);

  const advisorApprove = useCallback((caseId) => {
    const targetCase = cases.find((item) => item.id === caseId);
    if (!targetCase || targetCase.status === 'resolved') return false;

    setCases((previous) =>
      previous.map((item) =>
        item.id === caseId ? { ...item, status: 'resolved' } : item
      )
    );
    if (targetCase.suggestedModule && targetCase.suggestedGroup) {
      selectGroup(targetCase.suggestedModule, targetCase.suggestedGroup);
    }
    setNotifications((previous) => [{
      id: `notif_adv_${Date.now()}`,
      type: 'change',
      title: `Advisor Approved: ${targetCase.suggestedModule}-${targetCase.suggestedGroup}`,
      text: 'Your advisor approved the suggested group. Your selection has been updated.',
      time: 'Just now',
      timeAgo: 'Just now',
      read: false,
      targetRoute: 'Register',
    }, ...previous]);
    return true;
  }, [cases, selectGroup]);

  const advisorContact = useCallback((caseId) => {
    const targetCase = cases.find((item) => item.id === caseId);
    if (!targetCase) return false;
    setCases((previous) =>
      previous.map((item) =>
        item.id === caseId ? { ...item, status: 'awaiting' } : item
      )
    );
    setNotifications((previous) => [{
      id: `notif_contact_${Date.now()}`,
      type: 'info',
      title: 'Your advisor has contacted you',
      text: `Your advisor is following up on case ${targetCase.id}.`,
      time: 'Just now',
      timeAgo: 'Just now',
      read: false,
      targetRoute: 'notifications',
    }, ...previous]);
    return true;
  }, [cases]);

  const markAllRead = useCallback(() => {
    setNotifications((previous) => previous.map((notification) => ({
      ...notification,
      read: true,
    })));
  }, []);

  const openNotification = useCallback((notification, navigation) => {
    if (notification.targetRoute === 'Confirmation') {
      const redirect = getConfirmationRedirect(registrationStatus);
      navigation.navigate(redirect || 'Confirmation');
      return;
    }
    const destinations = {
      Register: 'Register',
      CourseRegistration: 'CourseRegistration',
      Timetable: 'Timetable',
      AdvisorCases: 'AdvisorCases',
    };
    navigation.navigate(destinations[notification.targetRoute] || 'Home');
  }, [registrationStatus]);

  const getModuleAlternatives = useCallback(
    (moduleCode) => getAlternatives(moduleCode, selectedModules, groups),
    [selectedModules, groups]
  );

  const getCaseRecommendation = useCallback((caseItem) => {
    const moduleCode = caseItem.suggestedModule || clashes[0]?.moduleB;
    if (!moduleCode) return null;
    const candidates = getAlternatives(moduleCode, selectedModules, groups);
    return candidates.find(
      (alternative) => alternative.groupId === caseItem.suggestedGroup
    ) || candidates.find((alternative) => alternative.isBestMatch) || null;
  }, [clashes, selectedModules, groups]);

  const getRegistrationPreview = useCallback((moduleCode, groupId) => {
    const previewSelections = withGroup(selectedModules, moduleCode, groupId);
    const previewClashes = detectClashes(previewSelections, groups);
    return {
      selectedModules: previewSelections,
      clashes: previewClashes,
      status: getStatus(previewSelections, previewClashes, false),
      isClashFree: previewClashes.length === 0,
      conflictingModule: previewClashes[0]
        ? previewClashes[0].moduleA === moduleCode
          ? previewClashes[0].moduleB
          : previewClashes[0].moduleA
        : null,
    };
  }, [selectedModules, groups]);

  const setRole = useCallback((newRole) => {
    setRoleState(newRole);
    if (newRole === 'advisor') {
      setStudent((previous) => ({
        ...previous,
        name: 'Dr. Kasun Silva',
        id: 'ADV001',
        programme: 'Faculty Academic Advisor',
      }));
    } else if (newRole === 'admin') {
      setStudent((previous) => ({
        ...previous,
        name: 'System Administrator',
        id: 'ADMIN001',
        programme: 'IT Operations Directorate',
      }));
    } else {
      setStudent(MOCK_STUDENT);
    }
  }, []);

  const setHasSeenOnboarding = useCallback((seen) => {
    setHasSeenOnboardingState(seen);
  }, []);
  const reviewTimetable = useCallback(() => setHasReviewedTimetable(true), []);

  const resetToDemo = useCallback(() => {
    setSelectedModules(INITIAL_SELECTED_MODULES);
    setGroups(MOCK_GROUPS);
    setIsConfirmed(false);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCases(INITIAL_CASES);
    setRoleState('student');
    setStudent(MOCK_STUDENT);
    setHasReviewedTimetable(false);
    confirmationLock.current = false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setRoleState('student');
    storage.deleteItem('authToken');
    storage.deleteItem('userData');
  }, []);

  const value = {
    isReady,
    student,
    role,
    modules,
    groups,
    selectedModules,
    clashes,
    registrationStatus,
    isClashFree,
    registrationProgress,
    isConfirmed,
    notifications,
    cases,
    lastSyncTime,
    hasSeenOnboarding,
    hasReviewedTimetable,
    isAuthenticated,
    systemLogs: SYSTEM_LOGS,
    selectGroup,
    addNextAvailableModule,
    removeModule,
    continueFromSelection,
    resumeRegistration,
    confirmRegistration,
    createCase,
    advisorApprove,
    advisorContact,
    markAllRead,
    openNotification,
    setRole,
    setHasSeenOnboarding,
    setIsAuthenticated,
    resetToDemo,
    logout,
    getModuleAlternatives,
    getCaseRecommendation,
    getRegistrationPreview,
    reviewTimetable,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
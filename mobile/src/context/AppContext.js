import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
import { detectClashes, getAlternatives, getSeatInfo } from '../utils/clashLogic';

const AppContext = createContext(null);

const STORAGE_KEY = 'SAP_APP_STATE_V1';

export const AppProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  // Core State
  const [student, setStudent] = useState(MOCK_STUDENT);
  const [role, setRoleState] = useState('student'); // 'student' | 'advisor' | 'admin'
  const [modules, setModules] = useState(MOCK_MODULES);
  const [groups, setGroups] = useState(MOCK_GROUPS);
  const [selectedModules, setSelectedModules] = useState(INITIAL_SELECTED_MODULES);
  const [isExplicitlyConfirmed, setIsExplicitlyConfirmed] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [cases, setCases] = useState(INITIAL_CASES);
  const [systemLogs, setSystemLogs] = useState(SYSTEM_LOGS);
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load persisted state on startup
  useEffect(() => {
    async function loadState() {
      try {
        const saved = await storage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.student) setStudent(parsed.student);
          if (parsed.role) setRoleState(parsed.role);
          if (parsed.selectedModules) setSelectedModules(parsed.selectedModules);
          if (parsed.isExplicitlyConfirmed !== undefined) {
            setIsExplicitlyConfirmed(parsed.isExplicitlyConfirmed);
          }
          if (parsed.notifications) setNotifications(parsed.notifications);
          if (parsed.cases) setCases(parsed.cases);
          if (parsed.hasSeenOnboarding !== undefined) {
            setHasSeenOnboardingState(parsed.hasSeenOnboarding);
          }
          if (parsed.isAuthenticated !== undefined) {
            setIsAuthenticated(parsed.isAuthenticated);
          }
        }
      } catch (err) {
        console.warn('Could not load stored app state:', err);
      } finally {
        setIsReady(true);
      }
    }
    loadState();
  }, []);

  // Persist state when key values change
  useEffect(() => {
    if (!isReady) return;
    const toSave = {
      student,
      role,
      selectedModules,
      isExplicitlyConfirmed,
      notifications,
      cases,
      hasSeenOnboarding,
      isAuthenticated,
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch((err) => {
      console.warn('Failed to persist app state:', err);
    });
  }, [
    isReady,
    student,
    role,
    selectedModules,
    isExplicitlyConfirmed,
    notifications,
    cases,
    hasSeenOnboarding,
    isAuthenticated,
  ]);

  // Derived: Clashes (NEVER hand-set)
  const clashes = useMemo(() => {
    return detectClashes(selectedModules, groups);
  }, [selectedModules, groups]);

  // Derived: Registration Status
  const registrationStatus = useMemo(() => {
    if (isExplicitlyConfirmed) return 'confirmed';
    if (selectedModules.length === 0) return 'not_started';
    if (clashes.length > 0) return 'has_clash';
    return 'clash_free';
  }, [isExplicitlyConfirmed, selectedModules.length, clashes.length]);

  // Live sync timer simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Advance seconds or simulate periodic refresh
      setLastSyncTime((prev) => {
        const diffSeconds = Math.floor((Date.now() - prev) / 1000);
        if (diffSeconds > 75) {
          // auto-sync fresh
          return Date.now();
        }
        return prev;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Action: Select or replace group for a module
  const selectGroup = useCallback((moduleCode, groupId) => {
    setSelectedModules((prev) => {
      const filtered = prev.filter((item) => item.moduleCode !== moduleCode);
      return [...filtered, { moduleCode, groupId }];
    });
    setIsExplicitlyConfirmed(false);
  }, []);

  // Action: Add another module (from available mock modules)
  const addNextAvailableModule = useCallback(() => {
    const unselected = modules.find(
      (m) => !selectedModules.some((s) => s.moduleCode === m.code)
    );
    if (!unselected) return null;

    const groupForMod = groups.find((g) => g.moduleCode === unselected.code);
    if (groupForMod) {
      selectGroup(unselected.code, groupForMod.groupId);
      return unselected.code;
    }
    return null;
  }, [modules, selectedModules, groups, selectGroup]);

  // Action: Remove module
  const removeModule = useCallback((moduleCode) => {
    setSelectedModules((prev) => prev.filter((item) => item.moduleCode !== moduleCode));
    setIsExplicitlyConfirmed(false);
  }, []);

  // Action: Confirm registration
  const confirmRegistration = useCallback(() => {
    // Confirm registration allowed ONLY when clash-free
    const currentClashes = detectClashes(selectedModules, groups);
    if (currentClashes.length > 0) {
      return { success: false, message: 'Cannot confirm while timetable has clashes.' };
    }

    setIsExplicitlyConfirmed(true);

    // Push notification: "IT3070 - Group 4 confirmed"
    const it3070Item = selectedModules.find((s) => s.moduleCode === 'IT3070');
    const groupName = it3070Item ? `Group ${it3070Item.groupId.replace('G', '')}` : 'Group 4';
    const notifTitle = `IT3070 – ${groupName} confirmed`;

    const newNotif = {
      id: `notif_${Date.now()}`,
      type: 'confirmed',
      title: notifTitle,
      text: 'Official registration confirmed. All schedule conflicts resolved.',
      time: 'Just now',
      timeAgo: 'Just now',
      read: false,
      targetRoute: 'Confirmation',
    };

    setNotifications((prev) => [newNotif, ...prev]);

    return { success: true };
  }, [selectedModules, groups]);

  // Action: Add case from Help/Escalation
  const addCase = useCallback((newCaseData) => {
    const createdCase = {
      id: `case_${Date.now()}`,
      studentName: student.name,
      studentId: student.id,
      clashSummary: newCaseData.conflictDetails || 'IT3060-G1 vs IT3070-G2',
      message: newCaseData.message || 'Schedule exception requested',
      status: 'conflict',
      suggestedGroup: 'G4',
      suggestedModule: 'IT3070',
      suggestedDetails: 'Suggested: IT3070-G4 · 12 seats available · no new clash',
      time: 'Just now',
    };
    setCases((prev) => [createdCase, ...prev]);
    return createdCase;
  }, [student]);

  // Action: Approve case in Advisor Dashboard
  const approveCase = useCallback((caseId) => {
    let resolvedCase = null;
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          resolvedCase = { ...c, status: 'resolved' };
          return resolvedCase;
        }
        return c;
      })
    );

    // If the case has a suggested group, apply it to the student's selections!
    if (resolvedCase && resolvedCase.suggestedModule && resolvedCase.suggestedGroup) {
      selectGroup(resolvedCase.suggestedModule, resolvedCase.suggestedGroup);

      // Push notification to the student
      const notif = {
        id: `notif_adv_${Date.now()}`,
        type: 'change',
        title: `Advisor Approved: ${resolvedCase.suggestedModule}-${resolvedCase.suggestedGroup}`,
        text: `Dr. Kasun Silva approved your request for ${resolvedCase.suggestedModule}. Timetable updated.`,
        time: 'Just now',
        timeAgo: 'Just now',
        read: false,
        targetRoute: 'Timetable',
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    return true;
  }, [selectGroup]);
  
  // Action: Delete case
  const deleteCase = useCallback((caseId) => {
    setCases((prev) => prev.filter((item) => item.id !== caseId));
  }, []);
      
  // Action: Mark system log as reviewed
  const markSystemLogReviewed = useCallback((logIndex) => {
    setSystemLogs((prevLogs) =>
      prevLogs.map((log, index) =>
        index === logIndex
          ? { ...log, reviewed: true }
          : log
      )
    );
  }, []);
  // Action: Mark all notifications as read
  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Action: Set Role
  const setRole = useCallback((newRole) => {
    setRoleState(newRole);
    if (newRole === 'advisor') {
      setStudent((prev) => ({
        ...prev,
        name: 'Dr. Kasun Silva',
        id: 'ADV001',
        programme: 'Faculty Academic Advisor',
      }));
    } else if (newRole === 'admin') {
      setStudent((prev) => ({
        ...prev,
        name: 'System Administrator',
        id: 'ADMIN001',
        programme: 'IT Operations Directorate',
      }));
    } else {
      setStudent(MOCK_STUDENT);
    }
  }, []);

  // Action: Set Onboarding Seen
  const setHasSeenOnboarding = useCallback((seen) => {
    setHasSeenOnboardingState(seen);
  }, []);

  // Action: Reset registration to demo initial state
  const resetToDemo = useCallback(() => {
    setSelectedModules(INITIAL_SELECTED_MODULES);
    setIsExplicitlyConfirmed(false);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCases(INITIAL_CASES);
    setRoleState('student');
    setStudent(MOCK_STUDENT);
  }, []);

  // Action: Logout
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setRoleState('student');
    storage.deleteItem('authToken');
    storage.deleteItem('userData');
  }, []);

  // Helper: Alternatives for a module
  const getModuleAlternatives = useCallback(
    (moduleCode) => getAlternatives(moduleCode, selectedModules, groups),
    [selectedModules, groups]
  );

  return (
    <AppContext.Provider
      value={{
        isReady,
        student,
        role,
        modules,
        groups,
        selectedModules,
        clashes,
        registrationStatus,
        notifications,
        cases,
        lastSyncTime,
        hasSeenOnboarding,
        isAuthenticated,
        systemLogs,

        // Actions
        selectGroup,
        addNextAvailableModule,
        removeModule,
        confirmRegistration,
        addCase,
        approveCase,
        deleteCase,
        markNotificationsRead,
        markSystemLogReviewed,
        setRole,
        setHasSeenOnboarding,
        setIsAuthenticated,
        resetToDemo,
        logout,
        getModuleAlternatives,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

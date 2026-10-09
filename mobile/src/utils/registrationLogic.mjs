export function toMin(time) {
  if (typeof time !== 'string') return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

export function normalizeDay(day) {
  const value = String(day || '').trim().toLowerCase();
  const days = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const match = days.find((item) => value.startsWith(item));
  return match ? match[0].toUpperCase() + match.slice(1) : day || '';
}

function toTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function groupsOverlap(groupA, groupB) {
  const sameDay =
    normalizeDay(groupA.day || groupA.dayOfWeek) ===
    normalizeDay(groupB.day || groupB.dayOfWeek);
  return (
    sameDay &&
    toMin(groupA.start) < toMin(groupB.end) &&
    toMin(groupB.start) < toMin(groupA.end)
  );
}

export function detectClashes(selectedModules = [], groups = []) {
  const selectedGroups = selectedModules
    .map((selection) =>
      groups.find(
        (group) =>
          group.moduleCode === selection.moduleCode &&
          group.groupId === selection.groupId
      )
    )
    .filter(Boolean);
  const clashes = [];

  for (let first = 0; first < selectedGroups.length; first += 1) {
    for (let second = first + 1; second < selectedGroups.length; second += 1) {
      const groupA = selectedGroups[first];
      const groupB = selectedGroups[second];
      if (!groupsOverlap(groupA, groupB)) continue;

      const start = Math.max(toMin(groupA.start), toMin(groupB.start));
      const end = Math.min(toMin(groupA.end), toMin(groupB.end));
      const day = normalizeDay(groupA.day || groupA.dayOfWeek);
      const overlapWindow = `${toTime(start)}-${toTime(end)}`;
      clashes.push({
        id: `clash_${groupA.moduleCode}_${groupB.moduleCode}`,
        day,
        dayOfWeek: groupA.dayOfWeek || day,
        moduleA: groupA.moduleCode,
        groupA: groupA.groupId,
        moduleB: groupB.moduleCode,
        groupB: groupB.groupId,
        timeA: `${groupA.start}-${groupA.end}`,
        timeB: `${groupB.start}-${groupB.end}`,
        overlapWindow,
        summary: `${groupA.moduleCode} - Group ${groupA.groupId.replace(/^G/, '')} overlaps ${groupB.moduleCode} - Group ${groupB.groupId.replace(/^G/, '')}, ${day} ${toTime(start)}-${toTime(end)}`,
      });
    }
  }
  return clashes;
}

export function withGroup(selectedModules = [], moduleCode, groupId) {
  const existing = selectedModules.findIndex(
    (selection) => selection.moduleCode === moduleCode
  );
  if (existing === -1) return [...selectedModules, { moduleCode, groupId }];
  return selectedModules.map((selection, index) =>
    index === existing ? { moduleCode, groupId } : selection
  );
}

export function normalizeSelections(selectedModules = []) {
  return selectedModules.reduce(
    (normalized, selection) =>
      withGroup(normalized, selection.moduleCode, selection.groupId),
    []
  );
}

export function getAlternatives(moduleCode, selectedModules = [], groups = []) {
  const otherSelections = selectedModules.filter(
    (selection) => selection.moduleCode !== moduleCode
  );
  const alternatives = groups
    .filter((group) => group.moduleCode === moduleCode)
    .map((group) => {
      const candidateClashes = detectClashes(
        withGroup(otherSelections, moduleCode, group.groupId),
        groups
      );
      const clashesWithCandidate = candidateClashes.filter(
        (clash) =>
          (clash.moduleA === moduleCode && clash.groupA === group.groupId) ||
          (clash.moduleB === moduleCode && clash.groupB === group.groupId)
      );
      const seats = Number(group.seatsLeft);
      const isFull = !Number.isFinite(seats) || seats <= 0;
      const hasClashWithOthers = clashesWithCandidate.length > 0;
      const reason = isFull ? 'full' : hasClashWithOthers ? 'clash' : null;
      return {
        ...group,
        hasClashWithOthers,
        isFull,
        isValidAlternative: reason === null,
        eligible: reason === null,
        reason,
        clashDetails: hasClashWithOthers ? clashesWithCandidate[0] : null,
        isBestMatch: false,
      };
    });

  const eligible = alternatives.filter((alternative) => alternative.eligible);
  const best = eligible.reduce(
    (current, alternative) =>
      !current || Number(alternative.seatsLeft) > Number(current.seatsLeft)
        ? alternative
        : current,
    null
  );
  if (best) best.isBestMatch = true;
  return alternatives;
}

export function seatLevel(seatsLeft) {
  const seats = Number(seatsLeft) || 0;
  if (seats <= 0) return 'full';
  if (seats < 10) return 'limited';
  return 'available';
}

export function getStatus(selectedModules = [], clashes = [], isConfirmed = false) {
  if (clashes.length > 0) return 'has_clash';
  if (selectedModules.length === 0) return 'not_started';
  if (isConfirmed) return 'confirmed';
  return 'clash_free';
}

export function getConfirmationRedirect(status) {
  if (status === 'confirmed') return null;
  return status === 'clash_free' ? 'Timetable' : 'CourseRegistration';
}

export function confirmRegistrationState(state, previewGroup, now = Date.now()) {
  const currentGroup = previewGroup
    ? state.selectedModules.find(
        (selection) => selection.moduleCode === previewGroup.moduleCode
      )?.groupId
    : null;
  const previewChangesSelection =
    !!previewGroup && currentGroup !== previewGroup.groupId;
  if (state.isConfirmed && !previewChangesSelection) {
    return { success: true, alreadyConfirmed: true, nextState: state };
  }

  const selectedModules = previewGroup
    ? withGroup(state.selectedModules, previewGroup.moduleCode, previewGroup.groupId)
    : state.selectedModules;
  if (selectedModules.length === 0) {
    return {
      success: false,
      reason: 'nothing_selected',
      nextState: state,
    };
  }
  if (detectClashes(selectedModules, state.groups).length > 0) {
    return {
      success: false,
      reason: 'has_clash',
      nextState: state,
    };
  }

  const fullSelection = selectedModules.find((selection) => {
    const group = state.groups.find(
      (item) =>
        item.moduleCode === selection.moduleCode && item.groupId === selection.groupId
    );
    const seats = Number(group?.seatsLeft);
    return !group || !Number.isFinite(seats) || seats <= 0;
  });
  if (fullSelection) {
    return {
      success: false,
      reason: 'full',
      moduleCode: fullSelection.moduleCode,
      nextState: state,
    };
  }

  const groups = state.groups.map((group) => {
    const selected = selectedModules.some(
      (selection) =>
        selection.moduleCode === group.moduleCode && selection.groupId === group.groupId
    );
    return selected ? { ...group, seatsLeft: Number(group.seatsLeft) - 1 } : group;
  });
  const noticeSelection = previewGroup || selectedModules[0];
  const noticeGroup = state.groups.find(
    (group) =>
      group.moduleCode === noticeSelection.moduleCode &&
      group.groupId === noticeSelection.groupId
  );
  const notification = {
    id: `notif_confirmed_${now}`,
    type: 'confirmed',
    title: `${noticeSelection.moduleCode} - ${noticeGroup?.groupName || `Group ${noticeSelection.groupId.replace(/^G/, '')}`} confirmed`,
    text: 'Official registration confirmed. All schedule conflicts resolved.',
    time: 'Just now',
    timeAgo: 'Just now',
    read: false,
    targetRoute: 'Confirmation',
  };
  return {
    success: true,
    alreadyConfirmed: false,
    notification,
    nextState: {
      ...state,
      selectedModules,
      groups,
      isConfirmed: true,
      notifications: [notification, ...state.notifications],
    },
  };
}

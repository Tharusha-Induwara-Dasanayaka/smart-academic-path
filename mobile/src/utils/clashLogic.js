/**
 * Converts "HH:MM" (e.g. "10:00", "14:30") to minutes since midnight
 */
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

/**
 * Converts minutes since midnight back to "HH:MM"
 */
export function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Standardizes day names to 3-letter abbreviation (Mon, Tue, Wed, Thu, Fri)
 */
export function normalizeDay(day) {
  if (!day) return '';
  const d = day.trim().toLowerCase();
  if (d.startsWith('mon')) return 'Mon';
  if (d.startsWith('tue')) return 'Tue';
  if (d.startsWith('wed')) return 'Wed';
  if (d.startsWith('thu')) return 'Thu';
  if (d.startsWith('fri')) return 'Fri';
  return day;
}

/**
 * Detect clashes between selected groups
 *
 * Rule: Clash if same day AND startA < endB AND startB < endA.
 * Edge case: 10:00-12:00 and 12:00-14:00 must NOT clash.
 *
 * @param {Array<{moduleCode: string, groupId: string}>} selectedModules
 * @param {Array<Object>} groups
 * @returns {Array<Object>} List of clash pairs with overlap window
 */
export function detectClashes(selectedModules = [], groups = []) {
  const clashes = [];

  // Resolve group details for each selected module
  const resolved = selectedModules
    .map((sel) => {
      const group = groups.find(
        (g) => g.moduleCode === sel.moduleCode && g.groupId === sel.groupId
      );
      if (!group) return null;
      return {
        ...group,
        startMin: timeToMinutes(group.start),
        endMin: timeToMinutes(group.end),
        normDay: normalizeDay(group.day || group.dayOfWeek),
      };
    })
    .filter(Boolean);

  for (let i = 0; i < resolved.length; i++) {
    for (let j = i + 1; j < resolved.length; j++) {
      const a = resolved[i];
      const b = resolved[j];

      // Must be on the same day
      if (a.normDay === b.normDay) {
        // Overlap condition: startA < endB && startB < endA
        if (a.startMin < b.endMin && b.startMin < a.endMin) {
          const overlapStartMin = Math.max(a.startMin, b.startMin);
          const overlapEndMin = Math.min(a.endMin, b.endMin);

          clashes.push({
            id: `clash_${a.moduleCode}_${b.moduleCode}`,
            day: a.normDay,
            dayOfWeek: a.dayOfWeek || a.normDay,
            moduleA: a.moduleCode,
            groupA: a.groupId,
            moduleB: b.moduleCode,
            groupB: b.groupId,
            timeA: `${a.start}–${a.end}`,
            timeB: `${b.start}–${b.end}`,
            overlapWindow: `${minutesToTime(overlapStartMin)}–${minutesToTime(overlapEndMin)}`,
            summary: `${a.moduleCode}-${a.groupId} overlaps ${b.moduleCode}-${b.groupId} · ${a.normDay} ${minutesToTime(overlapStartMin)}–${minutesToTime(overlapEndMin)}`,
          });
        }
      }
    }
  }

  return clashes;
}

/**
 * Gets alternative class groups for a specific module
 *
 * Rules:
 * 1. Same module only
 * 2. No clash with any OTHER selected group
 * 3. seatsLeft > 0
 * 4. Full groups shown disabled with a "Full" tag
 * 5. Mark the valid group with the most seats as "Best match"
 *
 * @param {string} moduleCode
 * @param {Array<{moduleCode: string, groupId: string}>} selectedModules
 * @param {Array<Object>} groups
 * @returns {Array<Object>}
 */
export function getAlternatives(moduleCode, selectedModules = [], groups = []) {
  // Other selected groups (excluding the target module)
  const otherSelections = selectedModules.filter(
    (item) => item.moduleCode !== moduleCode
  );

  // All groups for this module
  const moduleGroups = groups.filter((g) => g.moduleCode === moduleCode);

  const alternatives = moduleGroups.map((group) => {
    // Check if this candidate group clashes with any other selected group
    const hypotheticalSelections = [
      ...otherSelections,
      { moduleCode: group.moduleCode, groupId: group.groupId },
    ];
    const candidateClashes = detectClashes(hypotheticalSelections, groups);
    const hasClashWithOthers = candidateClashes.length > 0;
    const isFull = (group.seatsLeft ?? 0) <= 0;
    const isValidAlternative = !hasClashWithOthers && !isFull;

    return {
      ...group,
      hasClashWithOthers,
      isFull,
      isValidAlternative,
      clashDetails: hasClashWithOthers ? candidateClashes[0] : null,
      isBestMatch: false, // will calculate below
    };
  });

  // Find the valid alternative with the most seats
  const validCandidates = alternatives.filter((a) => a.isValidAlternative);
  if (validCandidates.length > 0) {
    let maxSeats = -1;
    validCandidates.forEach((a) => {
      if ((a.seatsLeft ?? 0) > maxSeats) {
        maxSeats = a.seatsLeft ?? 0;
      }
    });

    // Mark the candidate(s) with maxSeats as best match
    const bestOne = validCandidates.find((a) => (a.seatsLeft ?? 0) === maxSeats);
    if (bestOne) {
      bestOne.isBestMatch = true;
    }
  }

  return alternatives;
}

/**
 * Color and label based on seats:
 * 10 or more = green
 * 1-9 = orange ("X left")
 * 0 = red "Full"
 */
export function getSeatInfo(seatsLeft) {
  const seats = Number(seatsLeft) || 0;
  if (seats <= 0) {
    return {
      color: '#EF4444',
      bgColor: '#FEE2E2',
      text: 'Full',
      badgeColor: 'red',
      isAvailable: false,
    };
  }
  if (seats < 10) {
    return {
      color: '#D97706',
      bgColor: '#FEF3C7',
      text: `${seats} left`,
      badgeColor: 'orange',
      isAvailable: true,
    };
  }
  return {
    color: '#16A34A',
    bgColor: '#DCFCE7',
    text: `${seats} seats`,
    badgeColor: 'green',
    isAvailable: true,
  };
}

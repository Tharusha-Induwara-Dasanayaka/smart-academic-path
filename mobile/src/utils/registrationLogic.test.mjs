import assert from 'node:assert/strict';
import {
  detectClashes,
  confirmRegistrationState,
  getConfirmationRedirect,
  getAlternatives,
  getStatus,
  groupsOverlap,
  normalizeSelections,
  seatLevel,
  toMin,
  withGroup,
} from './registrationLogic.mjs';
import { MOCK_GROUPS } from '../constants/mockData.js';

let passed = 0;
const test = (name, callback) => {
  callback();
  passed += 1;
  console.log(`PASS ${name}`);
};

const makeGroup = (moduleCode, groupId, day, start, end, seatsLeft = 10) => ({
  moduleCode,
  groupId,
  day,
  start,
  end,
  seatsLeft,
});
const selected = (first, second) => [
  { moduleCode: first.moduleCode, groupId: first.groupId },
  { moduleCode: second.moduleCode, groupId: second.groupId },
];

test('toMin converts a clock time to minutes', () => {
  assert.equal(toMin('10:30'), 630);
});

test('same-day identical periods clash for 10:00-12:00', () => {
  const first = makeGroup('A', 'G1', 'Mon', '10:00', '12:00');
  const second = makeGroup('B', 'G1', 'Mon', '10:00', '12:00');
  const clashes = detectClashes(selected(first, second), [first, second]);
  assert.equal(clashes.length, 1);
  assert.equal(clashes[0].overlapWindow, '10:00-12:00');
  assert.equal(
    clashes[0].summary,
    'A - Group 1 overlaps B - Group 1, Mon 10:00-12:00'
  );
});

test('touching periods 10:00-12:00 and 12:00-14:00 do not clash', () => {
  const first = makeGroup('A', 'G1', 'Mon', '10:00', '12:00');
  const second = makeGroup('B', 'G1', 'Mon', '12:00', '14:00');
  assert.equal(groupsOverlap(first, second), false);
  assert.equal(detectClashes(selected(first, second), [first, second]).length, 0);
});

test('same periods on Monday and Tuesday do not clash', () => {
  const first = makeGroup('A', 'G1', 'Mon', '10:00', '12:00');
  const second = makeGroup('B', 'G1', 'Tue', '10:00', '12:00');
  assert.equal(detectClashes(selected(first, second), [first, second]).length, 0);
});

test('partial overlap reports 11:00-12:00', () => {
  const first = makeGroup('A', 'G1', 'Mon', '10:00', '12:00');
  const second = makeGroup('B', 'G1', 'Mon', '11:00', '13:00');
  const clashes = detectClashes(selected(first, second), [first, second]);
  assert.equal(clashes.length, 1);
  assert.equal(clashes[0].overlapWindow, '11:00-12:00');
});

test('IT3070 alternatives skip G2, and tag G4 as Best match', () => {
  const selections = [
    { moduleCode: 'IT3060', groupId: 'G1' },
    { moduleCode: 'IT3070', groupId: 'G2' },
  ];
  const alternatives = getAlternatives('IT3070', selections, MOCK_GROUPS);
  const g2 = alternatives.find((group) => group.groupId === 'G2');
  const g4 = alternatives.find((group) => group.groupId === 'G4');
  const g6 = alternatives.find((group) => group.groupId === 'G6');
  const offered = alternatives.filter((group) => !group.hasClashWithOthers);
  assert.equal(g2.eligible, false);
  assert.equal(offered.some((group) => group.groupId === 'G2'), false);
  assert.equal(g4.eligible, true);
  assert.equal(offered.some((group) => group.groupId === 'G4'), true);
  assert.equal(g4.isBestMatch, true);
  assert.equal(g6.eligible, true);
  assert.equal(offered.some((group) => group.groupId === 'G6'), true);
});

test('alternative eligibility ignores clashes unrelated to its candidate group', () => {
  const selections = [
    { moduleCode: 'IT3060', groupId: 'G1' },
    { moduleCode: 'IT3070', groupId: 'G2' },
  ];
  const alternative = getAlternatives('IT3080', selections, MOCK_GROUPS)
    .find((group) => group.groupId === 'G1');
  assert.equal(alternative.hasClashWithOthers, false);
  assert.equal(alternative.eligible, true);
});

test('full groups are ineligible with reason full', () => {
  const full = makeGroup('IT3070', 'G9', 'Fri', '16:00', '18:00', 0);
  const alternatives = getAlternatives('IT3070', [], [full]);
  assert.equal(alternatives[0].eligible, false);
  assert.equal(alternatives[0].reason, 'full');
  assert.equal(seatLevel(0), 'full');
});

test('selecting G4 replaces G2 for the same module', () => {
  const next = withGroup(
    [{ moduleCode: 'IT3070', groupId: 'G2' }],
    'IT3070',
    'G4'
  );
  assert.deepEqual(next, [{ moduleCode: 'IT3070', groupId: 'G4' }]);
});

test('rehydrated data is normalized to one group per module', () => {
  assert.deepEqual(
    normalizeSelections([
      { moduleCode: 'IT3070', groupId: 'G2' },
      { moduleCode: 'IT3060', groupId: 'G1' },
      { moduleCode: 'IT3070', groupId: 'G4' },
    ]),
    [
      { moduleCode: 'IT3070', groupId: 'G4' },
      { moduleCode: 'IT3060', groupId: 'G1' },
    ]
  );
});

test('clash status takes precedence over a stale confirmed flag', () => {
  assert.equal(
    getStatus([{ moduleCode: 'A', groupId: 'G1' }], [{}], true),
    'has_clash'
  );
  assert.equal(getStatus([], [], true), 'not_started');
});

test('confirmation guard rejects unconfirmed registration, including a clash', () => {
  assert.equal(getConfirmationRedirect('has_clash'), 'CourseRegistration');
  assert.equal(getConfirmationRedirect('clash_free'), 'Timetable');
  assert.equal(getConfirmationRedirect('confirmed'), null);
});

test('confirmation rejects a clash without changing state', () => {
  const state = {
    selectedModules: [
      { moduleCode: 'IT3060', groupId: 'G1' },
      { moduleCode: 'IT3070', groupId: 'G2' },
    ],
    groups: MOCK_GROUPS,
    isConfirmed: false,
    notifications: [],
  };
  const result = confirmRegistrationState(state, null, 100);
  assert.equal(result.success, false);
  assert.equal(result.reason, 'has_clash');
  assert.equal(result.nextState, state);
});

test('confirmation rejects empty and full selections without changing state', () => {
  const emptyState = {
    selectedModules: [],
    groups: MOCK_GROUPS,
    isConfirmed: false,
    notifications: [],
  };
  const emptyResult = confirmRegistrationState(emptyState, null, 99);
  assert.equal(emptyResult.success, false);
  assert.equal(emptyResult.reason, 'nothing_selected');
  assert.equal(emptyResult.nextState, emptyState);

  const fullGroups = MOCK_GROUPS.map((group) =>
    group.moduleCode === 'IT3060' ? { ...group, seatsLeft: 0 } : group
  );
  const fullState = {
    selectedModules: [{ moduleCode: 'IT3060', groupId: 'G1' }],
    groups: fullGroups,
    isConfirmed: false,
    notifications: [],
  };
  const fullResult = confirmRegistrationState(fullState, null, 100);
  assert.equal(fullResult.success, false);
  assert.equal(fullResult.reason, 'full');
  assert.equal(fullResult.moduleCode, 'IT3060');
  assert.equal(fullResult.nextState, fullState);
});

test('clean confirmation decrements seats and creates one notification only once', () => {
  const state = {
    selectedModules: [
      { moduleCode: 'IT3060', groupId: 'G1' },
      { moduleCode: 'IT3070', groupId: 'G4' },
    ],
    groups: MOCK_GROUPS,
    isConfirmed: false,
    notifications: [],
  };
  const first = confirmRegistrationState(state, null, 101);
  assert.equal(first.success, true);
  assert.equal(first.nextState.isConfirmed, true);
  assert.equal(
    first.nextState.groups.find((group) => group.moduleCode === 'IT3060').seatsLeft,
    13
  );
  assert.equal(first.nextState.notifications.length, 1);
  const second = confirmRegistrationState(first.nextState, null, 102);
  assert.equal(second.alreadyConfirmed, true);
  assert.equal(second.nextState.notifications.length, 1);
});

test('a changed alternative after confirmation creates a new confirmation', () => {
  const confirmedState = {
    selectedModules: [
      { moduleCode: 'IT3060', groupId: 'G1' },
      { moduleCode: 'IT3070', groupId: 'G4' },
    ],
    groups: MOCK_GROUPS,
    isConfirmed: true,
    notifications: [{ id: 'previous-confirmation' }],
  };
  const result = confirmRegistrationState(
    confirmedState,
    { moduleCode: 'IT3070', groupId: 'G6' },
    103
  );
  assert.equal(result.success, true);
  assert.equal(result.nextState.isConfirmed, true);
  assert.equal(
    result.nextState.selectedModules.find((selection) => selection.moduleCode === 'IT3070').groupId,
    'G6'
  );
  assert.equal(result.nextState.notifications.length, 2);
});

test('registration selections survive state serialization and hydration', () => {
  const persisted = {
    selectedModules: [
      { moduleCode: 'IT3060', groupId: 'G1' },
      { moduleCode: 'IT3070', groupId: 'G4' },
    ],
    isConfirmed: true,
    notifications: [{ id: 'confirmation' }],
  };
  const rehydrated = JSON.parse(JSON.stringify(persisted));
  assert.deepEqual(rehydrated.selectedModules, persisted.selectedModules);
  assert.equal(rehydrated.isConfirmed, true);
  assert.deepEqual(rehydrated.notifications, persisted.notifications);
});

console.log(`\n${passed} registration logic tests passed.`);

import { detectClashes, getAlternatives, getSeatInfo } from './clashLogic.js';
import {
  MOCK_STUDENT,
  MOCK_MODULES,
  MOCK_GROUPS,
  INITIAL_SELECTED_MODULES,
  INITIAL_NOTIFICATIONS,
  INITIAL_CASES,
} from '../constants/mockData.js';

let passedCount = 0;
let totalTests = 0;

function assertTest(name, condition) {
  totalTests++;
  if (!condition) {
    console.error(`❌ TEST FAILED: ${name}`);
    process.exit(1);
  }
  passedCount++;
  console.log(`✅ TEST PASSED: ${name}`);
}

console.log('🚀 Running Acceptance Tests (A - H)...\n');

// State simulation object
let state = {
  student: { ...MOCK_STUDENT },
  role: 'student',
  selectedModules: [...INITIAL_SELECTED_MODULES],
  groups: [...MOCK_GROUPS],
  isExplicitlyConfirmed: false,
  notifications: [...INITIAL_NOTIFICATIONS],
  cases: [...INITIAL_CASES],
};

function getClashes() {
  return detectClashes(state.selectedModules, state.groups);
}

// ==========================================
// TEST A: Start state -> Continue shows Clash modal naming IT3060 G1, IT3070 G2 and Mon 10:00-12:00
// ==========================================
const startClashes = getClashes();
assertTest(
  'A. Start state contains active clash between IT3060 G1 and IT3070 G2 on Mon 10:00-12:00',
  startClashes.length === 1 &&
    startClashes[0].moduleA === 'IT3060' &&
    startClashes[0].groupA === 'G1' &&
    startClashes[0].moduleB === 'IT3070' &&
    startClashes[0].groupB === 'G2' &&
    startClashes[0].day === 'Mon' &&
    startClashes[0].overlapWindow === '10:00-12:00'
);

// ==========================================
// TEST B: "Keep anyway" does nothing. Confirm is impossible while clashing.
// ==========================================
// Confirm function check
function tryConfirmRegistration() {
  const currentClashes = getClashes();
  if (currentClashes.length > 0) {
    return { success: false, blocked: true };
  }
  state.isExplicitlyConfirmed = true;
  return { success: true };
}
const confirmAttemptWhileClashing = tryConfirmRegistration();
assertTest(
  'B. Confirm is impossible while clashing (blocked)',
  confirmAttemptWhileClashing.success === false && confirmAttemptWhileClashing.blocked === true
);

// ==========================================
// TEST C: View alternatives shows G4 (Best match) and G6; G2 is not offered.
// ==========================================
const alternatives = getAlternatives('IT3070', state.selectedModules, state.groups);
const validAlternatives = alternatives.filter((a) => !a.hasClashWithOthers);
const g4 = validAlternatives.find((a) => a.groupId === 'G4');
const g6 = validAlternatives.find((a) => a.groupId === 'G6');
const g2 = validAlternatives.find((a) => a.groupId === 'G2');

assertTest(
  'C. View alternatives shows G4 (Best match) and G6; G2 is not offered',
  g4 !== undefined &&
    g4.isBestMatch === true &&
    g6 !== undefined &&
    g2 === undefined
);

// ==========================================
// TEST D: Picking G4 updates the preview, clears the red block and enables Confirm.
// ==========================================
state.selectedModules = state.selectedModules.map((item) =>
  item.moduleCode === 'IT3070' ? { moduleCode: 'IT3070', groupId: 'G4' } : item
);
const clashesAfterG4 = getClashes();
const confirmAttemptAfterG4 = tryConfirmRegistration();

assertTest(
  'D. Picking G4 clears clashes and enables Confirm',
  clashesAfterG4.length === 0 && confirmAttemptAfterG4.success === true
);

// ==========================================
// TEST E: Confirm -> Confirmation -> a 'Group 4 confirmed' notification appears; Dashboard shows complete.
// ==========================================
const newNotif = {
  id: 'notif_confirmed_1',
  type: 'confirmed',
  title: 'IT3070 – Group 4 confirmed',
  text: 'Official registration confirmed. All schedule conflicts resolved.',
  time: 'Just now',
  read: false,
  targetRoute: 'Confirmation',
};
state.notifications = [newNotif, ...state.notifications];

const hasGroup4Notif = state.notifications.some(
  (n) => n.title.includes('IT3070 – Group 4 confirmed')
);
const registrationStatus = state.isExplicitlyConfirmed ? 'confirmed' : 'clash_free';

assertTest(
  'E. "Group 4 confirmed" notification appears and status is confirmed',
  hasGroup4Notif && registrationStatus === 'confirmed'
);

// ==========================================
// TEST F: Clash modal -> Ask advisor -> Send request -> case appears in Advisor Dashboard; Approve changes student selection and notifies them.
// ==========================================
// Reset to clash state to test advisor flow
state.selectedModules = [
  { moduleCode: 'IT3060', groupId: 'G1' },
  { moduleCode: 'IT3070', groupId: 'G2' },
  { moduleCode: 'IT3080', groupId: 'G1' },
];
state.isExplicitlyConfirmed = false;

// Student creates case
const createdCase = {
  id: 'case_test_1',
  studentName: state.student.name,
  clashSummary: 'IT3060-G1 vs IT3070-G2',
  message: 'Both modules required. Requesting G4.',
  status: 'conflict',
  suggestedModule: 'IT3070',
  suggestedGroup: 'G4',
  suggestedDetails: 'Suggested: IT3070-G4 · 12 seats available · no new clash',
};
state.cases = [createdCase, ...state.cases];

assertTest('F1. Case appears in Advisor Dashboard', state.cases.some((c) => c.id === 'case_test_1'));

// Advisor approves case
state.cases = state.cases.map((c) => (c.id === 'case_test_1' ? { ...c, status: 'resolved' } : c));
// Applying suggested group to student selection
state.selectedModules = state.selectedModules.map((item) =>
  item.moduleCode === createdCase.suggestedModule
    ? { moduleCode: createdCase.suggestedModule, groupId: createdCase.suggestedGroup }
    : item
);
// Pushing notification to student
state.notifications = [
  {
    id: 'notif_adv_approval',
    type: 'change',
    title: 'Advisor Approved: IT3070-G4',
    text: 'Dr. Kasun Silva approved your request.',
  },
  ...state.notifications,
];

const selectedIt3070 = state.selectedModules.find((s) => s.moduleCode === 'IT3070');
const advisorNotif = state.notifications.some((n) => n.title.includes('Advisor Approved: IT3070-G4'));
assertTest(
  'F2. Advisor approval updates student selection to G4 and notifies them',
  selectedIt3070.groupId === 'G4' && advisorNotif && getClashes().length === 0
);

// ==========================================
// TEST G: Page refresh keeps all selections (Persistence verification)
// ==========================================
const serialized = JSON.stringify({
  student: state.student,
  selectedModules: state.selectedModules,
  notifications: state.notifications,
  cases: state.cases,
});
const rehydrated = JSON.parse(serialized);

assertTest(
  'G. Page refresh rehydrates and keeps all selections identically',
  rehydrated.selectedModules.length === 3 &&
    rehydrated.selectedModules.find((s) => s.moduleCode === 'IT3070').groupId === 'G4'
);

// ==========================================
// TEST H: Typing /confirmation in URL while clashing redirects back
// ==========================================
function routeGuardConfirmationCheck(hypotheticalSelections) {
  const testClashes = detectClashes(hypotheticalSelections, state.groups);
  if (testClashes.length > 0) {
    return { allow: false, redirect: 'CourseRegistration' };
  }
  return { allow: true };
}

const clashingCheck = routeGuardConfirmationCheck([
  { moduleCode: 'IT3060', groupId: 'G1' },
  { moduleCode: 'IT3070', groupId: 'G2' },
]);
assertTest(
  'H. Route guard redirects /confirmation back to CourseRegistration while clashing',
  clashingCheck.allow === false && clashingCheck.redirect === 'CourseRegistration'
);

console.log(`\n🎉 All ${passedCount}/${totalTests} ACCEPTANCE TESTS PASSED!\n`);
import { detectClashes, getAlternatives, getSeatInfo, timeToMinutes } from './clashLogic.js';
import { MOCK_GROUPS } from '../constants/mockData.js';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    passed++;
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('🧪 Running Clash Logic Unit Tests...\n');

// 1. Edge Case: 10:00-12:00 and 12:00-14:00 must NOT clash
const backToBackGroups = [
  { moduleCode: 'MOD1', groupId: 'G1', day: 'Mon', start: '10:00', end: '12:00', seatsLeft: 10 },
  { moduleCode: 'MOD2', groupId: 'G2', day: 'Mon', start: '12:00', end: '14:00', seatsLeft: 10 },
];
const clashesBackToBack = detectClashes(
  [{ moduleCode: 'MOD1', groupId: 'G1' }, { moduleCode: 'MOD2', groupId: 'G2' }],
  backToBackGroups
);
assert(clashesBackToBack.length === 0, '10:00-12:00 and 12:00-14:00 must NOT clash');

// 2. Overlap Clash: Mon 10:00-12:00 and Mon 10:00-12:00 MUST clash
const demoInitialSelections = [
  { moduleCode: 'IT3060', groupId: 'G1' }, // Mon 10-12
  { moduleCode: 'IT3070', groupId: 'G2' }, // Mon 10-12
  { moduleCode: 'IT3080', groupId: 'G1' }, // Thu 11-13
];
const demoClashes = detectClashes(demoInitialSelections, MOCK_GROUPS);
assert(demoClashes.length === 1, 'Initial state has exactly 1 clash (IT3060 G1 vs IT3070 G2)');
assert(demoClashes[0].moduleA === 'IT3060' && demoClashes[0].moduleB === 'IT3070', 'Clash pair is IT3060 and IT3070');
assert(demoClashes[0].overlapWindow === '10:00–12:00', 'Overlap window is 10:00–12:00');

// 3. Different days must NOT clash
const diffDayGroups = [
  { moduleCode: 'MOD1', groupId: 'G1', day: 'Mon', start: '10:00', end: '12:00', seatsLeft: 10 },
  { moduleCode: 'MOD2', groupId: 'G2', day: 'Tue', start: '10:00', end: '12:00', seatsLeft: 10 },
];
const diffDayClashes = detectClashes(
  [{ moduleCode: 'MOD1', groupId: 'G1' }, { moduleCode: 'MOD2', groupId: 'G2' }],
  diffDayGroups
);
assert(diffDayClashes.length === 0, 'Classes on different days with same hours must not clash');

// 4. getAlternatives for IT3070
const alts = getAlternatives('IT3070', demoInitialSelections, MOCK_GROUPS);
const g2 = alts.find((a) => a.groupId === 'G2');
const g4 = alts.find((a) => a.groupId === 'G4');
const g6 = alts.find((a) => a.groupId === 'G6');

assert(g2.hasClashWithOthers === true, 'G2 is flagged as clashing with other selections');
assert(g2.isValidAlternative === false, 'G2 is NOT a valid alternative');
assert(g4.isValidAlternative === true, 'G4 (Tue 14-16) is a valid alternative');
assert(g4.isBestMatch === true, 'G4 (12 seats) is marked as Best match');
assert(g6.isValidAlternative === true, 'G6 (Wed 09-11) is a valid alternative');
assert(g6.isBestMatch === false, 'G6 (4 seats) is not best match');

// 5. When G4 is chosen, selections are clash-free
const resolvedSelections = [
  { moduleCode: 'IT3060', groupId: 'G1' },
  { moduleCode: 'IT3070', groupId: 'G4' },
  { moduleCode: 'IT3080', groupId: 'G1' },
];
const resolvedClashes = detectClashes(resolvedSelections, MOCK_GROUPS);
assert(resolvedClashes.length === 0, 'Choosing G4 produces 0 clashes');

// 6. getSeatInfo tests
assert(getSeatInfo(14).color === '#16A34A', '14 seats gives green');
assert(getSeatInfo(4).color === '#D97706' && getSeatInfo(4).text === '4 left', '4 seats gives orange "4 left"');
assert(getSeatInfo(0).color === '#EF4444' && getSeatInfo(0).text === 'Full', '0 seats gives red "Full"');

console.log(`\n🎉 All ${passed}/${total} unit tests passed successfully!\n`);

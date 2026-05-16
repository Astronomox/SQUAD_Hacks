// 200 seeded Nigerian government employees, including 15 ghost workers with
// distinct fraud patterns wired to the riskScoring engine in utils/riskScoring.js.

// ---- Name pool -------------------------------------------------------------
const FIRST_NAMES = [
  'Adaeze','Chinedu','Tunde','Aisha','Fatima','Ngozi','Babatunde','Olumide','Zainab','Emeka',
  'Halima','Ifeoma','Yusuf','Kemi','Chinonso','Bola','Hauwa','Segun','Folake','Musa',
  'Bukola','Ahmed','Chiamaka','Damilola','Ebube','Funke','Gbenga','Ikenna','Jumai','Kelechi',
  'Lola','Mariam','Nneka','Obinna','Patience','Rasheed','Sade','Taiwo','Uche','Victor',
  'Wale','Yemi','Zara','Adamu','Bisola','Chidi','Doyin','Esther','Femi','Grace',
  'Hassan','Ireti','James','Khadija','Lucky','Mojisola','Nkechi','Oluwaseun','Philip','Queen',
  'Ridwan','Salim','Tope','Umar','Veronica','Williams','Yetunde','Zubair','Abiola','Blessing',
];

const LAST_NAMES = [
  'Okafor','Adekunle','Bello','Yusuf','Eze','Mohammed','Adeyemi','Nwosu','Ibrahim','Oluwaseun',
  'Abubakar','Onyekachi','Adebayo','Sani','Ojo','Lawal','Uche','Garba','Afolabi','Danjuma',
  'Olawale','Okonkwo','Suleiman','Akinyemi','Okoli','Aliyu','Aminu','Balogun','Chukwu','Dada',
  'Eboh','Fadipe','Gbadamosi','Haruna','Ikpeazu','Jegede','Kanu','Lawal','Mbah','Nnaji',
];

// ---- Department definitions -----------------------------------------------
export const DEPARTMENTS = [
  { name: 'Ministry of Education',       short: 'Education',     count: 45, medianSalary: 165000, roles: ['Senior Teacher','Principal','Education Officer','School Inspector','Curriculum Lead'] },
  { name: 'Ministry of Health',          short: 'Health',        count: 38, medianSalary: 195000, roles: ['Medical Officer','Senior Nurse','Pharmacist','Health Records Officer','Laboratory Scientist'] },
  { name: 'Civil Service Commission',    short: 'Civil Service', count: 42, medianSalary: 145000, roles: ['Administrative Officer','HR Specialist','Records Clerk','Compliance Analyst','Policy Officer'] },
  { name: 'Ministry of Works',           short: 'Works',         count: 35, medianSalary: 175000, roles: ['Site Engineer','Project Manager','Procurement Officer','Survey Technician','Maintenance Supervisor'] },
  { name: 'Ministry of Finance',         short: 'Finance',       count: 40, medianSalary: 185000, roles: ['Accountant','Internal Auditor','Tax Officer','Budget Analyst','Treasury Officer'] },
];

const BANKS = [
  { code: '058', name: 'GTBank' },
  { code: '044', name: 'Access Bank' },
  { code: '011', name: 'First Bank' },
  { code: '057', name: 'Zenith Bank' },
  { code: '033', name: 'UBA' },
  { code: '232', name: 'Sterling Bank' },
  { code: '076', name: 'Polaris Bank' },
];

// Deterministic RNG (so the demo dataset is stable across reloads)
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xFFFFFFFF;
  };
}
const rand = rng(424242);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];


// ─── NIN generator (deterministic, 11 digits per employee) ───────────────────
function generateNIN(seqId) {
  // Seed from seqId so each employee always gets the same NIN
  const base = 10000000000 + (seqId * 9371337) % 89999999999;
  return String(base).slice(0, 11).padStart(11, '0');
}

// ─── Email generator (unique per employee) ────────────────────────────────────
function generateEmail(fullName, seqId) {
  const clean = fullName.toLowerCase()
    .replace(/[^a-z ]/g, '')
    .trim()
    .split(' ')
    .filter(Boolean);
  const first = clean[0] || 'user';
  const last  = clean[1] || String(seqId);
  return `${first}.${last}${seqId}@kogi.gov.ng`;
}

// ─── Phone generator (valid Nigerian format) ──────────────────────────────────
function generatePhone(seqId) {
  const prefixes = ['0803','0806','0813','0816','0703','0706','0803','0901','0907','0814'];
  const prefix = prefixes[seqId % prefixes.length];
  const suffix = String(1000000 + (seqId * 7919) % 9000000).slice(0, 7);
  return `${prefix}${suffix}`;
}

// ---- Build a clean (legitimate) employee ----------------------------------
function makeCleanEmployee(seqId, dept) {
  const enrollYear = 2018 + Math.floor(rand() * 7);
  const enrollMonth = 1 + Math.floor(rand() * 12);
  const enrollDay = 1 + Math.floor(rand() * 28);
  const enrollHour = 8 + Math.floor(rand() * 10); // working hours
  const lastAttDays = Math.floor(rand() * 14); // recent
  const lastAtt = new Date();
  lastAtt.setDate(lastAtt.getDate() - lastAttDays);

  const bank = pick(BANKS);
  const variance = (rand() - 0.5) * 0.4; // ±20% of median
  const salary = Math.round(dept.medianSalary * (1 + variance) / 1000) * 1000;

  const fullName = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  return {
    id:  generateNIN(seqId),   // NIN is the unique ID
    fullName,
    nin: generateNIN(seqId),
    email:      generateEmail(fullName, seqId),
    phone:      generatePhone(seqId),
    department: dept.name,
    role: pick(dept.roles),
    salaryAmount: salary,
    bankAccount: String(Math.floor(rand() * 9e9 + 1e9)),
    bankCode: bank.code,
    bankName: bank.name,
    enrollmentDate: `${enrollYear}-${String(enrollMonth).padStart(2, '0')}-${String(enrollDay).padStart(2, '0')}T${String(enrollHour).padStart(2, '0')}:${String(Math.floor(rand() * 60)).padStart(2, '0')}:00`,
    enrollmentBatchId: `BATCH-${enrollYear}-Q${Math.ceil(enrollMonth / 3)}`,
    lastAttendance: lastAtt.toISOString().slice(0, 10),
    ipAtEnrollment: `197.${Math.floor(rand() * 250)}.${Math.floor(rand() * 250)}.${Math.floor(rand() * 250)}`,
    deviceFingerprint: 'fp_' + Math.random().toString(36).slice(2, 10),
    status: 'verified',
    trustScore: 92 + Math.floor(rand() * 8),
    riskScore: Math.floor(rand() * 12),
    verificationStatus: 'passed',
    squadDisbursementRef: `SQ-2025-TXN-${String(seqId).padStart(5, '0')}`,
  };
}

// ---- Ghost worker patterns ------------------------------------------------
// Pattern A — Bulk enrollment fraud (5 employees, IDs 89-93)
function makePatternA(seqId, dept, indexInBatch) {
  const bank = pick(BANKS);
  const fullName = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  return {
    id:  generateNIN(seqId),
    fullName,
    nin:  generateNIN(seqId),
    email: generateEmail(fullName, seqId),
    phone: generatePhone(seqId),
    department: dept.name,
    role: pick(dept.roles),
    salaryAmount: 220000,
    bankAccount: String(Math.floor(rand() * 9e9 + 1e9)),
    bankCode: bank.code,
    bankName: bank.name,
    enrollmentDate: '2025-02-14T0' + (indexInBatch < 5 ? '2' : '3') + ':' + String(11 + indexInBatch * 7).padStart(2, '0') + ':00',
    enrollmentBatchId: 'BATCH-GHOST-001',
    lastAttendance: null,
    ipAtEnrollment: '41.58.102.77',
    deviceFingerprint: 'fp_a1b2c3d4',
    status: 'blocked',
    trustScore: 4,
    riskScore: 96 - indexInBatch * 2,
    verificationStatus: 'blocked',
    squadDisbursementRef: null,
    _pattern: 'A',
  };
}

// Pattern B — Duplicate identity (4 employees)
function makePatternB(seqId, dept, indexInBatch) {
  const bank = BANKS[1]; // Access
  return {
    id: generateNIN(seqId),
    fullName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    department: dept.name,
    role: pick(dept.roles),
    salaryAmount: 220000,
    bankAccount: '0144' + String(720000 + indexInBatch).slice(-6),
    bankCode: bank.code,
    bankName: bank.name,
    enrollmentDate: `2024-11-${10 + indexInBatch * 3}T14:22:00`,
    enrollmentBatchId: 'BATCH-2024-Q4',
    lastAttendance: '2025-01-15',
    ipAtEnrollment: '102.89.44.71',
    deviceFingerprint: 'fp_ghost_device_b',
    status: 'blocked',
    trustScore: 16,
    riskScore: 84 - indexInBatch * 2,
    verificationStatus: 'blocked',
    squadDisbursementRef: null,
    _pattern: 'B',
  };
}

// Pattern C — Deceased / inactive (3 employees)
function makePatternC(seqId, dept) {
  const bank = pick(BANKS);
  return {
    id: generateNIN(seqId),
    fullName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    department: dept.name,
    role: pick(dept.roles),
    salaryAmount: dept.medianSalary,
    bankAccount: String(Math.floor(rand() * 9e9 + 1e9)),
    bankCode: bank.code,
    bankName: bank.name,
    enrollmentDate: '2019-04-12T10:00:00',
    enrollmentBatchId: 'BATCH-2019-Q2',
    lastAttendance: null,
    ipAtEnrollment: `105.112.${Math.floor(rand() * 250)}.${Math.floor(rand() * 250)}`,
    deviceFingerprint: 'fp_' + Math.random().toString(36).slice(2, 10),
    status: 'flagged',
    trustScore: 24,
    riskScore: 71 + Math.floor(rand() * 6),
    verificationStatus: 'review',
    squadDisbursementRef: null,
    _pattern: 'C',
  };
}

// Pattern D — Salary anomaly (3 employees)
function makePatternD(seqId, dept) {
  const bank = pick(BANKS);
  return {
    id: generateNIN(seqId),
    fullName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    department: dept.name,
    role: pick(dept.roles),
    salaryAmount: dept.medianSalary * 5, // 5× outlier
    bankAccount: String(Math.floor(rand() * 9e9 + 1e9)),
    bankCode: bank.code,
    bankName: bank.name,
    enrollmentDate: '2023-08-21T09:30:00',
    enrollmentBatchId: `BATCH-2023-Q3`,
    lastAttendance: '2025-04-22',
    ipAtEnrollment: `197.210.${Math.floor(rand() * 250)}.${Math.floor(rand() * 250)}`,
    deviceFingerprint: 'fp_' + Math.random().toString(36).slice(2, 10),
    status: 'flagged',
    trustScore: 35,
    riskScore: 65 + Math.floor(rand() * 6),
    verificationStatus: 'review',
    squadDisbursementRef: null,
    _pattern: 'D',
  };
}

// ---- Assemble dataset -----------------------------------------------------
function buildEmployees() {
  const out = [];
  let id = 1;

  // Pattern A — 5 ghost workers in Education, IDs 89-93
  const eduDept = DEPARTMENTS[0];
  for (let i = 0; i < 88; i++, id++) out.push(makeCleanEmployee(id, eduDept));
  for (let i = 0; i < 5; i++, id++)  out.push(makePatternA(id, eduDept, i));

  // Fill remaining Education
  for (let i = 0; i < (eduDept.count - 88 - 5 + 10); i++, id++) out.push(makeCleanEmployee(id, eduDept));

  // Health — 38 clean + 4 Pattern B
  const hDept = DEPARTMENTS[1];
  for (let i = 0; i < 34; i++, id++) out.push(makeCleanEmployee(id, hDept));
  for (let i = 0; i < 4; i++, id++)  out.push(makePatternB(id, hDept, i));

  // Civil Service — 42 clean + 3 Pattern C
  const csDept = DEPARTMENTS[2];
  for (let i = 0; i < 39; i++, id++) out.push(makeCleanEmployee(id, csDept));
  for (let i = 0; i < 3; i++, id++)  out.push(makePatternC(id, csDept));

  // Works — 35 clean + 3 Pattern D
  const wDept = DEPARTMENTS[3];
  for (let i = 0; i < 32; i++, id++) out.push(makeCleanEmployee(id, wDept));
  for (let i = 0; i < 3; i++, id++)  out.push(makePatternD(id, wDept));

  // Finance — 40 clean
  const fDept = DEPARTMENTS[4];
  for (let i = 0; i < 40; i++, id++) out.push(makeCleanEmployee(id, fDept));


  // ─── Real employee — NIN: 93146458248 ──────────────────────────────────────
  out.push({
    id:                   '93146458248',   // NIN is the unique ID
    fullName:             'Abdullahi Oriola',
    nin:                  '93146458248',
    ninStatus:            'VERIFIED',
    email:                'abdullahioriola02@gmail.com',
    phone:                '08012345678',
    department:           'Civil Service Commission',
    role:                 'Senior Officer',
    salaryAmount:         185000,
    bankAccount:          '3459077679',
    bankCode:             '076',
    bankName:             'Polaris Bank',
    enrollmentDate:       '2024-01-15T09:00:00',
    enrollmentBatchId:    'BATCH-2024-Q1',
    lastAttendance:       '2025-05-15',
    ipAtEnrollment:       '197.210.64.100',
    deviceFingerprint:    'fp_abdullahi01',
    status:               'verified',
    trustScore:           98,
    riskScore:            2,
    verificationStatus:   'passed',
    squadDisbursementRef: 'SQ-2025-TXN-REAL01',
  });

  return out;
}

export const EMPLOYEES = buildEmployees();

// Helper accessors
export const GHOST_EMPLOYEES   = EMPLOYEES.filter(e => e._pattern);
export const VERIFIED_EMPLOYEES = EMPLOYEES.filter(e => e.status === 'verified');
export const FLAGGED_EMPLOYEES  = EMPLOYEES.filter(e => e.status === 'flagged');
export const BLOCKED_EMPLOYEES  = EMPLOYEES.filter(e => e.status === 'blocked');

/** Find by id */
export function getEmployee(id) {
  return EMPLOYEES.find(e => e.id === id);
}

/** Top fraud cases for the demo table */
export const TOP_FRAUD_CASES = [...GHOST_EMPLOYEES].sort((a, b) => b.riskScore - a.riskScore);

/** Aggregate counts per department for the dashboard chart */
export function departmentStats() {
  return DEPARTMENTS.map(d => {
    const members = EMPLOYEES.filter(e => e.department === d.name);
    return {
      department: d.short,
      verified: members.filter(e => e.status === 'verified').length,
      flagged:  members.filter(e => e.status === 'flagged').length,
      blocked:  members.filter(e => e.status === 'blocked').length,
    };
  });
}

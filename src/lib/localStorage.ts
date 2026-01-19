// localStorage-based data layer for static deployment
import { Patient, HandoverNote, HospitalAtNightEntry, HaNComment } from './types';

const STORAGE_KEYS = {
  patients: 'handover_patients',
  handoverNotes: 'handover_notes',
  hospitalAtNight: 'hospital_at_night',
  initialized: 'handover_initialized'
};

// Check if we're in browser
const isBrowser = typeof window !== 'undefined';

// Helper to safely access localStorage
function getStorage<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Sample demo data
const samplePatients: Patient[] = [
  {
    id: 'p1',
    nhsNumber: '1234567890',
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: '1955-03-15',
    ward: 'Ward 1',
    bedNumber: '1A',
    consultant: 'Dr. Williams',
    admissionDate: '2025-01-15',
    diagnosis: 'Community Acquired Pneumonia',
    allergies: 'Penicillin',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p2',
    nhsNumber: '2345678901',
    firstName: 'Mary',
    lastName: 'Johnson',
    dateOfBirth: '1948-07-22',
    ward: 'Ward 1',
    bedNumber: '2B',
    consultant: 'Dr. Thompson',
    admissionDate: '2025-01-14',
    diagnosis: 'Acute Kidney Injury',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p3',
    nhsNumber: '3456789012',
    firstName: 'Robert',
    lastName: 'Davies',
    dateOfBirth: '1962-11-08',
    ward: 'Ward 2',
    bedNumber: '5A',
    consultant: 'Dr. Williams',
    admissionDate: '2025-01-16',
    diagnosis: 'COPD Exacerbation',
    allergies: 'Aspirin, Ibuprofen',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p4',
    nhsNumber: '4567890123',
    firstName: 'Susan',
    lastName: 'Wilson',
    dateOfBirth: '1970-05-30',
    ward: 'Ward 2',
    bedNumber: '6B',
    consultant: 'Dr. Thompson',
    admissionDate: '2025-01-17',
    diagnosis: 'Cellulitis - Left Lower Limb',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p5',
    nhsNumber: '5678901234',
    firstName: 'James',
    lastName: 'Brown',
    dateOfBirth: '1940-12-01',
    ward: 'Ward 3',
    bedNumber: '10A',
    consultant: 'Dr. Patel',
    admissionDate: '2025-01-13',
    diagnosis: 'Heart Failure',
    allergies: 'Codeine',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 6,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const sampleHandoverNotes: HandoverNote[] = [
  {
    id: 'h1',
    patientId: 'p1',
    createdBy: 'Nurse Adams',
    createdAt: new Date().toISOString(),
    shiftDate: new Date().toISOString().split('T')[0],
    shiftType: 'Day',
    situation: 'Patient admitted with productive cough, fever, and shortness of breath. Chest X-ray confirmed right lower lobe pneumonia.',
    background: '70-year-old male with history of Type 2 Diabetes and Hypertension. Non-smoker. Lives alone but independent with ADLs.',
    assessment: 'Temperature 38.2°C, HR 95, BP 135/82, RR 22, SpO2 94% on 2L O2. Crackles heard in right base. IV antibiotics started.',
    recommendation: 'Continue IV Co-amoxiclav. Monitor oxygen requirements. Repeat bloods tomorrow. Consider physio referral if not improving.'
  },
  {
    id: 'h2',
    patientId: 'p2',
    createdBy: 'Dr. Chen',
    createdAt: new Date().toISOString(),
    shiftDate: new Date().toISOString().split('T')[0],
    shiftType: 'Day',
    situation: 'AKI on background of CKD Stage 3. Creatinine risen from baseline 120 to 280. Urine output reduced.',
    background: '76-year-old female with CKD3, HTN, and Osteoarthritis. Recently started on NSAIDs by GP for joint pain.',
    assessment: 'Clinically dry. JVP not visible. USS kidneys shows no obstruction. Likely pre-renal AKI precipitated by NSAIDs and dehydration.',
    recommendation: 'Stop NSAIDs. IV fluids 1L over 8 hours. Strict fluid balance. Recheck U&Es in morning. Consider renal referral if not improving.'
  },
  {
    id: 'h3',
    patientId: 'p5',
    createdBy: 'Nurse Williams',
    createdAt: new Date().toISOString(),
    shiftDate: new Date().toISOString().split('T')[0],
    shiftType: 'Night',
    situation: 'Increasing shortness of breath overnight. Required increase in oxygen from 2L to 4L to maintain SpO2 >92%.',
    background: '84-year-old male with known heart failure (EF 30%), AF, and CKD4. On maximum diuretic therapy.',
    assessment: 'Bilateral pitting oedema to knees. Bibasal crackles. Elevated JVP. Weight up 2kg from admission. ECG shows AF with rate 110.',
    recommendation: 'Needs medical review for IV diuretics. Consider cardiology input. DNACPR in place - for ward-based care only.'
  }
];

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const sampleHospitalAtNight: HospitalAtNightEntry[] = [
  {
    id: 'han1',
    patientId: 'p2',
    reviewDates: [{ date: today, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SHO', 'SpR'],
    reasonForReview: 'Review U&Es and fluid status. May need IV diuretics if not responding to oral.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Dr. Chen',
    comments: []
  },
  {
    id: 'han2',
    patientId: 'p5',
    reviewDates: [{ date: today, completedAt: undefined }, { date: tomorrow, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SpR'],
    reasonForReview: 'Deteriorating heart failure. Needs senior review for escalation of diuretic therapy.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Nurse Williams',
    comments: [
      {
        id: 'c1',
        text: 'Cardiology aware - will review in morning if still requiring >4L O2',
        createdBy: 'Dr. Thompson',
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'han3',
    patientId: 'p1',
    reviewDates: [{ date: today, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['FY1'],
    reasonForReview: 'Check evening observations and review oxygen requirements.',
    reviewStatus: 'Pending',
    reviewType: 'Ad-hoc',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Nurse Adams',
    comments: []
  }
];

// Initialize with sample data if empty
export function initializeData(): void {
  if (!isBrowser) return;

  const initialized = localStorage.getItem(STORAGE_KEYS.initialized);
  if (!initialized) {
    setStorage(STORAGE_KEYS.patients, samplePatients);
    setStorage(STORAGE_KEYS.handoverNotes, sampleHandoverNotes);
    setStorage(STORAGE_KEYS.hospitalAtNight, sampleHospitalAtNight);
    localStorage.setItem(STORAGE_KEYS.initialized, 'true');
  }
}

// Patient functions
export function getAllPatients(activeOnly = true): Patient[] {
  const patients = getStorage<Patient[]>(STORAGE_KEYS.patients, []);
  if (activeOnly) {
    return patients.filter(p => p.isActive).sort((a, b) => {
      if (a.ward !== b.ward) return a.ward.localeCompare(b.ward);
      return a.bedNumber.localeCompare(b.bedNumber);
    });
  }
  return patients.sort((a, b) => {
    if (a.ward !== b.ward) return a.ward.localeCompare(b.ward);
    return a.bedNumber.localeCompare(b.bedNumber);
  });
}

export function getPatientById(id: string): Patient | undefined {
  const patients = getStorage<Patient[]>(STORAGE_KEYS.patients, []);
  return patients.find(p => p.id === id);
}

export function getPatientsByWard(ward: string): Patient[] {
  const patients = getAllPatients(true);
  return patients.filter(p => p.ward === ward);
}

export function createPatient(patient: Patient): Patient {
  const patients = getStorage<Patient[]>(STORAGE_KEYS.patients, []);
  patients.push(patient);
  setStorage(STORAGE_KEYS.patients, patients);
  return patient;
}

export function updatePatient(id: string, updates: Partial<Patient>): Patient | undefined {
  const patients = getStorage<Patient[]>(STORAGE_KEYS.patients, []);
  const index = patients.findIndex(p => p.id === id);
  if (index === -1) return undefined;

  patients[index] = { ...patients[index], ...updates, updatedAt: new Date().toISOString() };
  setStorage(STORAGE_KEYS.patients, patients);
  return patients[index];
}

export function dischargePatient(id: string): boolean {
  const result = updatePatient(id, { isActive: false });
  return !!result;
}

export function deletePatient(id: string): boolean {
  const patients = getStorage<Patient[]>(STORAGE_KEYS.patients, []);
  const index = patients.findIndex(p => p.id === id);
  if (index === -1) return false;

  patients.splice(index, 1);
  setStorage(STORAGE_KEYS.patients, patients);
  return true;
}

// Handover note functions
export function getAllHandoverNotes(): HandoverNote[] {
  return getStorage<HandoverNote[]>(STORAGE_KEYS.handoverNotes, [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getHandoverNotesByPatient(patientId: string): HandoverNote[] {
  return getAllHandoverNotes().filter(n => n.patientId === patientId);
}

export function getHandoverNoteById(id: string): HandoverNote | undefined {
  const notes = getStorage<HandoverNote[]>(STORAGE_KEYS.handoverNotes, []);
  return notes.find(n => n.id === id);
}

export function getLatestHandoverForPatient(patientId: string): HandoverNote | undefined {
  const notes = getHandoverNotesByPatient(patientId);
  return notes[0];
}

export function getHandoverNotesByDate(shiftDate: string): HandoverNote[] {
  return getAllHandoverNotes().filter(n => n.shiftDate === shiftDate);
}

export function createHandoverNote(note: HandoverNote): HandoverNote {
  const notes = getStorage<HandoverNote[]>(STORAGE_KEYS.handoverNotes, []);
  notes.push(note);
  setStorage(STORAGE_KEYS.handoverNotes, notes);
  return note;
}

export function updateHandoverNote(id: string, updates: Partial<HandoverNote>): HandoverNote | undefined {
  const notes = getStorage<HandoverNote[]>(STORAGE_KEYS.handoverNotes, []);
  const index = notes.findIndex(n => n.id === id);
  if (index === -1) return undefined;

  notes[index] = { ...notes[index], ...updates };
  setStorage(STORAGE_KEYS.handoverNotes, notes);
  return notes[index];
}

export function deleteHandoverNote(id: string): boolean {
  const notes = getStorage<HandoverNote[]>(STORAGE_KEYS.handoverNotes, []);
  const index = notes.findIndex(n => n.id === id);
  if (index === -1) return false;

  notes.splice(index, 1);
  setStorage(STORAGE_KEYS.handoverNotes, notes);
  return true;
}

// Hospital at Night functions
export function getAllHospitalAtNightEntries(): HospitalAtNightEntry[] {
  return getStorage<HospitalAtNightEntry[]>(STORAGE_KEYS.hospitalAtNight, [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getHospitalAtNightById(id: string): HospitalAtNightEntry | undefined {
  const entries = getStorage<HospitalAtNightEntry[]>(STORAGE_KEYS.hospitalAtNight, []);
  return entries.find(e => e.id === id);
}

export function getHospitalAtNightByPatient(patientId: string): HospitalAtNightEntry[] {
  return getAllHospitalAtNightEntries().filter(e => e.patientId === patientId);
}

export function createHospitalAtNightEntry(entry: HospitalAtNightEntry): HospitalAtNightEntry {
  const entries = getStorage<HospitalAtNightEntry[]>(STORAGE_KEYS.hospitalAtNight, []);
  entries.push(entry);
  setStorage(STORAGE_KEYS.hospitalAtNight, entries);
  return entry;
}

export function updateHospitalAtNightEntry(id: string, updates: Partial<HospitalAtNightEntry>): HospitalAtNightEntry | undefined {
  const entries = getStorage<HospitalAtNightEntry[]>(STORAGE_KEYS.hospitalAtNight, []);
  const index = entries.findIndex(e => e.id === id);
  if (index === -1) return undefined;

  entries[index] = { ...entries[index], ...updates };
  setStorage(STORAGE_KEYS.hospitalAtNight, entries);
  return entries[index];
}

export function deleteHospitalAtNightEntry(id: string): boolean {
  const entries = getStorage<HospitalAtNightEntry[]>(STORAGE_KEYS.hospitalAtNight, []);
  const index = entries.findIndex(e => e.id === id);
  if (index === -1) return false;

  entries.splice(index, 1);
  setStorage(STORAGE_KEYS.hospitalAtNight, entries);
  return true;
}

// Utility functions
export function getUniqueWards(): string[] {
  const patients = getAllPatients(true);
  const wards = [...new Set(patients.map(p => p.ward))];
  return wards.sort();
}

export function getPatientsWithLatestHandover(): (Patient & { latestHandover?: HandoverNote })[] {
  const patients = getAllPatients();
  return patients.map(patient => ({
    ...patient,
    latestHandover: getLatestHandoverForPatient(patient.id)
  }));
}

// Reset data (useful for demo)
export function resetToSampleData(): void {
  if (!isBrowser) return;
  localStorage.removeItem(STORAGE_KEYS.initialized);
  initializeData();
}

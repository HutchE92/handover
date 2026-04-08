// localStorage-based data layer for static deployment
import { Patient, HandoverNote, HospitalAtNightEntry, HaNComment, SpecialtyReferral, ReferralComment, PatientTask, TaskComment } from './types';

const STORAGE_KEYS = {
  patients: 'handover_patients',
  handoverNotes: 'handover_notes',
  hospitalAtNight: 'hospital_at_night',
  specialtyReferrals: 'specialty_referrals',
  tasks: 'patient_tasks',
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

// Date helpers
const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const apr14 = '2026-04-14';
const apr15 = '2026-04-15';
const apr16 = '2026-04-16';

// Comprehensive sample demo data - 55 patients across 8 wards
const samplePatients: Patient[] = [
  // Ward 1 - General Medicine (8 patients)
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
    id: 'p6',
    nhsNumber: '6789012345',
    firstName: 'Patricia',
    lastName: 'Taylor',
    dateOfBirth: '1960-08-14',
    ward: 'Ward 1',
    bedNumber: '3A',
    consultant: 'Dr. Williams',
    admissionDate: '2025-01-16',
    diagnosis: 'Diabetic Ketoacidosis',
    allergies: 'Sulfonamides',
    resuscitationStatus: 'Full',
    earlyWarningScore: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p7',
    nhsNumber: '7890123456',
    firstName: 'Michael',
    lastName: 'Anderson',
    dateOfBirth: '1952-02-28',
    ward: 'Ward 1',
    bedNumber: '4B',
    consultant: 'Dr. Thompson',
    admissionDate: '2025-01-13',
    diagnosis: 'Atrial Fibrillation with Fast Ventricular Response',
    allergies: 'Amiodarone',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p8',
    nhsNumber: '8901234567',
    firstName: 'Elizabeth',
    lastName: 'Thomas',
    dateOfBirth: '1938-11-03',
    ward: 'Ward 1',
    bedNumber: '5A',
    consultant: 'Dr. Williams',
    admissionDate: '2025-01-12',
    diagnosis: 'Urinary Tract Infection with Sepsis',
    allergies: 'Trimethoprim',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 6,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p9',
    nhsNumber: '9012345678',
    firstName: 'William',
    lastName: 'Jackson',
    dateOfBirth: '1965-05-19',
    ward: 'Ward 1',
    bedNumber: '6B',
    consultant: 'Dr. Thompson',
    admissionDate: '2025-01-17',
    diagnosis: 'Acute Pancreatitis',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p10',
    nhsNumber: '0123456789',
    firstName: 'Margaret',
    lastName: 'White',
    dateOfBirth: '1945-09-07',
    ward: 'Ward 1',
    bedNumber: '7A',
    consultant: 'Dr. Williams',
    admissionDate: '2025-01-15',
    diagnosis: 'Hypoglycaemia - Type 2 Diabetes',
    allergies: 'Metformin (GI upset)',
    resuscitationStatus: 'Full',
    earlyWarningScore: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p11',
    nhsNumber: '1122334455',
    firstName: 'David',
    lastName: 'Harris',
    dateOfBirth: '1958-12-25',
    ward: 'Ward 1',
    bedNumber: '8B',
    consultant: 'Dr. Thompson',
    admissionDate: '2025-01-16',
    diagnosis: 'Acute Exacerbation of Asthma',
    allergies: 'Aspirin, NSAIDs',
    resuscitationStatus: 'Full',
    earlyWarningScore: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Ward 2 - General Medicine (8 patients)
  {
    id: 'p3',
    nhsNumber: '3456789012',
    firstName: 'Robert',
    lastName: 'Davies',
    dateOfBirth: '1962-11-08',
    ward: 'Ward 2',
    bedNumber: '1A',
    consultant: 'Dr. Patel',
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
    bedNumber: '2B',
    consultant: 'Dr. Patel',
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
    id: 'p12',
    nhsNumber: '2233445566',
    firstName: 'Jennifer',
    lastName: 'Martin',
    dateOfBirth: '1950-04-12',
    ward: 'Ward 2',
    bedNumber: '3A',
    consultant: 'Dr. Patel',
    admissionDate: '2025-01-14',
    diagnosis: 'Decompensated Liver Cirrhosis',
    allergies: 'Lactulose (intolerance)',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p13',
    nhsNumber: '3344556677',
    firstName: 'Charles',
    lastName: 'Garcia',
    dateOfBirth: '1972-06-18',
    ward: 'Ward 2',
    bedNumber: '4B',
    consultant: 'Dr. Patel',
    admissionDate: '2025-01-15',
    diagnosis: 'Pulmonary Embolism',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p14',
    nhsNumber: '4455667788',
    firstName: 'Barbara',
    lastName: 'Martinez',
    dateOfBirth: '1944-10-30',
    ward: 'Ward 2',
    bedNumber: '5A',
    consultant: 'Dr. Patel',
    admissionDate: '2025-01-13',
    diagnosis: 'Stroke - Left MCA Territory',
    allergies: 'Clopidogrel',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p15',
    nhsNumber: '5566778899',
    firstName: 'Thomas',
    lastName: 'Robinson',
    dateOfBirth: '1968-01-05',
    ward: 'Ward 2',
    bedNumber: '6B',
    consultant: 'Dr. Patel',
    admissionDate: '2025-01-16',
    diagnosis: 'Acute Coronary Syndrome - NSTEMI',
    allergies: 'Ticagrelor',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p16',
    nhsNumber: '6677889900',
    firstName: 'Linda',
    lastName: 'Clark',
    dateOfBirth: '1956-07-22',
    ward: 'Ward 2',
    bedNumber: '7A',
    consultant: 'Dr. Patel',
    admissionDate: '2025-01-17',
    diagnosis: 'Gastroenteritis with Dehydration',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p17',
    nhsNumber: '7788990011',
    firstName: 'Richard',
    lastName: 'Lewis',
    dateOfBirth: '1940-03-15',
    ward: 'Ward 2',
    bedNumber: '8B',
    consultant: 'Dr. Patel',
    admissionDate: '2025-01-14',
    diagnosis: 'Fall - Query Mechanical vs Syncope',
    allergies: 'Morphine (nausea)',
    resuscitationStatus: 'Not Discussed',
    earlyWarningScore: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Ward 3 - Cardiology (7 patients)
  {
    id: 'p5',
    nhsNumber: '5678901234',
    firstName: 'James',
    lastName: 'Brown',
    dateOfBirth: '1940-12-01',
    ward: 'Ward 3',
    bedNumber: '1A',
    consultant: 'Dr. Hughes',
    admissionDate: '2025-01-13',
    diagnosis: 'Heart Failure - EF 30%',
    allergies: 'Codeine',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 6,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p18',
    nhsNumber: '8899001122',
    firstName: 'Karen',
    lastName: 'Walker',
    dateOfBirth: '1963-09-10',
    ward: 'Ward 3',
    bedNumber: '2B',
    consultant: 'Dr. Hughes',
    admissionDate: '2025-01-15',
    diagnosis: 'Acute Heart Failure - New Diagnosis',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p19',
    nhsNumber: '9900112233',
    firstName: 'Steven',
    lastName: 'Hall',
    dateOfBirth: '1955-11-28',
    ward: 'Ward 3',
    bedNumber: '3A',
    consultant: 'Dr. Hughes',
    admissionDate: '2025-01-14',
    diagnosis: 'Complete Heart Block - Awaiting PPM',
    allergies: 'Contrast Dye',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p20',
    nhsNumber: '0011223344',
    firstName: 'Dorothy',
    lastName: 'Allen',
    dateOfBirth: '1947-02-14',
    ward: 'Ward 3',
    bedNumber: '4B',
    consultant: 'Dr. Hughes',
    admissionDate: '2025-01-16',
    diagnosis: 'Pericarditis',
    allergies: 'Colchicine',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p21',
    nhsNumber: '1122445566',
    firstName: 'Daniel',
    lastName: 'Young',
    dateOfBirth: '1959-08-05',
    ward: 'Ward 3',
    bedNumber: '5A',
    consultant: 'Dr. Hughes',
    admissionDate: '2025-01-12',
    diagnosis: 'Infective Endocarditis',
    allergies: 'Vancomycin (Red Man)',
    resuscitationStatus: 'Full',
    earlyWarningScore: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p22',
    nhsNumber: '2233556677',
    firstName: 'Nancy',
    lastName: 'King',
    dateOfBirth: '1952-04-20',
    ward: 'Ward 3',
    bedNumber: '6B',
    consultant: 'Dr. Hughes',
    admissionDate: '2025-01-17',
    diagnosis: 'Bradycardia - Sick Sinus Syndrome',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p23',
    nhsNumber: '3344667788',
    firstName: 'Paul',
    lastName: 'Wright',
    dateOfBirth: '1948-12-08',
    ward: 'Ward 3',
    bedNumber: '7A',
    consultant: 'Dr. Hughes',
    admissionDate: '2025-01-15',
    diagnosis: 'Post STEMI - Day 3',
    allergies: 'Statins (myalgia)',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Ward 4 - Respiratory (7 patients)
  {
    id: 'p24',
    nhsNumber: '4455778899',
    firstName: 'Sandra',
    lastName: 'Scott',
    dateOfBirth: '1957-06-30',
    ward: 'Ward 4',
    bedNumber: '1A',
    consultant: 'Dr. Mitchell',
    admissionDate: '2025-01-14',
    diagnosis: 'Pneumothorax - Post Chest Drain',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p25',
    nhsNumber: '5566889900',
    firstName: 'Kenneth',
    lastName: 'Green',
    dateOfBirth: '1943-10-15',
    ward: 'Ward 4',
    bedNumber: '2B',
    consultant: 'Dr. Mitchell',
    admissionDate: '2025-01-13',
    diagnosis: 'Lung Cancer - Palliative',
    allergies: 'Morphine (hallucinations)',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p26',
    nhsNumber: '6677990011',
    firstName: 'Betty',
    lastName: 'Adams',
    dateOfBirth: '1966-01-22',
    ward: 'Ward 4',
    bedNumber: '3A',
    consultant: 'Dr. Mitchell',
    admissionDate: '2025-01-16',
    diagnosis: 'Severe Asthma - ICU Stepdown',
    allergies: 'Aspirin',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p27',
    nhsNumber: '7788001122',
    firstName: 'George',
    lastName: 'Baker',
    dateOfBirth: '1950-05-08',
    ward: 'Ward 4',
    bedNumber: '4B',
    consultant: 'Dr. Mitchell',
    admissionDate: '2025-01-15',
    diagnosis: 'Bronchiectasis with Pseudomonas',
    allergies: 'Ciprofloxacin',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p28',
    nhsNumber: '8899112233',
    firstName: 'Helen',
    lastName: 'Nelson',
    dateOfBirth: '1961-11-12',
    ward: 'Ward 4',
    bedNumber: '5A',
    consultant: 'Dr. Mitchell',
    admissionDate: '2025-01-17',
    diagnosis: 'Hospital Acquired Pneumonia',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p29',
    nhsNumber: '9900223344',
    firstName: 'Edward',
    lastName: 'Hill',
    dateOfBirth: '1939-07-25',
    ward: 'Ward 4',
    bedNumber: '6B',
    consultant: 'Dr. Mitchell',
    admissionDate: '2025-01-12',
    diagnosis: 'COPD End Stage - Comfort Care',
    allergies: 'Multiple',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p30',
    nhsNumber: '0011334455',
    firstName: 'Ruth',
    lastName: 'Moore',
    dateOfBirth: '1954-03-18',
    ward: 'Ward 4',
    bedNumber: '7A',
    consultant: 'Dr. Mitchell',
    admissionDate: '2025-01-14',
    diagnosis: 'Pleural Effusion - Under Investigation',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Ward 5 - Gastroenterology (6 patients)
  {
    id: 'p31',
    nhsNumber: '1122556677',
    firstName: 'Ronald',
    lastName: 'Campbell',
    dateOfBirth: '1958-09-03',
    ward: 'Ward 5',
    bedNumber: '1A',
    consultant: 'Dr. Evans',
    admissionDate: '2025-01-15',
    diagnosis: 'Upper GI Bleed - Oesophageal Varices',
    allergies: 'Omeprazole',
    resuscitationStatus: 'Full',
    earlyWarningScore: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p32',
    nhsNumber: '2233667788',
    firstName: 'Shirley',
    lastName: 'Roberts',
    dateOfBirth: '1946-12-11',
    ward: 'Ward 5',
    bedNumber: '2B',
    consultant: 'Dr. Evans',
    admissionDate: '2025-01-14',
    diagnosis: 'Acute Cholecystitis',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p33',
    nhsNumber: '3344778899',
    firstName: 'Larry',
    lastName: 'Turner',
    dateOfBirth: '1971-04-27',
    ward: 'Ward 5',
    bedNumber: '3A',
    consultant: 'Dr. Evans',
    admissionDate: '2025-01-16',
    diagnosis: 'Crohn\'s Disease Flare',
    allergies: 'Azathioprine',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p34',
    nhsNumber: '4455889900',
    firstName: 'Donna',
    lastName: 'Phillips',
    dateOfBirth: '1964-08-19',
    ward: 'Ward 5',
    bedNumber: '4B',
    consultant: 'Dr. Evans',
    admissionDate: '2025-01-13',
    diagnosis: 'Acute Liver Failure - Paracetamol OD',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 6,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p35',
    nhsNumber: '5566990011',
    firstName: 'Raymond',
    lastName: 'Evans',
    dateOfBirth: '1953-02-06',
    ward: 'Ward 5',
    bedNumber: '5A',
    consultant: 'Dr. Evans',
    admissionDate: '2025-01-17',
    diagnosis: 'Small Bowel Obstruction',
    allergies: 'Codeine',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p36',
    nhsNumber: '6677001122',
    firstName: 'Janet',
    lastName: 'Edwards',
    dateOfBirth: '1949-06-14',
    ward: 'Ward 5',
    bedNumber: '6B',
    consultant: 'Dr. Evans',
    admissionDate: '2025-01-15',
    diagnosis: 'C. Difficile Colitis',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Ward 6 - Elderly Care (6 patients)
  {
    id: 'p37',
    nhsNumber: '7788112233',
    firstName: 'Harold',
    lastName: 'Collins',
    dateOfBirth: '1934-10-22',
    ward: 'Ward 6',
    bedNumber: '1A',
    consultant: 'Dr. O\'Brien',
    admissionDate: '2025-01-14',
    diagnosis: 'Delirium - Query Underlying Cause',
    allergies: 'Haloperidol',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p38',
    nhsNumber: '8899223344',
    firstName: 'Carolyn',
    lastName: 'Stewart',
    dateOfBirth: '1936-05-30',
    ward: 'Ward 6',
    bedNumber: '2B',
    consultant: 'Dr. O\'Brien',
    admissionDate: '2025-01-13',
    diagnosis: 'Hip Fracture - Post ORIF Day 4',
    allergies: 'Tramadol',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p39',
    nhsNumber: '9900334455',
    firstName: 'Eugene',
    lastName: 'Morris',
    dateOfBirth: '1932-01-08',
    ward: 'Ward 6',
    bedNumber: '3A',
    consultant: 'Dr. O\'Brien',
    admissionDate: '2025-01-16',
    diagnosis: 'Aspiration Pneumonia - Dementia',
    allergies: '',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p40',
    nhsNumber: '0011445566',
    firstName: 'Gloria',
    lastName: 'Murphy',
    dateOfBirth: '1938-08-17',
    ward: 'Ward 6',
    bedNumber: '4B',
    consultant: 'Dr. O\'Brien',
    admissionDate: '2025-01-15',
    diagnosis: 'Social Admission - Unsafe Discharge',
    allergies: 'Multiple antibiotics',
    resuscitationStatus: 'Not Discussed',
    earlyWarningScore: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p41',
    nhsNumber: '1122667788',
    firstName: 'Henry',
    lastName: 'Rogers',
    dateOfBirth: '1935-12-03',
    ward: 'Ward 6',
    bedNumber: '5A',
    consultant: 'Dr. O\'Brien',
    admissionDate: '2025-01-12',
    diagnosis: 'Parkinson\'s Disease - Medication Review',
    allergies: 'Metoclopramide',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p42',
    nhsNumber: '2233778899',
    firstName: 'Jean',
    lastName: 'Reed',
    dateOfBirth: '1933-04-25',
    ward: 'Ward 6',
    bedNumber: '6B',
    consultant: 'Dr. O\'Brien',
    admissionDate: '2025-01-17',
    diagnosis: 'Recurrent Falls - Postural Hypotension',
    allergies: '',
    resuscitationStatus: 'Not Discussed',
    earlyWarningScore: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Ward 7 - Surgical (6 patients)
  {
    id: 'p43',
    nhsNumber: '3344889900',
    firstName: 'Carl',
    lastName: 'Cook',
    dateOfBirth: '1967-07-11',
    ward: 'Ward 7',
    bedNumber: '1A',
    consultant: 'Mr. Wilson',
    admissionDate: '2025-01-16',
    diagnosis: 'Post Appendicectomy - Day 1',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p44',
    nhsNumber: '4455990011',
    firstName: 'Rose',
    lastName: 'Morgan',
    dateOfBirth: '1959-03-28',
    ward: 'Ward 7',
    bedNumber: '2B',
    consultant: 'Mr. Wilson',
    admissionDate: '2025-01-14',
    diagnosis: 'Post Cholecystectomy - Bile Leak',
    allergies: 'Latex',
    resuscitationStatus: 'Full',
    earlyWarningScore: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p45',
    nhsNumber: '5566001122',
    firstName: 'Arthur',
    lastName: 'Bell',
    dateOfBirth: '1951-09-15',
    ward: 'Ward 7',
    bedNumber: '3A',
    consultant: 'Mr. Wilson',
    admissionDate: '2025-01-13',
    diagnosis: 'Incarcerated Hernia - Pre-Op',
    allergies: 'Suxamethonium',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p46',
    nhsNumber: '6677112233',
    firstName: 'Marie',
    lastName: 'Bailey',
    dateOfBirth: '1973-11-20',
    ward: 'Ward 7',
    bedNumber: '4B',
    consultant: 'Mr. Wilson',
    admissionDate: '2025-01-15',
    diagnosis: 'Post Right Hemicolectomy - Day 2',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p47',
    nhsNumber: '7788223344',
    firstName: 'Philip',
    lastName: 'Rivera',
    dateOfBirth: '1962-06-07',
    ward: 'Ward 7',
    bedNumber: '5A',
    consultant: 'Mr. Wilson',
    admissionDate: '2025-01-17',
    diagnosis: 'Acute Appendicitis - Awaiting Theatre',
    allergies: 'Penicillin',
    resuscitationStatus: 'Full',
    earlyWarningScore: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p48',
    nhsNumber: '8899334455',
    firstName: 'Evelyn',
    lastName: 'Cooper',
    dateOfBirth: '1945-02-12',
    ward: 'Ward 7',
    bedNumber: '6B',
    consultant: 'Mr. Wilson',
    admissionDate: '2025-01-14',
    diagnosis: 'Post Hartmann\'s Procedure - Ileus',
    allergies: 'Opioids (severe nausea)',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Ward 8 - Orthopaedics (7 patients)
  {
    id: 'p49',
    nhsNumber: '9900445566',
    firstName: 'Albert',
    lastName: 'Richardson',
    dateOfBirth: '1941-08-29',
    ward: 'Ward 8',
    bedNumber: '1A',
    consultant: 'Mr. Ahmed',
    admissionDate: '2025-01-15',
    diagnosis: 'NOF Fracture - Awaiting THR',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p50',
    nhsNumber: '0011556677',
    firstName: 'Florence',
    lastName: 'Cox',
    dateOfBirth: '1937-05-04',
    ward: 'Ward 8',
    bedNumber: '2B',
    consultant: 'Mr. Ahmed',
    admissionDate: '2025-01-13',
    diagnosis: 'Post THR - Day 4 - PE Suspected',
    allergies: 'Enoxaparin (HIT)',
    resuscitationStatus: 'Full',
    earlyWarningScore: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p51',
    nhsNumber: '1122778899',
    firstName: 'Jack',
    lastName: 'Howard',
    dateOfBirth: '1956-12-16',
    ward: 'Ward 8',
    bedNumber: '3A',
    consultant: 'Mr. Ahmed',
    admissionDate: '2025-01-16',
    diagnosis: 'Tibial Plateau Fracture - Conservative',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p52',
    nhsNumber: '2233889900',
    firstName: 'Anna',
    lastName: 'Ward',
    dateOfBirth: '1948-10-08',
    ward: 'Ward 8',
    bedNumber: '4B',
    consultant: 'Mr. Ahmed',
    admissionDate: '2025-01-14',
    diagnosis: 'Post TKR - Day 3 - Wound Infection',
    allergies: 'Flucloxacillin',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p53',
    nhsNumber: '3344990011',
    firstName: 'Walter',
    lastName: 'Torres',
    dateOfBirth: '1944-03-21',
    ward: 'Ward 8',
    bedNumber: '5A',
    consultant: 'Mr. Ahmed',
    admissionDate: '2025-01-17',
    diagnosis: 'Vertebral Compression Fracture',
    allergies: 'Codeine',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p54',
    nhsNumber: '4455001122',
    firstName: 'Lillian',
    lastName: 'Peterson',
    dateOfBirth: '1960-07-13',
    ward: 'Ward 8',
    bedNumber: '6B',
    consultant: 'Mr. Ahmed',
    admissionDate: '2025-01-15',
    diagnosis: 'Post Spinal Fusion - Day 2',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p55',
    nhsNumber: '5566112233',
    firstName: 'Roy',
    lastName: 'Gray',
    dateOfBirth: '1969-01-30',
    ward: 'Ward 8',
    bedNumber: '7A',
    consultant: 'Mr. Ahmed',
    admissionDate: '2025-01-16',
    diagnosis: 'Open Tibial Fracture - External Fixator',
    allergies: 'Gentamicin',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Additional 50 patients (p56-p105) across all wards
  // Ward 1 - General Medicine (6 more patients)
  {
    id: 'p56',
    nhsNumber: '5600112233',
    firstName: 'Geoffrey',
    lastName: 'Burton',
    dateOfBirth: '1951-04-12',
    ward: 'Ward 1',
    bedNumber: '9A',
    consultant: 'Dr. Williams',
    admissionDate: '2025-01-14',
    diagnosis: 'Hyponatraemia - SIADH',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p57',
    nhsNumber: '5700223344',
    firstName: 'Maureen',
    lastName: 'Fletcher',
    dateOfBirth: '1943-09-28',
    ward: 'Ward 1',
    bedNumber: '10B',
    consultant: 'Dr. Thompson',
    admissionDate: '2025-01-15',
    diagnosis: 'Cellulitis Left Leg',
    allergies: 'Flucloxacillin',
    resuscitationStatus: 'Full',
    earlyWarningScore: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p58',
    nhsNumber: '5800334455',
    firstName: 'Bernard',
    lastName: 'Marsh',
    dateOfBirth: '1958-02-17',
    ward: 'Ward 1',
    bedNumber: '11A',
    consultant: 'Dr. Williams',
    admissionDate: '2025-01-16',
    diagnosis: 'Lower GI Bleed - Diverticular',
    allergies: 'NSAIDs',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p59',
    nhsNumber: '5900445566',
    firstName: 'Irene',
    lastName: 'Hodgson',
    dateOfBirth: '1946-11-05',
    ward: 'Ward 1',
    bedNumber: '12B',
    consultant: 'Dr. Thompson',
    admissionDate: '2025-01-13',
    diagnosis: 'Syncope - Query Cardiac',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p60',
    nhsNumber: '6000556677',
    firstName: 'Kenneth',
    lastName: 'Barker',
    dateOfBirth: '1962-07-23',
    ward: 'Ward 1',
    bedNumber: '13A',
    consultant: 'Dr. Williams',
    admissionDate: '2025-01-17',
    diagnosis: 'Alcohol Withdrawal',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p61',
    nhsNumber: '6100667788',
    firstName: 'Sylvia',
    lastName: 'Pearson',
    dateOfBirth: '1939-12-30',
    ward: 'Ward 1',
    bedNumber: '14B',
    consultant: 'Dr. Thompson',
    admissionDate: '2025-01-14',
    diagnosis: 'Falls - Mechanical',
    allergies: 'Codeine',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Ward 2 - General Medicine (6 more patients)
  {
    id: 'p62',
    nhsNumber: '6200778899',
    firstName: 'Derek',
    lastName: 'Fowler',
    dateOfBirth: '1954-05-09',
    ward: 'Ward 2',
    bedNumber: '9A',
    consultant: 'Dr. Patel',
    admissionDate: '2025-01-15',
    diagnosis: 'Acute Gout',
    allergies: 'Allopurinol',
    resuscitationStatus: 'Full',
    earlyWarningScore: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p63',
    nhsNumber: '6300889900',
    firstName: 'Brenda',
    lastName: 'Atkinson',
    dateOfBirth: '1949-08-14',
    ward: 'Ward 2',
    bedNumber: '10B',
    consultant: 'Dr. Singh',
    admissionDate: '2025-01-16',
    diagnosis: 'Chest Pain - Troponin Negative',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p64',
    nhsNumber: '6400990011',
    firstName: 'Norman',
    lastName: 'Stephenson',
    dateOfBirth: '1947-01-21',
    ward: 'Ward 2',
    bedNumber: '11A',
    consultant: 'Dr. Patel',
    admissionDate: '2025-01-14',
    diagnosis: 'Drug Overdose - Paracetamol',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p65',
    nhsNumber: '6501001122',
    firstName: 'Valerie',
    lastName: 'Coleman',
    dateOfBirth: '1956-06-18',
    ward: 'Ward 2',
    bedNumber: '12B',
    consultant: 'Dr. Singh',
    admissionDate: '2025-01-17',
    diagnosis: 'Vertigo - Labyrinthitis',
    allergies: 'Prochlorperazine',
    resuscitationStatus: 'Full',
    earlyWarningScore: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p66',
    nhsNumber: '6601112233',
    firstName: 'Ronald',
    lastName: 'Palmer',
    dateOfBirth: '1941-10-02',
    ward: 'Ward 2',
    bedNumber: '13A',
    consultant: 'Dr. Patel',
    admissionDate: '2025-01-13',
    diagnosis: 'Anaemia - Iron Deficiency',
    allergies: 'Ferrous Sulphate (GI upset)',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p67',
    nhsNumber: '6701223344',
    firstName: 'Sheila',
    lastName: 'Watts',
    dateOfBirth: '1960-03-27',
    ward: 'Ward 2',
    bedNumber: '14B',
    consultant: 'Dr. Singh',
    admissionDate: '2025-01-15',
    diagnosis: 'Headache - Migraine with Aura',
    allergies: 'Triptans',
    resuscitationStatus: 'Full',
    earlyWarningScore: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Ward 3 - Cardiology (6 more patients)
  {
    id: 'p68',
    nhsNumber: '6801334455',
    firstName: 'Trevor',
    lastName: 'Morrison',
    dateOfBirth: '1952-12-08',
    ward: 'Ward 3',
    bedNumber: '8A',
    consultant: 'Dr. Hughes',
    admissionDate: '2025-01-14',
    diagnosis: 'Bradycardia - Heart Block',
    allergies: 'Beta blockers',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p69',
    nhsNumber: '6901445566',
    firstName: 'Pauline',
    lastName: 'Curtis',
    dateOfBirth: '1948-04-15',
    ward: 'Ward 3',
    bedNumber: '9B',
    consultant: 'Dr. Hughes',
    admissionDate: '2025-01-16',
    diagnosis: 'Aortic Stenosis - Symptomatic',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p70',
    nhsNumber: '7001556677',
    firstName: 'Clifford',
    lastName: 'Nicholson',
    dateOfBirth: '1959-07-22',
    ward: 'Ward 3',
    bedNumber: '10A',
    consultant: 'Dr. Hughes',
    admissionDate: '2025-01-15',
    diagnosis: 'Supraventricular Tachycardia',
    allergies: 'Adenosine',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p71',
    nhsNumber: '7101667788',
    firstName: 'Jean',
    lastName: 'Chambers',
    dateOfBirth: '1944-09-30',
    ward: 'Ward 3',
    bedNumber: '11B',
    consultant: 'Dr. Hughes',
    admissionDate: '2025-01-17',
    diagnosis: 'Pericarditis',
    allergies: 'Ibuprofen',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p72',
    nhsNumber: '7201778899',
    firstName: 'Alan',
    lastName: 'Spencer',
    dateOfBirth: '1957-02-11',
    ward: 'Ward 3',
    bedNumber: '12A',
    consultant: 'Dr. Hughes',
    admissionDate: '2025-01-14',
    diagnosis: 'Cardiomyopathy - Dilated',
    allergies: 'ACE inhibitors (angioedema)',
    resuscitationStatus: 'Full',
    earlyWarningScore: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p73',
    nhsNumber: '7301889900',
    firstName: 'Rita',
    lastName: 'Douglas',
    dateOfBirth: '1950-11-19',
    ward: 'Ward 3',
    bedNumber: '13B',
    consultant: 'Dr. Hughes',
    admissionDate: '2025-01-16',
    diagnosis: 'DVT Left Leg',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Ward 4 - Respiratory (6 more patients)
  {
    id: 'p74',
    nhsNumber: '7401990011',
    firstName: 'Victor',
    lastName: 'Webb',
    dateOfBirth: '1953-06-04',
    ward: 'Ward 4',
    bedNumber: '8A',
    consultant: 'Dr. Mitchell',
    admissionDate: '2025-01-15',
    diagnosis: 'Lung Cancer - Staging',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p75',
    nhsNumber: '7502001122',
    firstName: 'Dorothy',
    lastName: 'Armstrong',
    dateOfBirth: '1946-08-26',
    ward: 'Ward 4',
    bedNumber: '9B',
    consultant: 'Dr. Mitchell',
    admissionDate: '2025-01-14',
    diagnosis: 'Bronchiectasis Exacerbation',
    allergies: 'Clarithromycin',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p76',
    nhsNumber: '7602112233',
    firstName: 'Stanley',
    lastName: 'Elliott',
    dateOfBirth: '1961-01-13',
    ward: 'Ward 4',
    bedNumber: '10A',
    consultant: 'Dr. Mitchell',
    admissionDate: '2025-01-17',
    diagnosis: 'Sleep Apnoea Assessment',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p77',
    nhsNumber: '7702223344',
    firstName: 'Audrey',
    lastName: 'Fox',
    dateOfBirth: '1955-05-07',
    ward: 'Ward 4',
    bedNumber: '11B',
    consultant: 'Dr. Mitchell',
    admissionDate: '2025-01-16',
    diagnosis: 'Pleural Effusion - Malignant',
    allergies: 'Morphine',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p78',
    nhsNumber: '7802334455',
    firstName: 'Raymond',
    lastName: 'Hudson',
    dateOfBirth: '1948-10-31',
    ward: 'Ward 4',
    bedNumber: '12A',
    consultant: 'Dr. Mitchell',
    admissionDate: '2025-01-15',
    diagnosis: 'Aspiration Pneumonia',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p79',
    nhsNumber: '7902445566',
    firstName: 'Gladys',
    lastName: 'Simpson',
    dateOfBirth: '1942-03-18',
    ward: 'Ward 4',
    bedNumber: '13B',
    consultant: 'Dr. Mitchell',
    admissionDate: '2025-01-14',
    diagnosis: 'Respiratory Failure Type 2',
    allergies: 'Theophylline',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Ward 5 - Gastroenterology (6 more patients)
  {
    id: 'p80',
    nhsNumber: '8002556677',
    firstName: 'Leonard',
    lastName: 'Grant',
    dateOfBirth: '1956-12-25',
    ward: 'Ward 5',
    bedNumber: '8A',
    consultant: 'Dr. Khan',
    admissionDate: '2025-01-16',
    diagnosis: 'Alcoholic Hepatitis',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p81',
    nhsNumber: '8102667788',
    firstName: 'Olive',
    lastName: 'Saunders',
    dateOfBirth: '1949-04-09',
    ward: 'Ward 5',
    bedNumber: '9B',
    consultant: 'Dr. Khan',
    admissionDate: '2025-01-15',
    diagnosis: 'Peptic Ulcer - Haematemesis',
    allergies: 'Omeprazole',
    resuscitationStatus: 'Full',
    earlyWarningScore: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p82',
    nhsNumber: '8202778899',
    firstName: 'Cyril',
    lastName: 'Booth',
    dateOfBirth: '1963-07-16',
    ward: 'Ward 5',
    bedNumber: '10A',
    consultant: 'Dr. Khan',
    admissionDate: '2025-01-14',
    diagnosis: 'Inflammatory Bowel Disease Flare',
    allergies: 'Mesalazine',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p83',
    nhsNumber: '8302889900',
    firstName: 'Vera',
    lastName: 'Bailey',
    dateOfBirth: '1951-09-02',
    ward: 'Ward 5',
    bedNumber: '11B',
    consultant: 'Dr. Khan',
    admissionDate: '2025-01-17',
    diagnosis: 'Biliary Colic',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p84',
    nhsNumber: '8402990011',
    firstName: 'Ernest',
    lastName: 'Harvey',
    dateOfBirth: '1945-11-28',
    ward: 'Ward 5',
    bedNumber: '12A',
    consultant: 'Dr. Khan',
    admissionDate: '2025-01-16',
    diagnosis: 'Constipation - Faecal Impaction',
    allergies: 'Lactulose',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p85',
    nhsNumber: '8503001122',
    firstName: 'Mabel',
    lastName: 'Cross',
    dateOfBirth: '1958-02-14',
    ward: 'Ward 5',
    bedNumber: '13B',
    consultant: 'Dr. Khan',
    admissionDate: '2025-01-15',
    diagnosis: 'Oesophageal Varices - Banding',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Ward 6 - Elderly Care (6 more patients)
  {
    id: 'p86',
    nhsNumber: '8603112233',
    firstName: 'Frederick',
    lastName: 'Owen',
    dateOfBirth: '1938-06-21',
    ward: 'Ward 6',
    bedNumber: '8A',
    consultant: 'Dr. O\'Brien',
    admissionDate: '2025-01-14',
    diagnosis: 'Parkinson\'s Disease - Deterioration',
    allergies: 'Domperidone',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p87',
    nhsNumber: '8703223344',
    firstName: 'Edith',
    lastName: 'Price',
    dateOfBirth: '1935-08-05',
    ward: 'Ward 6',
    bedNumber: '9B',
    consultant: 'Dr. O\'Brien',
    admissionDate: '2025-01-16',
    diagnosis: 'Recurrent Falls - Postural Hypotension',
    allergies: '',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p88',
    nhsNumber: '8803334455',
    firstName: 'Harold',
    lastName: 'Murray',
    dateOfBirth: '1940-01-17',
    ward: 'Ward 6',
    bedNumber: '10A',
    consultant: 'Dr. O\'Brien',
    admissionDate: '2025-01-15',
    diagnosis: 'Delirium - UTI',
    allergies: 'Nitrofurantoin',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p89',
    nhsNumber: '8903445566',
    firstName: 'Hilda',
    lastName: 'Bell',
    dateOfBirth: '1937-04-29',
    ward: 'Ward 6',
    bedNumber: '11B',
    consultant: 'Dr. O\'Brien',
    admissionDate: '2025-01-14',
    diagnosis: 'Failure to Thrive - Malnutrition',
    allergies: '',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p90',
    nhsNumber: '9003556677',
    firstName: 'Reginald',
    lastName: 'Foster',
    dateOfBirth: '1936-10-12',
    ward: 'Ward 6',
    bedNumber: '12A',
    consultant: 'Dr. O\'Brien',
    admissionDate: '2025-01-17',
    diagnosis: 'Vascular Dementia - Behavioural',
    allergies: 'Haloperidol',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p91',
    nhsNumber: '9103667788',
    firstName: 'Elsie',
    lastName: 'Stone',
    dateOfBirth: '1939-12-08',
    ward: 'Ward 6',
    bedNumber: '13B',
    consultant: 'Dr. O\'Brien',
    admissionDate: '2025-01-16',
    diagnosis: 'Osteoporotic Vertebral Fracture',
    allergies: 'Codeine',
    resuscitationStatus: 'DNACPR',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Ward 7 - Surgical (7 more patients)
  {
    id: 'p92',
    nhsNumber: '9203778899',
    firstName: 'Cecil',
    lastName: 'Russell',
    dateOfBirth: '1955-03-24',
    ward: 'Ward 7',
    bedNumber: '7A',
    consultant: 'Mr. Wilson',
    admissionDate: '2025-01-15',
    diagnosis: 'Perforated Diverticulitis - Post Hartmann\'s',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p93',
    nhsNumber: '9303889900',
    firstName: 'Ivy',
    lastName: 'Dixon',
    dateOfBirth: '1950-07-11',
    ward: 'Ward 7',
    bedNumber: '8B',
    consultant: 'Mr. Wilson',
    admissionDate: '2025-01-14',
    diagnosis: 'Post Gastrectomy - Anastomotic Leak',
    allergies: 'Metoclopramide',
    resuscitationStatus: 'Full',
    earlyWarningScore: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p94',
    nhsNumber: '9403990011',
    firstName: 'Herbert',
    lastName: 'Burns',
    dateOfBirth: '1962-11-03',
    ward: 'Ward 7',
    bedNumber: '9A',
    consultant: 'Mr. Wilson',
    admissionDate: '2025-01-17',
    diagnosis: 'Inguinal Hernia Repair - Day Case',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p95',
    nhsNumber: '9504001122',
    firstName: 'Marjorie',
    lastName: 'Griffiths',
    dateOfBirth: '1947-05-18',
    ward: 'Ward 7',
    bedNumber: '10B',
    consultant: 'Mr. Wilson',
    admissionDate: '2025-01-16',
    diagnosis: 'Bowel Obstruction - Adhesions',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p96',
    nhsNumber: '9604112233',
    firstName: 'Arthur',
    lastName: 'Payne',
    dateOfBirth: '1958-09-07',
    ward: 'Ward 7',
    bedNumber: '11A',
    consultant: 'Mr. Wilson',
    admissionDate: '2025-01-15',
    diagnosis: 'Post Right Hemicolectomy - Day 3',
    allergies: 'Opioids (nausea)',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p97',
    nhsNumber: '9704223344',
    firstName: 'Kathleen',
    lastName: 'Lambert',
    dateOfBirth: '1953-02-28',
    ward: 'Ward 7',
    bedNumber: '12B',
    consultant: 'Mr. Wilson',
    admissionDate: '2025-01-14',
    diagnosis: 'Acute Appendicitis - Awaiting Theatre',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p98',
    nhsNumber: '9804334455',
    firstName: 'Horace',
    lastName: 'Sharp',
    dateOfBirth: '1949-06-14',
    ward: 'Ward 7',
    bedNumber: '13A',
    consultant: 'Mr. Wilson',
    admissionDate: '2025-01-17',
    diagnosis: 'Incarcerated Umbilical Hernia',
    allergies: 'Latex',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Ward 8 - Orthopaedics (7 more patients)
  {
    id: 'p99',
    nhsNumber: '9904445566',
    firstName: 'Doreen',
    lastName: 'Parsons',
    dateOfBirth: '1943-08-22',
    ward: 'Ward 8',
    bedNumber: '8B',
    consultant: 'Mr. Ahmed',
    admissionDate: '2025-01-15',
    diagnosis: 'Post THR - Day 2',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p100',
    nhsNumber: '1000556677',
    firstName: 'Wilfred',
    lastName: 'Black',
    dateOfBirth: '1946-01-09',
    ward: 'Ward 8',
    bedNumber: '9A',
    consultant: 'Mr. Ahmed',
    admissionDate: '2025-01-14',
    diagnosis: 'Infected TKR - Washout',
    allergies: 'Vancomycin',
    resuscitationStatus: 'Full',
    earlyWarningScore: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p101',
    nhsNumber: '1010667788',
    firstName: 'Constance',
    lastName: 'Wright',
    dateOfBirth: '1952-04-03',
    ward: 'Ward 8',
    bedNumber: '10B',
    consultant: 'Mr. Ahmed',
    admissionDate: '2025-01-16',
    diagnosis: 'Ankle Fracture - ORIF',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p102',
    nhsNumber: '1020778899',
    firstName: 'Leslie',
    lastName: 'Hunt',
    dateOfBirth: '1960-10-17',
    ward: 'Ward 8',
    bedNumber: '11A',
    consultant: 'Mr. Ahmed',
    admissionDate: '2025-01-15',
    diagnosis: 'Lumbar Disc Prolapse - Conservative',
    allergies: 'Diazepam',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p103',
    nhsNumber: '1030889900',
    firstName: 'Winifred',
    lastName: 'Barnes',
    dateOfBirth: '1941-12-30',
    ward: 'Ward 8',
    bedNumber: '12B',
    consultant: 'Mr. Ahmed',
    admissionDate: '2025-01-14',
    diagnosis: 'Periprosthetic Fracture',
    allergies: 'Cephalosporins',
    resuscitationStatus: 'Full',
    earlyWarningScore: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p104',
    nhsNumber: '1040990011',
    firstName: 'Gordon',
    lastName: 'Lloyd',
    dateOfBirth: '1957-05-26',
    ward: 'Ward 8',
    bedNumber: '13A',
    consultant: 'Mr. Ahmed',
    admissionDate: '2025-01-17',
    diagnosis: 'Cauda Equina - Post Decompression',
    allergies: '',
    resuscitationStatus: 'Full',
    earlyWarningScore: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p105',
    nhsNumber: '1051001122',
    firstName: 'Agnes',
    lastName: 'Holmes',
    dateOfBirth: '1944-09-11',
    ward: 'Ward 8',
    bedNumber: '14B',
    consultant: 'Mr. Ahmed',
    admissionDate: '2025-01-16',
    diagnosis: 'Septic Arthritis Knee',
    allergies: 'Flucloxacillin',
    resuscitationStatus: 'Full',
    earlyWarningScore: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Time helpers for varied creation times
const morningTime = new Date();
morningTime.setHours(7, 30, 0, 0);
const midMorningTime = new Date();
midMorningTime.setHours(9, 15, 0, 0);
const latemorningTime = new Date();
latemorningTime.setHours(11, 0, 0, 0);
const earlyAfternoonTime = new Date();
earlyAfternoonTime.setHours(13, 45, 0, 0);
const afternoonTime = new Date();
afternoonTime.setHours(15, 30, 0, 0);
const lateAfternoonTime = new Date();
lateAfternoonTime.setHours(17, 0, 0, 0);
const eveningTime = new Date();
eveningTime.setHours(19, 30, 0, 0);
const nightTime = new Date();
nightTime.setHours(22, 15, 0, 0);

// Handover notes for various patients
const sampleHandoverNotes: HandoverNote[] = [
  // Ward 1 handovers
  {
    id: 'h1',
    patientId: 'p1',
    createdBy: 'Nurse Adams',
    createdAt: new Date().toISOString(),
    shiftDate: today,
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
    shiftDate: today,
    shiftType: 'Day',
    situation: 'AKI on background of CKD Stage 3. Creatinine risen from baseline 120 to 280. Urine output reduced.',
    background: '76-year-old female with CKD3, HTN, and Osteoarthritis. Recently started on NSAIDs by GP for joint pain.',
    assessment: 'Clinically dry. JVP not visible. USS kidneys shows no obstruction. Likely pre-renal AKI precipitated by NSAIDs and dehydration.',
    recommendation: 'Stop NSAIDs. IV fluids 1L over 8 hours. Strict fluid balance. Recheck U&Es in morning. Consider renal referral if not improving.'
  },
  {
    id: 'h3',
    patientId: 'p6',
    createdBy: 'Nurse Williams',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'DKA on admission - blood glucose 32, pH 7.18, ketones 5.2. Now on fixed rate insulin infusion.',
    background: '64-year-old female with T2DM usually diet controlled. Recent viral illness. Lives with husband.',
    assessment: 'Improving - pH now 7.32, glucose 14, ketones 1.8. Clinically better, tolerating sips of water.',
    recommendation: 'Continue FRII until ketones <0.6 and eating. Start subcutaneous insulin before stopping infusion. Diabetes team aware.'
  },
  {
    id: 'h4',
    patientId: 'p8',
    createdBy: 'Dr. Thompson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Night',
    situation: 'Deteriorating sepsis secondary to UTI. NEWS increased from 4 to 6 overnight.',
    background: '86-year-old female with dementia, recurrent UTIs, and CKD4. Lives in nursing home. DNACPR in place.',
    assessment: 'Temp 38.5, HR 110, BP 95/60, confused (baseline AMTS 6). Lactate 3.2. Started sepsis 6.',
    recommendation: 'For ward-based care only. IV Tazocin started. Needs senior review if no improvement by morning. Family updated.'
  },
  {
    id: 'h5',
    patientId: 'p9',
    createdBy: 'Nurse Brown',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Acute pancreatitis - epigastric pain radiating to back, vomiting, amylase 1200.',
    background: '59-year-old male, history of alcohol excess. This is third admission with pancreatitis.',
    assessment: 'Glasgow-Imrie score 2. NBM, IV fluids running. Pain controlled with morphine PCA. Tolerating nasogastric feeding.',
    recommendation: 'Continue supportive care. Repeat bloods tomorrow. Alcohol liaison team referral made. Consider CT if not improving in 48hrs.'
  },
  {
    id: 'h6',
    patientId: 'p11',
    createdBy: 'Dr. Williams',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Acute asthma exacerbation - PEF 180 on admission (best 450). Required back-to-back nebs.',
    background: '66-year-old male with brittle asthma, previous ICU admission. Aspirin/NSAID allergy.',
    assessment: 'PEF now 320. SpO2 96% on 28% O2. Still wheezy but improved. Pred 40mg started.',
    recommendation: 'Continue regular nebs. Wean oxygen as tolerated. May need magnesium if deteriorates. Review by respiratory team tomorrow.'
  },
  // Ward 2 handovers
  {
    id: 'h7',
    patientId: 'p3',
    createdBy: 'Nurse Taylor',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'COPD exacerbation - increased breathlessness, purulent sputum, and wheeze.',
    background: '62-year-old male with severe COPD (FEV1 35%), on home oxygen 2L. Ex-smoker. DNACPR in place.',
    assessment: 'RR 28, SpO2 88% on 4L O2. ABG shows type 2 respiratory failure. Started on NIV.',
    recommendation: 'Continue NIV. Needs regular ABGs. Respiratory team involved. For ward-based treatment only if fails NIV.'
  },
  {
    id: 'h8',
    patientId: 'p12',
    createdBy: 'Dr. Patel',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Decompensated cirrhosis with ascites and hepatic encephalopathy grade 2.',
    background: '74-year-old female with alcohol-related cirrhosis, known varices, previous SBP. DNACPR.',
    assessment: 'Confused but rousable. Tense ascites. Na 128, albumin 22, INR 2.1. Paracentesis done - 5L drained.',
    recommendation: 'Continue lactulose QDS. Monitor for SBP. Fluid restrict 1.5L. Terlipressin if needed. Gastro team aware.'
  },
  {
    id: 'h9',
    patientId: 'p13',
    createdBy: 'Nurse Jackson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Confirmed PE on CTPA. Haemodynamically stable. Started on treatment dose LMWH.',
    background: '53-year-old male, recent long-haul flight. No previous VTE. No significant PMH.',
    assessment: 'HR 95, BP 125/78, SpO2 95% on air. Troponin mildly elevated. Echo shows mild RV strain.',
    recommendation: 'Continue anticoagulation. Needs outpatient echo in 6 weeks. Start DOAC when INR available. Thrombophilia screen sent.'
  },
  {
    id: 'h10',
    patientId: 'p14',
    createdBy: 'Dr. Chen',
    createdAt: new Date().toISOString(),
    shiftDate: yesterday,
    shiftType: 'Day',
    situation: 'Left MCA stroke confirmed on CT. Arrived outside thrombolysis window.',
    background: '80-year-old female with AF (not anticoagulated), HTN. Lives alone with carers TDS.',
    assessment: 'Right-sided weakness (MRC 2/5), expressive dysphasia. Swallow assessment failed - NBM with NG feeds.',
    recommendation: 'Continue secondary prevention. Speech and language therapy referral. OT/PT started. Family meeting arranged for goals of care.'
  },
  {
    id: 'h11',
    patientId: 'p15',
    createdBy: 'Nurse Adams',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'NSTEMI - troponin 850. Chest pain settled with GTN and morphine.',
    background: '56-year-old male with T2DM, HTN, hyperlipidaemia. Never had cardiac issues before.',
    assessment: 'Pain-free now. ECG shows lateral ST depression. On dual antiplatelet, fondaparinux, and statin.',
    recommendation: 'Needs angiogram +/- PCI. Cardiology to review today. Continue monitoring for arrhythmias. Target HR <70.'
  },
  {
    id: 'h12',
    patientId: 'p17',
    createdBy: 'Dr. Thompson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Fall at home - no head injury or LOC. Query mechanical vs cardiac cause.',
    background: '84-year-old male with previous falls, takes bisoprolol and ramipril. Wife at home.',
    assessment: 'No injuries found. Lying and standing BP shows 25mmHg drop. ECG: sinus brady 48bpm.',
    recommendation: 'Hold bisoprolol. Consider 24hr tape if symptomatic. Falls team referral. OT home assessment before discharge.'
  },
  // Ward 3 - Cardiology handovers
  {
    id: 'h13',
    patientId: 'p5',
    createdBy: 'Nurse Williams',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Night',
    situation: 'Increasing shortness of breath overnight. Required increase in oxygen from 2L to 4L to maintain SpO2 >92%.',
    background: '84-year-old male with known heart failure (EF 30%), AF, and CKD4. On maximum diuretic therapy.',
    assessment: 'Bilateral pitting oedema to knees. Bibasal crackles. Elevated JVP. Weight up 2kg from admission. ECG shows AF with rate 110.',
    recommendation: 'Needs medical review for IV diuretics. Consider cardiology input. DNACPR in place - for ward-based care only.'
  },
  {
    id: 'h14',
    patientId: 'p18',
    createdBy: 'Dr. Hughes',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'New diagnosis heart failure. BNP 2500. Echo shows EF 25% with severe LV impairment.',
    background: '61-year-old female presenting with progressive dyspnoea over 2 weeks. No cardiac history.',
    assessment: 'Orthopnoea, bilateral oedema. CXR shows cardiomegaly and pulmonary oedema. Now on IV frusemide.',
    recommendation: 'Titrate diuretics to achieve negative balance. Start low dose ACEi when stable. Needs coronary angiogram to exclude ischaemic cause.'
  },
  {
    id: 'h15',
    patientId: 'p19',
    createdBy: 'Nurse Brown',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Complete heart block on admission. HR 35. Temporary pacing wire inserted.',
    background: '69-year-old male, previously well. Presented with near-syncope. No chest pain.',
    assessment: 'Now paced at 60. Awaiting permanent pacemaker. Bloods unremarkable.',
    recommendation: 'On waiting list for PPM insertion. Keep bed rest. Check daily pacing threshold. Antibiotic prophylaxis before procedure.'
  },
  {
    id: 'h16',
    patientId: 'p21',
    createdBy: 'Dr. Hughes',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Infective endocarditis confirmed on TOE - aortic valve vegetation 12mm.',
    background: '65-year-old male with prosthetic aortic valve. Blood cultures grew Staph aureus.',
    assessment: 'Febrile but haemodynamically stable. No stigmata of emboli. Started on IV vancomycin and gentamicin.',
    recommendation: 'Needs 6 weeks IV antibiotics. Weekly TOE to monitor vegetation. Discuss with cardiac surgery if complications develop.'
  },
  {
    id: 'h17',
    patientId: 'p23',
    createdBy: 'Nurse Taylor',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Day 3 post anterior STEMI treated with primary PCI. Progressing well.',
    background: '76-year-old male, smoker. Presented with central chest pain. Troponin peak 5000.',
    assessment: 'No chest pain. Mobile with physio. Echo shows EF 40% with anterior hypokinesis.',
    recommendation: 'Cardiac rehab referral. Titrate up ACEi and beta-blocker. Discuss ICD at follow-up. Smoking cessation advice given.'
  },
  // Ward 4 - Respiratory handovers
  {
    id: 'h18',
    patientId: 'p24',
    createdBy: 'Dr. Mitchell',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Spontaneous pneumothorax. Chest drain inserted - now re-expanded on CXR.',
    background: '67-year-old female, tall thin build. Never smoked. First pneumothorax.',
    assessment: 'Chest drain on underwater seal, no bubbling. Repeat CXR shows full expansion.',
    recommendation: 'If no recurrence by tomorrow, can trial drain removal. Needs follow-up CXR. Discuss surgical referral if recurs.'
  },
  {
    id: 'h19',
    patientId: 'p25',
    createdBy: 'Nurse Jackson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Lung cancer with brain metastases. Increasing confusion and drowsiness.',
    background: '81-year-old male with stage 4 NSCLC. Not for active oncology treatment. DNACPR.',
    assessment: 'GCS 12 (E3V4M5). Comfortable. Family aware of poor prognosis. On syringe driver.',
    recommendation: 'Continue comfort care. PRN anticipatory medications prescribed. Spiritual care referral if family wishes.'
  },
  {
    id: 'h20',
    patientId: 'p26',
    createdBy: 'Dr. Mitchell',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Stepped down from ICU post severe asthma attack. Required intubation for 24hrs.',
    background: '58-year-old female with brittle asthma. Multiple ICU admissions. Aspirin allergy.',
    assessment: 'Now on 35% oxygen. PEF improving to 250. Still wheezy but talking in sentences.',
    recommendation: 'Continue weaning O2 and nebs. Avoid aspirin/NSAIDs. Respiratory review before discharge. May need biologics discussed.'
  },
  {
    id: 'h21',
    patientId: 'p28',
    createdBy: 'Nurse Williams',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'HAP developed 5 days into admission for other reason. Now febrile with new infiltrate on CXR.',
    background: '63-year-old female originally admitted with stroke. Aspiration risk identified.',
    assessment: 'Temp 38.5, SpO2 91% on 4L, productive cough. WCC 18. Started on Tazocin.',
    recommendation: 'Continue IV antibiotics. Repeat CXR in 48hrs. Continue aspiration precautions. SALT review for swallow.'
  },
  {
    id: 'h22',
    patientId: 'p29',
    createdBy: 'Dr. Mitchell',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Night',
    situation: 'End-stage COPD. Increasingly drowsy, CO2 retention despite NIV.',
    background: '85-year-old male with severe COPD, on home O2. Previous ICU admission declined. DNACPR.',
    assessment: 'Drowsy but comfortable. ABG pH 7.28, pCO2 10. Family at bedside.',
    recommendation: 'For comfort measures. NIV can be removed if distressing. Morphine PRN for breathlessness. Palliative care involved.'
  },
  // Ward 5 - Gastro handovers
  {
    id: 'h23',
    patientId: 'p31',
    createdBy: 'Dr. Evans',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Upper GI bleed - large haematemesis. Hb dropped from 120 to 78. OGD shows bleeding oesophageal varices.',
    background: '66-year-old male with alcohol cirrhosis, known varices. Still drinking.',
    assessment: 'Variceal banding performed. 4 units transfused. Now on terlipressin and PPI infusion.',
    recommendation: 'Monitor for re-bleeding. Repeat Hb in 6 hours. Continue terlipressin 48hrs. Alcohol liaison referral.'
  },
  {
    id: 'h24',
    patientId: 'p32',
    createdBy: 'Nurse Brown',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Acute cholecystitis - RUQ pain, fever, Murphy\'s positive. USS shows thickened GB with stones.',
    background: '78-year-old female, known gallstones but declined surgery previously.',
    assessment: 'WCC 16, CRP 180. Now on IV Tazocin. Pain controlled with paracetamol and codeine.',
    recommendation: 'Continue antibiotics. NBM. Surgical review for consideration of interval cholecystectomy vs conservative management.'
  },
  {
    id: 'h25',
    patientId: 'p33',
    createdBy: 'Dr. Evans',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Crohn\'s flare with bloody diarrhoea 8x/day, abdominal pain, and weight loss.',
    background: '53-year-old male with ileocolonic Crohn\'s. Usually maintained on azathioprine.',
    assessment: 'Tachycardic, Hb 98, albumin 28, CRP 85. CT shows thickened terminal ileum.',
    recommendation: 'IV hydrocortisone started. Continue azathioprine. May need biologics if no response. IBD nurse involved.'
  },
  {
    id: 'h26',
    patientId: 'p34',
    createdBy: 'Nurse Taylor',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Night',
    situation: 'Paracetamol overdose - 40g taken 12 hours ago. INR 2.8, ALT 3500.',
    background: '60-year-old female with depression. Found by neighbour. Suicide note found.',
    assessment: 'Encephalopathic grade 1. On NAC infusion. Creatinine rising. Acidotic.',
    recommendation: 'Urgent discussion with liver unit for possible transfer. Continue NAC. Needs close monitoring. Psychiatry involved.'
  },
  {
    id: 'h27',
    patientId: 'p35',
    createdBy: 'Dr. Evans',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Small bowel obstruction on CT. Not passed flatus for 3 days. Vomiting.',
    background: '71-year-old male with previous abdominal surgery. Likely adhesional obstruction.',
    assessment: 'Distended abdomen, tinkling bowel sounds. NG tube draining 800ml. Needs surgery review.',
    recommendation: 'Keep NBM, NG on free drainage. Surgical team aware - may need laparotomy if no improvement in 24-48hrs.'
  },
  {
    id: 'h28',
    patientId: 'p36',
    createdBy: 'Nurse Jackson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'C. diff colitis - profuse diarrhoea, abdominal cramps. Toxin positive.',
    background: '75-year-old female recently completed course of co-amoxiclav for chest infection.',
    assessment: 'Opening bowels 10x/day. Tachycardic, low-grade fever. WCC 22.',
    recommendation: 'Oral vancomycin started. Source isolation. Daily bloods. Surgery aware in case of toxic megacolon.'
  },
  // Ward 6 - Elderly Care handovers
  {
    id: 'h29',
    patientId: 'p37',
    createdBy: 'Dr. O\'Brien',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Hyperactive delirium - agitated, pulling at lines, not sleeping.',
    background: '90-year-old male with vascular dementia. Usually mobile with frame. Lives with daughter.',
    assessment: 'Temp 37.8, CXR clear, urine dip positive. Likely UTI precipitating delirium.',
    recommendation: 'Treat UTI. Regular reorientation. Avoid haloperidol (contraindicated). Family involvement in care. OT for cognition.'
  },
  {
    id: 'h30',
    patientId: 'p38',
    createdBy: 'Nurse Adams',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Day 4 post hip ORIF. Progressing with physio but needs package of care.',
    background: '88-year-old female with osteoporosis, previous CVA. Lived alone with carers BD.',
    assessment: 'Pain controlled. Walking 10m with frame. Needs increased care package.',
    recommendation: 'Continue physio. Social worker referral for care package. Bone protection started. Target discharge in 5-7 days.'
  },
  {
    id: 'h31',
    patientId: 'p39',
    createdBy: 'Dr. O\'Brien',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Night',
    situation: 'Aspiration pneumonia - witnessed aspiration event. Now febrile and hypoxic.',
    background: '92-year-old male with advanced dementia, known swallowing difficulties. DNACPR.',
    assessment: 'SpO2 88% on 4L, RR 28. CXR shows right lower lobe consolidation. On IV antibiotics.',
    recommendation: 'For ward-based care. Continue antibiotics. NBM - modified diet when improves. Ceiling of care discussed with family.'
  },
  {
    id: 'h32',
    patientId: 'p41',
    createdBy: 'Nurse Williams',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Parkinson\'s medication review needed - increased "off" periods and hallucinations.',
    background: '89-year-old male with Parkinson\'s for 15 years. Carers QDS at home. DNACPR.',
    assessment: 'Cogwheeling rigidity, shuffling gait. Mini-mental 22/30. Seeing "people in room".',
    recommendation: 'Parkinson\'s nurse to review medications. Consider reducing dopamine agonist. Avoid antipsychotics. OT and physio input.'
  },
  // Ward 7 - Surgical handovers
  {
    id: 'h33',
    patientId: 'p43',
    createdBy: 'Mr. Wilson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Day 1 post laparoscopic appendicectomy. Uncomplicated surgery.',
    background: '57-year-old male, previously fit and well. No significant PMH.',
    assessment: 'Pain controlled with regular paracetamol. Tolerating diet. Passing flatus.',
    recommendation: 'Continue mobilisation. Discharge tomorrow if well. GP follow-up in 2 weeks for wound check.'
  },
  {
    id: 'h34',
    patientId: 'p44',
    createdBy: 'Nurse Brown',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Post laparoscopic cholecystectomy - bile leak confirmed. Drain output 300ml bilious.',
    background: '65-year-old female with symptomatic gallstones. Difficult surgery due to inflammation.',
    assessment: 'Low-grade fever, mildly jaundiced. LFTs rising. MRCP shows leak from cystic duct stump.',
    recommendation: 'ERCP and stent planned for tomorrow. Continue drain. NPO. Monitor for sepsis. May need re-operation if ERCP fails.'
  },
  {
    id: 'h35',
    patientId: 'p45',
    createdBy: 'Mr. Wilson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Incarcerated inguinal hernia - unable to reduce. Intermittent abdominal pain.',
    background: '73-year-old male with known hernia, declined elective repair. COPD on inhalers.',
    assessment: 'Tender irreducible mass in right groin. No signs of strangulation yet. CT shows viable bowel.',
    recommendation: 'Needs urgent surgical repair tomorrow. NBM from midnight. Optimise COPD pre-op. Consent obtained.'
  },
  {
    id: 'h36',
    patientId: 'p46',
    createdBy: 'Nurse Taylor',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Day 2 post right hemicolectomy for caecal cancer. Slow recovery.',
    background: '51-year-old female with T3N1 caecal adenocarcinoma. Otherwise fit.',
    assessment: 'Tolerating sips. Minimal stoma output - may be ileus. Pain controlled on PCA.',
    recommendation: 'Continue enhanced recovery. Start laxatives. Dietitian review. Oncology to discuss adjuvant chemo when recovered.'
  },
  {
    id: 'h37',
    patientId: 'p47',
    createdBy: 'Mr. Wilson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Acute appendicitis with localized peritonism. Awaiting emergency appendicectomy.',
    background: '62-year-old male with penicillin allergy. Type 2 diabetes on metformin.',
    assessment: 'WCC 15, CRP 120. Tender RIF with guarding. CT confirms appendicitis with no perforation.',
    recommendation: 'Listed for emergency theatre. Hold metformin. Alternative antibiotics prescribed. Needs sliding scale if delayed.'
  },
  {
    id: 'h38',
    patientId: 'p48',
    createdBy: 'Nurse Jackson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Post Hartmann\'s procedure for perforated diverticulitis. Day 3 - ileus developing.',
    background: '79-year-old female with diverticular disease. Emergency surgery 3 days ago.',
    assessment: 'Distended, not passing flatus. NG tube inserted draining 500ml. Stoma not functioning.',
    recommendation: 'Keep NPO, continue NG drainage. Daily bloods. Exclude anastomotic leak - may need CT. Surgical review twice daily.'
  },
  // Ward 8 - Orthopaedics handovers
  {
    id: 'h39',
    patientId: 'p49',
    createdBy: 'Mr. Ahmed',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Intracapsular NOF fracture. Awaiting total hip replacement tomorrow.',
    background: '83-year-old male, fell at home. Independent with stick. Lives with wife.',
    assessment: 'Good pre-op fitness. Echo done - normal. Bloods optimised. Consent obtained.',
    recommendation: 'NBM from midnight. Pre-op checklist complete. Continue DVT prophylaxis. Pain managed with fascia iliaca block.'
  },
  {
    id: 'h40',
    patientId: 'p50',
    createdBy: 'Nurse Adams',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Day 4 post THR. Developed sudden shortness of breath and pleuritic chest pain.',
    background: '87-year-old female with history of HIT so cannot have enoxaparin. On fondaparinux.',
    assessment: 'SpO2 90% on air, HR 110, D-dimer elevated. CTPA shows bilateral PE.',
    recommendation: 'Started on apixaban (no HIT risk). Needs cardiology review for right heart strain. Monitor closely. Not for thrombolysis.'
  },
  {
    id: 'h41',
    patientId: 'p52',
    createdBy: 'Mr. Ahmed',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Day 3 post TKR with wound infection. Increasing pain, redness, and discharge.',
    background: '76-year-old female with T2DM. Elective TKR went well initially.',
    assessment: 'Wound erythematous, serous discharge. CRP 85. Swab sent. Started on flucloxacillin alternative.',
    recommendation: 'Monitor wound closely. May need washout if not improving. Ensure good glycaemic control. Consider MRSA cover.'
  },
  {
    id: 'h42',
    patientId: 'p53',
    createdBy: 'Nurse Taylor',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'L1 compression fracture after fall. Severe pain despite analgesia.',
    background: '80-year-old male with osteoporosis, previous vertebral fractures. DNACPR.',
    assessment: 'Pain score 8/10 despite opioids. MRI excludes cord compression. Spinal team reviewed.',
    recommendation: 'Consider vertebroplasty if pain uncontrolled. Pain team involved. Start bone protection. Falls risk assessment.'
  },
  {
    id: 'h43',
    patientId: 'p55',
    createdBy: 'Mr. Ahmed',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Open tibial fracture Grade 3A. External fixator applied. Pin site looks clean.',
    background: '55-year-old male, motorcycle RTC. Otherwise fit. Non-smoker.',
    assessment: 'Good distal pulses. No compartment syndrome. Wound VAC in place. On IV antibiotics.',
    recommendation: 'Continue antibiotics 72 hours. Daily pin site care. Plastic surgery involved for wound coverage. Psychology referral offered.'
  },
  // Handovers for previously missing patients (p4, p7, p10, p16, p20, p22, p27, p30, p40, p42, p51, p54)
  {
    id: 'h44',
    patientId: 'p4',
    createdBy: 'Dr. Singh',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Viral meningitis - headache, photophobia, neck stiffness. LP confirmed viral picture.',
    background: '42-year-old male, previously fit. Works as teacher. No recent travel.',
    assessment: 'GCS 15, neuro exam normal. CSF clear, lymphocytic pleocytosis. Temp 38.0.',
    recommendation: 'Supportive care. Regular neuro obs. Analgesia for headache. Expect improvement over 7-10 days.'
  },
  {
    id: 'h45',
    patientId: 'p7',
    createdBy: 'Dr. Thompson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'AF with fast ventricular response - HR 140 on admission, now rate controlled.',
    background: '72-year-old male with hypertension. New diagnosis AF. Amiodarone allergy.',
    assessment: 'HR 85, BP 130/78, rhythm controlled with bisoprolol. CHADSVASC 2.',
    recommendation: 'Start anticoagulation (apixaban). Echo requested. Consider cardioversion as outpatient.'
  },
  {
    id: 'h46',
    patientId: 'p10',
    createdBy: 'Nurse Adams',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Hypoglycaemia on admission - BM 1.8. Alert now after IV dextrose.',
    background: '79-year-old female with T2DM on gliclazide. Recent poor oral intake due to nausea.',
    assessment: 'BMs now stable 6-10. Oral intake improving. Gliclazide held.',
    recommendation: 'Consider stopping gliclazide. Diabetes team review. Ensure regular BM monitoring. May need HbA1c check.'
  },
  {
    id: 'h47',
    patientId: 'p16',
    createdBy: 'Nurse Brown',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Gastroenteritis - profuse watery diarrhoea and vomiting for 48 hours.',
    background: '55-year-old male, ate at restaurant 2 days ago. Normally fit and well.',
    assessment: 'Clinically dehydrated. IV fluids running. Stool sample sent. C.diff negative.',
    recommendation: 'Continue IV fluids until tolerating oral. Monitor for signs of improvement. Likely viral - expect improvement 48-72 hrs.'
  },
  {
    id: 'h48',
    patientId: 'p20',
    createdBy: 'Dr. Hughes',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Hypertensive crisis - BP 220/120 on admission with headache.',
    background: '68-year-old male, known hypertension, poor compliance with medications.',
    assessment: 'BP now 160/95 on IV labetalol. No end-organ damage. CT head unremarkable.',
    recommendation: 'Wean IV antihypertensives. Restart oral medications. Emphasize compliance. Follow-up with GP essential.'
  },
  {
    id: 'h49',
    patientId: 'p22',
    createdBy: 'Dr. Hughes',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Complete heart block - HR 35 on admission, symptomatic with dizziness.',
    background: '81-year-old female with ischaemic heart disease. Previous MI 2019.',
    assessment: 'Temporary pacing wire inserted. Stable, awaiting permanent pacemaker.',
    recommendation: 'Continue monitoring. Keep isoprenaline available. PPM insertion tomorrow - cardiology confirmed. Keep NBM from midnight.'
  },
  {
    id: 'h50',
    patientId: 'p27',
    createdBy: 'Dr. Mitchell',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Haemoptysis - 50ml fresh blood today. Known lung cancer.',
    background: '71-year-old male with stage 4 NSCLC, palliative intent treatment. DNACPR.',
    assessment: 'No major bleeding currently. Hb stable. Resp team aware.',
    recommendation: 'For comfort measures. Tranexamic acid if bleeding increases. Dark towels at bedside. Family aware of prognosis.'
  },
  {
    id: 'h51',
    patientId: 'p30',
    createdBy: 'Dr. Khan',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Melaena and coffee ground vomiting. Hb dropped from 90 to 72.',
    background: '78-year-old female with PUD history. On aspirin and clopidogrel post-stent.',
    assessment: '2 units RBC transfused. OGD tomorrow morning. Terlipressin not needed currently.',
    recommendation: 'Hold antiplatelets (cardiology aware). Monitor Hb. Keep G&S current. Urgent OGD booked.'
  },
  {
    id: 'h52',
    patientId: 'p40',
    createdBy: 'Dr. O\'Brien',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Social admission - family unable to cope at home. Multiple falls last week.',
    background: '91-year-old female with dementia and osteoporosis. Lives with daughter who is struggling.',
    assessment: 'Medically stable. AMTS 4/10. Mobility poor with Zimmer frame. Needs 24-hour care.',
    recommendation: 'OT and PT assessments complete. Awaiting care package or placement. Social worker involved.'
  },
  {
    id: 'h53',
    patientId: 'p42',
    createdBy: 'Mr. Wilson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Perforated duodenal ulcer - post emergency laparotomy and washout.',
    background: '66-year-old male with H. pylori not treated. Heavy smoker and drinker.',
    assessment: 'Day 1 post-op. Drains in situ, minimal output. NG on free drainage.',
    recommendation: 'Continue IV PPI and antibiotics. Keep NBM until bowels open. Smoking cessation and H. pylori eradication when recovered.'
  },
  {
    id: 'h54',
    patientId: 'p51',
    createdBy: 'Mr. Ahmed',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Tibial plateau fracture - being managed conservatively in knee brace.',
    background: '68-year-old male, fell off ladder. No other injuries.',
    assessment: 'Good range of movement. Non-weight bearing in brace. Pain controlled.',
    recommendation: 'Physio started. VTE prophylaxis. Repeat X-ray in 2 weeks. Discharge planning with community physio follow-up.'
  },
  {
    id: 'h55',
    patientId: 'p54',
    createdBy: 'Mr. Ahmed',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Day 2 post spinal fusion L4-S1. Good pain control, mobilising with physio.',
    background: '64-year-old female with chronic back pain. Multiple level disc disease.',
    assessment: 'Neurology intact. Wound clean. Using PCA effectively.',
    recommendation: 'Continue physio. Step down analgesia. Aim discharge day 5 if independent with ADLs.'
  },
  // Handovers for all new patients (p56-p105)
  {
    id: 'h56',
    patientId: 'p56',
    createdBy: 'Dr. Williams',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Hyponatraemia - Na 118 on admission. Symptomatic with confusion.',
    background: '73-year-old male with small cell lung cancer. SIADH suspected.',
    assessment: 'Na now 124 with fluid restriction. More alert. Osmolality supports SIADH.',
    recommendation: 'Strict fluid restriction 750ml/24hr. Daily U&Es. Avoid rapid correction. Oncology aware.'
  },
  {
    id: 'h57',
    patientId: 'p57',
    createdBy: 'Nurse Adams',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Cellulitis left leg - spreading erythema marked. IV antibiotics started.',
    background: '81-year-old female with peripheral vascular disease and diabetes. Flucloxacillin allergy.',
    assessment: 'On IV clindamycin. Demarcation line stable. No systemic sepsis.',
    recommendation: 'Mark cellulitis twice daily. Elevate leg. Continue IV antibiotics 48-72 hrs then review for oral switch.'
  },
  {
    id: 'h58',
    patientId: 'p58',
    createdBy: 'Dr. Thompson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Lower GI bleed - PR bleeding with clots. Hb 95, was 120 last week.',
    background: '66-year-old male with known diverticular disease. On aspirin.',
    assessment: 'Bleeding settled. 2 units transfused. Colonoscopy arranged.',
    recommendation: 'Stop aspirin. Keep G&S current. GI team aware. May need CTA if rebleeds.'
  },
  {
    id: 'h59',
    patientId: 'p59',
    createdBy: 'Dr. Thompson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Syncope - collapsed at home with brief LOC. Query cardiac cause.',
    background: '78-year-old female with previous palpitations. Lives alone.',
    assessment: 'ECG shows sinus bradycardia. Echo normal. 24hr tape requested.',
    recommendation: 'Cardiac monitoring. Falls risk assessment. Consider referral for pacemaker if bradycardia symptomatic.'
  },
  {
    id: 'h60',
    patientId: 'p60',
    createdBy: 'Nurse Williams',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Alcohol withdrawal - last drink 36 hours ago. Tremor and anxiety.',
    background: '62-year-old male, heavy drinker for 30 years. Previous withdrawal seizures.',
    assessment: 'CIWA-Ar score 18. Started on reducing chlordiazepoxide. IV Pabrinex given.',
    recommendation: 'Regular CIWA monitoring. PRN lorazepam for severe symptoms. Watch for DTs. Alcohol liaison team referral.'
  },
  {
    id: 'h61',
    patientId: 'p61',
    createdBy: 'Dr. Thompson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Mechanical fall at home - no head injury, hip X-ray normal.',
    background: '85-year-old female with recurrent falls. DNACPR. Lives in warden-controlled flat.',
    assessment: 'Mobile with frame. No fracture. Falls assessment shows postural hypotension.',
    recommendation: 'Review medications. OT home assessment. Consider referral to falls clinic.'
  },
  {
    id: 'h62',
    patientId: 'p62',
    createdBy: 'Dr. Patel',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Acute gout - severely swollen painful right first MTP joint.',
    background: '70-year-old male with CKD3. Cannot tolerate allopurinol.',
    assessment: 'Joint aspirated, urate crystals confirmed. Started on colchicine.',
    recommendation: 'Continue colchicine low dose. Avoid NSAIDs due to CKD. Consider febuxostat for prophylaxis once settled.'
  },
  {
    id: 'h63',
    patientId: 'p63',
    createdBy: 'Dr. Singh',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Chest pain - troponin negative x2. Low risk for ACS.',
    background: '75-year-old female with GORD. Atypical chest pain after large meal.',
    assessment: 'ECG normal. Serial troponins negative. Pain reproduced on palpation.',
    recommendation: 'For discharge with GP follow-up. Likely musculoskeletal/GORD. Reassure patient.'
  },
  {
    id: 'h64',
    patientId: 'p64',
    createdBy: 'Dr. Patel',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Paracetamol overdose - 48 tablets taken 6 hours ago. NAC started.',
    background: '77-year-old male with depression. Found by wife. Low suicide intent.',
    assessment: 'Paracetamol level above treatment line. LFTs normal. INR 1.1.',
    recommendation: 'Complete NAC course. Repeat LFTs and INR. Psychiatry review before discharge. Keep on 1:1 observation.'
  },
  {
    id: 'h65',
    patientId: 'p65',
    createdBy: 'Dr. Singh',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Vertigo - severe rotatory vertigo with nausea and vomiting.',
    background: '68-year-old female with no previous episodes. Prochlorperazine allergy.',
    assessment: 'Nystagmus present. Dix-Hallpike positive. Epley manoeuvre performed.',
    recommendation: 'Start cyclizine for nausea. Vestibular rehabilitation exercises taught. Expect improvement over days.'
  },
  {
    id: 'h66',
    patientId: 'p66',
    createdBy: 'Dr. Patel',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Iron deficiency anaemia - Hb 72. Symptomatic with fatigue and breathlessness.',
    background: '83-year-old male with DNACPR. GI upset from ferrous sulphate previously.',
    assessment: 'Transfused 2 units. Iron studies confirm deficiency. OGD/colonoscopy needed.',
    recommendation: 'Start ferrous fumarate (liquid). GI investigations to exclude malignancy. Consider IV iron if intolerant.'
  },
  {
    id: 'h67',
    patientId: 'p67',
    createdBy: 'Dr. Singh',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Migraine with aura - visual disturbance followed by severe headache.',
    background: '64-year-old female with history of migraines. Cannot use triptans.',
    assessment: 'Neuro exam normal. CT head clear. Pain responding to paracetamol and antiemetics.',
    recommendation: 'For discharge when pain controlled. GP follow-up for migraine prophylaxis discussion.'
  },
  {
    id: 'h68',
    patientId: 'p68',
    createdBy: 'Dr. Hughes',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Complete heart block - HR 32 on admission. Awaiting pacing.',
    background: '72-year-old male with previous ischaemic heart disease. Beta blocker allergy.',
    assessment: 'Temporary wire inserted. Haemodynamically stable. ECG shows CHB.',
    recommendation: 'Permanent pacemaker tomorrow. Keep NBM from midnight. Continuous monitoring essential.'
  },
  {
    id: 'h69',
    patientId: 'p69',
    createdBy: 'Dr. Hughes',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Symptomatic aortic stenosis - syncope on exertion.',
    background: '76-year-old female with known moderate AS, now severe. Good functional status.',
    assessment: 'Echo shows AVA 0.7cm2. TAVI assessment being arranged.',
    recommendation: 'Avoid strenuous activity. Cardiology follow-up for TAVI workup. Diuretics if develops HF.'
  },
  {
    id: 'h70',
    patientId: 'p70',
    createdBy: 'Dr. Hughes',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'SVT - HR 180 on arrival. Cardioverted with adenosine.',
    background: '65-year-old male with recurrent palpitations. Adenosine previously ineffective.',
    assessment: 'Sinus rhythm restored. No chest pain or compromise. Will need EP study.',
    recommendation: 'Start beta blocker. Cardiology outpatient referral for ablation consideration.'
  },
  {
    id: 'h71',
    patientId: 'p71',
    createdBy: 'Dr. Hughes',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Acute pericarditis - pleuritic chest pain, worse lying flat.',
    background: '80-year-old female with recent viral illness. Ibuprofen allergy.',
    assessment: 'ECG shows diffuse ST elevation. Echo shows small effusion, no tamponade.',
    recommendation: 'Colchicine and paracetamol for anti-inflammatory effect. Repeat echo in 48 hrs.'
  },
  {
    id: 'h72',
    patientId: 'p72',
    createdBy: 'Dr. Hughes',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Dilated cardiomyopathy - presenting with worsening breathlessness.',
    background: '67-year-old male with EF 25%. ACE inhibitor allergy (angioedema).',
    assessment: 'On IV furosemide. Weight down 3kg. BNP 1200. Euvolaemic now.',
    recommendation: 'Optimise heart failure therapy. Consider ARB carefully. CRT assessment if persisting symptoms.'
  },
  {
    id: 'h73',
    patientId: 'p73',
    createdBy: 'Dr. Hughes',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'DVT left leg - swollen painful calf. Ultrasound confirmed.',
    background: '74-year-old female with no obvious provoking factors. First VTE.',
    assessment: 'Started on DOAC. Cancer screen arranged. IVC filter not indicated.',
    recommendation: 'Continue apixaban for 3 months minimum. Investigate for occult malignancy. Compression stockings.'
  },
  {
    id: 'h74',
    patientId: 'p74',
    createdBy: 'Dr. Mitchell',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Lung cancer staging - CT shows 4cm mass with mediastinal nodes.',
    background: '71-year-old male, 40 pack-year smoker. Weight loss 8kg.',
    assessment: 'PET-CT arranged. Bronchoscopy scheduled. PS 1.',
    recommendation: 'MDT discussion once staging complete. Lung CNS to coordinate. Smoking cessation support.'
  },
  {
    id: 'h75',
    patientId: 'p75',
    createdBy: 'Dr. Mitchell',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Bronchiectasis exacerbation - increased sputum volume and purulence.',
    background: '78-year-old female with childhood pertussis. Clarithromycin allergy.',
    assessment: 'CRP 85. Sputum sent. Started on doxycycline. O2 requirements stable.',
    recommendation: 'Chest physio twice daily. Continue antibiotics 14 days. Ensure regular sputum clearance.'
  },
  {
    id: 'h76',
    patientId: 'p76',
    createdBy: 'Dr. Mitchell',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Sleep apnoea assessment - severe daytime somnolence, BMI 42.',
    background: '63-year-old male, HGV driver. Epworth score 18.',
    assessment: 'Overnight oximetry shows significant desaturations. Sleep study confirms severe OSA.',
    recommendation: 'CPAP titration arranged. Cannot drive until treated. Weight management advice given.'
  },
  {
    id: 'h77',
    patientId: 'p77',
    createdBy: 'Dr. Mitchell',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Malignant pleural effusion - breathless with large right effusion.',
    background: '69-year-old female with metastatic breast cancer. DNACPR. Morphine allergy.',
    assessment: 'Chest drain inserted, 2L drained. Symptomatic relief. Pleurodesis planned.',
    recommendation: 'Palliative care involved. Consider indwelling catheter if recurs. Oxycodone for breathlessness.'
  },
  {
    id: 'h78',
    patientId: 'p78',
    createdBy: 'Dr. Mitchell',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Aspiration pneumonia - recurrent aspiration in context of stroke.',
    background: '76-year-old male with previous CVA, residual swallowing difficulties.',
    assessment: 'SALT assessed - unsafe swallow. NG tube inserted. IV antibiotics started.',
    recommendation: 'NBM. Consider PEG if no improvement. Discuss goals of care with family.'
  },
  {
    id: 'h79',
    patientId: 'p79',
    createdBy: 'Dr. Mitchell',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Type 2 respiratory failure - CO2 rising despite NIV.',
    background: '82-year-old female with end-stage COPD. DNACPR. For ward-based care only.',
    assessment: 'pH 7.28, pCO2 9.2. Family aware. For comfort measures.',
    recommendation: 'Continue NIV for comfort. Morphine for breathlessness. MCCD expected. Family at bedside.'
  },
  {
    id: 'h80',
    patientId: 'p80',
    createdBy: 'Dr. Khan',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Alcoholic hepatitis - jaundiced with tender hepatomegaly.',
    background: '68-year-old male, heavy drinker. Maddrey score 38.',
    assessment: 'Started on prednisolone. Pabrinex given. Lille score day 7.',
    recommendation: 'Stop alcohol. Monitor for infection and encephalopathy. Dietitian referral. Alcohol services.'
  },
  {
    id: 'h81',
    patientId: 'p81',
    createdBy: 'Dr. Khan',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Upper GI bleed - haematemesis with melaena. Hb 78.',
    background: '75-year-old female with peptic ulcer disease. Omeprazole allergy (rash).',
    assessment: '3 units transfused. Urgent OGD showed bleeding duodenal ulcer - injected and clipped.',
    recommendation: 'IV H2 blocker. Monitor Hb. Keep G&S current. H. pylori eradication when stable.'
  },
  {
    id: 'h82',
    patientId: 'p82',
    createdBy: 'Dr. Khan',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Crohn\'s flare - bloody diarrhoea 10x/day, abdominal pain.',
    background: '61-year-old male with known Crohn\'s. Mesalazine intolerant.',
    assessment: 'CRP 120, calprotectin elevated. CT shows active ileal inflammation.',
    recommendation: 'IV steroids started. Flexible sigmoidoscopy tomorrow. Consider biologics if not responding.'
  },
  {
    id: 'h83',
    patientId: 'p83',
    createdBy: 'Dr. Khan',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Biliary colic - RUQ pain after fatty meals. USS shows gallstones.',
    background: '73-year-old female with no previous episodes. Otherwise fit.',
    assessment: 'Pain settled with diclofenac. LFTs normal. No cholecystitis.',
    recommendation: 'Low-fat diet advice. Surgical referral for elective cholecystectomy. Discharge when pain-free.'
  },
  {
    id: 'h84',
    patientId: 'p84',
    createdBy: 'Dr. Khan',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Faecal impaction - severe constipation with overflow. AXR confirms loading.',
    background: '79-year-old male with dementia. DNACPR. Lactulose intolerant.',
    assessment: 'Manual evacuation performed. Started on macrogol regime.',
    recommendation: 'Encourage fluids. Regular aperients long-term. Review medications causing constipation.'
  },
  {
    id: 'h85',
    patientId: 'p85',
    createdBy: 'Dr. Khan',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Oesophageal varices - elective banding performed. 3 varices treated.',
    background: '66-year-old female with alcohol-related cirrhosis. Previous variceal bleed.',
    assessment: 'Procedure uneventful. On propranolol for prophylaxis. No active bleeding.',
    recommendation: 'Repeat OGD in 2 weeks. Continue beta blocker. Abstain from alcohol. ARLD nurse follow-up.'
  },
  {
    id: 'h86',
    patientId: 'p86',
    createdBy: 'Dr. O\'Brien',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Parkinson\'s deterioration - increased rigidity, falls, and hallucinations.',
    background: '86-year-old male with 10-year history of PD. DNACPR. Domperidone allergy.',
    assessment: 'Geriatric review. Medications adjusted. No acute infection.',
    recommendation: 'Parkinson\'s nurse involved. Watch for aspiration. Family meeting arranged.'
  },
  {
    id: 'h87',
    patientId: 'p87',
    createdBy: 'Dr. O\'Brien',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Recurrent falls due to postural hypotension - standing BP drops 40mmHg.',
    background: '89-year-old female with DNACPR. On multiple antihypertensives.',
    assessment: 'Medications reviewed - stopped bendroflumethiazide. Compression stockings ordered.',
    recommendation: 'Slow positional changes. Review in falls clinic. Consider fludrocortisone if persists.'
  },
  {
    id: 'h88',
    patientId: 'p88',
    createdBy: 'Dr. O\'Brien',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Delirium secondary to UTI - acutely confused, pulling at catheter.',
    background: '84-year-old male with vascular dementia (baseline AMTS 5). Nitrofurantoin allergy.',
    assessment: 'Treating UTI with trimethoprim. 1:1 nursing. Avoiding sedation if possible.',
    recommendation: 'Delirium bundle care. Remove catheter when possible. Family involvement. Avoid anticholinergics.'
  },
  {
    id: 'h89',
    patientId: 'p89',
    createdBy: 'Dr. O\'Brien',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Failure to thrive - weight loss 10kg over 3 months. Poor appetite.',
    background: '87-year-old female with DNACPR. Lives alone, struggling to cope.',
    assessment: 'Malnutrition screening score high. Bloods show low albumin. No sinister cause found.',
    recommendation: 'Dietitian referral. Oral nutritional supplements. Social care assessment for meal support.'
  },
  {
    id: 'h90',
    patientId: 'p90',
    createdBy: 'Dr. O\'Brien',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Behavioural disturbance in vascular dementia - aggression to carers.',
    background: '88-year-old male with DNACPR. Haloperidol caused severe dystonia previously.',
    assessment: 'Precipitants addressed. Low-dose lorazepam PRN. No infection.',
    recommendation: 'Non-pharmacological approaches first. Consider quetiapine if needed. Psych liaison input requested.'
  },
  {
    id: 'h91',
    patientId: 'p91',
    createdBy: 'Dr. O\'Brien',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Osteoporotic vertebral fracture T12 - severe back pain after fall.',
    background: '85-year-old female with DNACPR. Codeine intolerant.',
    assessment: 'MRI excludes cord compression. Pain managed with paracetamol and low-dose opioids.',
    recommendation: 'Bone protection started. Physio for mobilisation. Vertebroplasty if pain uncontrolled.'
  },
  {
    id: 'h92',
    patientId: 'p92',
    createdBy: 'Mr. Wilson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Post Hartmann\'s for perforated diverticulitis - stoma functioning well.',
    background: '69-year-old male with first episode diverticulitis, presented with peritonitis.',
    assessment: 'Day 3 post-op. Tolerating diet. Stoma output good. Wound clean.',
    recommendation: 'Continue antibiotics 5 days. Stoma nurse education. Plan reversal in 3-6 months.'
  },
  {
    id: 'h93',
    patientId: 'p93',
    createdBy: 'Mr. Wilson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Anastomotic leak post gastrectomy - septic with peritonism.',
    background: '74-year-old female with gastric cancer. Underwent partial gastrectomy.',
    assessment: 'CT confirms leak. Drains inserted. On TPN and IV antibiotics.',
    recommendation: 'May need return to theatre. Close monitoring. ITU aware. Critical care outreach involved.'
  },
  {
    id: 'h94',
    patientId: 'p94',
    createdBy: 'Mr. Wilson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Post inguinal hernia repair - day case, straightforward procedure.',
    background: '62-year-old male, ASA 1. Right inguinal hernia repaired laparoscopically.',
    assessment: 'Observations stable. Wound clean. Pain controlled with paracetamol.',
    recommendation: 'For discharge today. Wound care advice given. GP follow-up in 1 week. Avoid heavy lifting 6 weeks.'
  },
  {
    id: 'h95',
    patientId: 'p95',
    createdBy: 'Mr. Wilson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Small bowel obstruction due to adhesions - conservative management.',
    background: '77-year-old female with previous hysterectomy. Multiple adhesional episodes.',
    assessment: 'NG draining 600ml/day. AXR shows dilated loops. Pain controlled.',
    recommendation: 'Continue conservative management. Daily AXR. If not settling 48 hrs, may need surgery.'
  },
  {
    id: 'h96',
    patientId: 'p96',
    createdBy: 'Mr. Wilson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Day 3 post right hemicolectomy for caecal cancer - recovering well.',
    background: '66-year-old male with T3N0 adenocarcinoma. Opioid-induced nausea.',
    assessment: 'Tolerating light diet. Stoma output established. Histology awaited.',
    recommendation: 'Enhanced recovery pathway. Step down analgesia. Oncology review when histology available.'
  },
  {
    id: 'h97',
    patientId: 'p97',
    createdBy: 'Mr. Wilson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Acute appendicitis - awaiting emergency appendicectomy.',
    background: '71-year-old female with classical presentation. Raised inflammatory markers.',
    assessment: 'NBM, IV fluids and antibiotics. Consented for laparoscopic appendicectomy.',
    recommendation: 'Theatre slot this evening. Keep NBM. Monitor for deterioration.'
  },
  {
    id: 'h98',
    patientId: 'p98',
    createdBy: 'Mr. Wilson',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Incarcerated umbilical hernia - tender irreducible hernia.',
    background: '75-year-old male with BMI 38. Latex allergy.',
    assessment: 'CT shows small bowel within hernia, not strangulated. Urgent repair planned.',
    recommendation: 'Keep NBM. Theatre tomorrow. Anaesthetic review for latex allergy precautions.'
  },
  {
    id: 'h99',
    patientId: 'p99',
    createdBy: 'Mr. Ahmed',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Day 2 post THR - mobilising with physio, pain well controlled.',
    background: '81-year-old female with severe osteoarthritis. Straightforward surgery.',
    assessment: 'Wound clean and dry. Transferring bed to chair independently.',
    recommendation: 'Continue VTE prophylaxis. Aim discharge day 4-5. Arrange rehab referral if needed.'
  },
  {
    id: 'h100',
    patientId: 'p100',
    createdBy: 'Mr. Ahmed',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Infected TKR - wound breakdown with purulent discharge.',
    background: '78-year-old male, TKR 2 years ago. Vancomycin allergy.',
    assessment: 'DAIR performed. Teicoplanin started. Aspirate sent for MC&S.',
    recommendation: 'Prolonged IV antibiotics. Ortho-plastics involved. May need two-stage revision if not settling.'
  },
  {
    id: 'h101',
    patientId: 'p101',
    createdBy: 'Mr. Ahmed',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Post ankle ORIF - day 1 post fixation of bimalleolar fracture.',
    background: '72-year-old female, slipped on ice. Uncomplicated surgery.',
    assessment: 'NV intact. Wound clean. Pain controlled. Non-weight bearing in boot.',
    recommendation: 'Physio review. VTE prophylaxis until mobile. Wound check in 2 weeks.'
  },
  {
    id: 'h102',
    patientId: 'p102',
    createdBy: 'Mr. Ahmed',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Lumbar disc prolapse L5/S1 - sciatica managed conservatively.',
    background: '64-year-old male with no red flags. Diazepam caused drowsiness.',
    assessment: 'Power improving. Pain settling with modified analgesia. No cauda equina.',
    recommendation: 'Physio led management. MRI confirms disc prolapse. Neurosurgery referral if no improvement.'
  },
  {
    id: 'h103',
    patientId: 'p103',
    createdBy: 'Mr. Ahmed',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Periprosthetic fracture - Vancouver B2 around hip replacement.',
    background: '83-year-old female with previous THR 8 years ago. Cephalosporin allergy.',
    assessment: 'Needs revision surgery with long stem. Medically optimised.',
    recommendation: 'Theatre tomorrow. Pre-op anaesthetic assessment done. Use alternative antibiotics.'
  },
  {
    id: 'h104',
    patientId: 'p104',
    createdBy: 'Mr. Ahmed',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Post cauda equina decompression - power improving bilaterally.',
    background: '67-year-old male with acute presentation. Urgent decompression performed.',
    assessment: 'Day 1 post-op. Bladder function returning. Walking with frame.',
    recommendation: 'Intensive physio. Monitor bladder residuals. May need urology follow-up. Likely good recovery.'
  },
  {
    id: 'h105',
    patientId: 'p105',
    createdBy: 'Mr. Ahmed',
    createdAt: new Date().toISOString(),
    shiftDate: today,
    shiftType: 'Day',
    situation: 'Septic arthritis right knee - joint washout performed.',
    background: '80-year-old female with diabetes. Flucloxacillin causes rash.',
    assessment: 'Joint aspirate confirmed infection. On IV teicoplanin. Knee improving.',
    recommendation: '6 weeks IV antibiotics. Repeat aspiration if not settling. Physio when acute phase settles.'
  }
];

// Hospital at Night entries - 30 entries across different roles with varied times
const sampleHospitalAtNight: HospitalAtNightEntry[] = [
  // High priority - SpR reviews
  {
    id: 'han1',
    patientId: 'p5',
    reviewDates: [{ date: apr14, completedAt: undefined }, { date: apr15, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SpR'],
    reasonForReview: 'Deteriorating heart failure. Needs senior review for escalation of diuretic therapy. May need IV furosemide.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'Medicine',
    statusChangedAt: null,
    createdAt: morningTime.toISOString(),
    createdBy: 'Nurse Williams',
    comments: [
      {
        id: 'c1',
        text: 'Cardiology aware - will review in morning if still requiring >4L O2',
        createdBy: 'Dr. Thompson',
        createdAt: midMorningTime.toISOString()
      }
    ]
  },
  {
    id: 'han2',
    patientId: 'p8',
    reviewDates: [{ date: apr14, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SpR', 'SHO'],
    reasonForReview: 'NEWS 6 - sepsis secondary to UTI. May need escalation if not responding to antibiotics.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'Medicine',
    statusChangedAt: null,
    createdAt: afternoonTime.toISOString(),
    createdBy: 'Dr. Thompson',
    comments: []
  },
  {
    id: 'han3',
    patientId: 'p34',
    reviewDates: [{ date: apr15, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SpR'],
    reasonForReview: 'Acute liver failure - paracetamol OD. Needs ongoing monitoring and possible transfer to liver unit.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'Medicine',
    statusChangedAt: null,
    createdAt: latemorningTime.toISOString(),
    createdBy: 'Nurse Taylor',
    comments: [
      {
        id: 'c2',
        text: 'Liver unit aware. Kings criteria being monitored. Call if pH <7.3 or INR >3',
        createdBy: 'Dr. Evans',
        createdAt: earlyAfternoonTime.toISOString()
      }
    ]
  },
  {
    id: 'han4',
    patientId: 'p31',
    reviewDates: [{ date: apr16, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SpR'],
    reasonForReview: 'Post variceal banding - monitor for re-bleeding. Check Hb at 22:00.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'General Surgery',
    statusChangedAt: null,
    createdAt: eveningTime.toISOString(),
    createdBy: 'Dr. Evans',
    comments: []
  },
  // High priority - SHO reviews
  {
    id: 'han5',
    patientId: 'p2',
    reviewDates: [{ date: apr14, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SHO', 'SpR'],
    reasonForReview: 'Review U&Es and fluid status. May need IV diuretics if not responding to oral. AKI improving but needs monitoring.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'Medicine',
    statusChangedAt: null,
    createdAt: midMorningTime.toISOString(),
    createdBy: 'Dr. Chen',
    comments: []
  },
  {
    id: 'han6',
    patientId: 'p50',
    reviewDates: [{ date: apr15, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SHO'],
    reasonForReview: 'New PE post THR. Started anticoagulation. Monitor for deterioration.',
    reviewStatus: 'Pending',
    reviewType: 'Ad-hoc',
    specialty: 'T+O',
    statusChangedAt: null,
    createdAt: afternoonTime.toISOString(),
    createdBy: 'Nurse Adams',
    comments: []
  },
  // Medium priority - SHO reviews
  {
    id: 'han7',
    patientId: 'p1',
    reviewDates: [{ date: apr16, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['SHO'],
    reasonForReview: 'Check evening observations and review oxygen requirements. May need O2 adjustment.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'Medicine',
    statusChangedAt: null,
    createdAt: lateAfternoonTime.toISOString(),
    createdBy: 'Nurse Adams',
    comments: []
  },
  {
    id: 'han8',
    patientId: 'p6',
    reviewDates: [{ date: apr14, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['SHO'],
    reasonForReview: 'DKA - check ketones and glucose at 22:00. May need FRII adjustment.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'Medicine',
    statusChangedAt: null,
    createdAt: morningTime.toISOString(),
    createdBy: 'Nurse Williams',
    comments: []
  },
  {
    id: 'han9',
    patientId: 'p13',
    reviewDates: [{ date: apr15, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['SHO'],
    reasonForReview: 'PE on treatment. Check stability and review anticoagulation plan.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'Medicine',
    statusChangedAt: null,
    createdAt: earlyAfternoonTime.toISOString(),
    createdBy: 'Nurse Jackson',
    comments: []
  },
  // FY1 reviews
  {
    id: 'han10',
    patientId: 'p11',
    reviewDates: [{ date: apr16, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['FY1'],
    reasonForReview: 'Acute asthma - review PEF and consider stepping down oxygen if improving.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'Medicine',
    statusChangedAt: null,
    createdAt: midMorningTime.toISOString(),
    createdBy: 'Dr. Williams',
    comments: []
  },
  {
    id: 'han11',
    patientId: 'p16',
    reviewDates: [{ date: apr14, completedAt: undefined }],
    priority: 'Low',
    assignedRoles: ['FY1'],
    reasonForReview: 'Gastroenteritis - check fluid balance and consider discharge tomorrow if tolerating diet.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'Medicine',
    statusChangedAt: null,
    createdAt: latemorningTime.toISOString(),
    createdBy: 'Nurse Brown',
    comments: []
  },
  {
    id: 'han12',
    patientId: 'p43',
    reviewDates: [{ date: apr15, completedAt: undefined }],
    priority: 'Low',
    assignedRoles: ['FY1'],
    reasonForReview: 'Post appendicectomy day 1 - routine bloods check. Discharge planning if well.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'General Surgery',
    statusChangedAt: null,
    createdAt: afternoonTime.toISOString(),
    createdBy: 'Mr. Wilson',
    comments: []
  },
  // Nurse reviews
  {
    id: 'han13',
    patientId: 'p25',
    reviewDates: [{ date: apr15, completedAt: undefined }, { date: apr16, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['Nurse'],
    reasonForReview: 'Palliative care - syringe driver check. PRN medications may be needed overnight.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'Medicine',
    statusChangedAt: null,
    createdAt: lateAfternoonTime.toISOString(),
    createdBy: 'Nurse Jackson',
    comments: []
  },
  {
    id: 'han14',
    patientId: 'p37',
    reviewDates: [{ date: apr16, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['Nurse', 'FY1'],
    reasonForReview: 'Delirious patient - may need PRN sedation. Regular reorientation and safety checks.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'T+O',
    statusChangedAt: null,
    createdAt: eveningTime.toISOString(),
    createdBy: 'Dr. O\'Brien',
    comments: []
  },
  {
    id: 'han15',
    patientId: 'p29',
    reviewDates: [{ date: apr14, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['Nurse', 'SpR'],
    reasonForReview: 'End-stage COPD - comfort care. May need PRN morphine for breathlessness.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'Medicine',
    statusChangedAt: null,
    createdAt: morningTime.toISOString(),
    createdBy: 'Dr. Mitchell',
    comments: [
      {
        id: 'c3',
        text: 'Family staying overnight. All comfort measures in place.',
        createdBy: 'Nurse Williams',
        createdAt: midMorningTime.toISOString()
      }
    ]
  },
  // Discharge reviews
  {
    id: 'han16',
    patientId: 'p38',
    reviewDates: [{ date: apr15, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['Discharge'],
    reasonForReview: 'Post hip fracture - needs care package arranged before discharge. Social worker involved.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'T+O',
    statusChangedAt: null,
    createdAt: latemorningTime.toISOString(),
    createdBy: 'Nurse Adams',
    comments: []
  },
  {
    id: 'han17',
    patientId: 'p40',
    reviewDates: [{ date: apr14, completedAt: undefined }, { date: apr15, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['Discharge'],
    reasonForReview: 'Social admission - waiting for care package and home modifications. OT assessment complete.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'T+O',
    statusChangedAt: null,
    createdAt: earlyAfternoonTime.toISOString(),
    createdBy: 'Dr. O\'Brien',
    comments: []
  },
  // Mixed role reviews
  {
    id: 'han18',
    patientId: 'p44',
    reviewDates: [{ date: apr16, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SHO', 'SpR'],
    reasonForReview: 'Bile leak post cholecystectomy. ERCP tomorrow - monitor for sepsis overnight.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'General Surgery',
    statusChangedAt: null,
    createdAt: afternoonTime.toISOString(),
    createdBy: 'Nurse Brown',
    comments: []
  },
  {
    id: 'han19',
    patientId: 'p21',
    reviewDates: [{ date: apr15, completedAt: undefined }, { date: apr16, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SpR'],
    reasonForReview: 'Infective endocarditis - on IV antibiotics. Monitor for embolic phenomena.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'Medicine',
    statusChangedAt: null,
    createdAt: lateAfternoonTime.toISOString(),
    createdBy: 'Dr. Hughes',
    comments: []
  },
  {
    id: 'han20',
    patientId: 'p47',
    reviewDates: [{ date: apr14, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['SHO', 'FY1'],
    reasonForReview: 'Awaiting emergency appendicectomy - may go to theatre late. Needs pre-op bloods and sliding scale.',
    reviewStatus: 'Pending',
    reviewType: 'Ad-hoc',
    specialty: 'General Surgery',
    statusChangedAt: null,
    createdAt: eveningTime.toISOString(),
    createdBy: 'Mr. Wilson',
    comments: []
  },
  // Additional 10 OOH referrals for new patients
  {
    id: 'han21',
    patientId: 'p60',
    reviewDates: [{ date: apr14, completedAt: undefined }, { date: apr15, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SpR', 'SHO'],
    reasonForReview: 'Alcohol withdrawal - CIWA score rising. At risk of seizures. Previous history of DTs.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'Medicine',
    statusChangedAt: null,
    createdAt: morningTime.toISOString(),
    createdBy: 'Nurse Williams',
    comments: [
      {
        id: 'c4',
        text: 'Started on Pabrinex. Lorazepam PRN available. Review if CIWA >20.',
        createdBy: 'Dr. Williams',
        createdAt: midMorningTime.toISOString()
      }
    ]
  },
  {
    id: 'han22',
    patientId: 'p72',
    reviewDates: [{ date: apr15, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SpR'],
    reasonForReview: 'Dilated cardiomyopathy EF 25%. On IV diuretics. May need inotropic support if deteriorates.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'Medicine',
    statusChangedAt: null,
    createdAt: latemorningTime.toISOString(),
    createdBy: 'Dr. Hughes',
    comments: []
  },
  {
    id: 'han23',
    patientId: 'p79',
    reviewDates: [{ date: apr16, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SpR', 'Nurse'],
    reasonForReview: 'End-stage respiratory failure. For comfort care. May need PRN opioids for distress.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'Medicine',
    statusChangedAt: null,
    createdAt: earlyAfternoonTime.toISOString(),
    createdBy: 'Dr. Mitchell',
    comments: [
      {
        id: 'c5',
        text: 'Family at bedside. Anticipatory medications prescribed.',
        createdBy: 'Nurse Adams',
        createdAt: afternoonTime.toISOString()
      }
    ]
  },
  {
    id: 'han24',
    patientId: 'p93',
    reviewDates: [{ date: apr14, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SHO', 'SpR'],
    reasonForReview: 'Anastomotic leak post gastrectomy - septic. May need return to theatre overnight.',
    reviewStatus: 'Pending',
    reviewType: 'Ad-hoc',
    specialty: 'General Surgery',
    statusChangedAt: null,
    createdAt: afternoonTime.toISOString(),
    createdBy: 'Mr. Wilson',
    comments: []
  },
  {
    id: 'han25',
    patientId: 'p100',
    reviewDates: [{ date: apr15, completedAt: undefined }, { date: apr16, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SHO'],
    reasonForReview: 'Infected TKR post-washout. Monitor temperature and inflammatory markers overnight.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'T+O',
    statusChangedAt: null,
    createdAt: lateAfternoonTime.toISOString(),
    createdBy: 'Mr. Ahmed',
    comments: []
  },
  {
    id: 'han26',
    patientId: 'p68',
    reviewDates: [{ date: apr14, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['SHO'],
    reasonForReview: 'Complete heart block with temporary pacing wire. Check capture threshold at 22:00.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'Medicine',
    statusChangedAt: null,
    createdAt: midMorningTime.toISOString(),
    createdBy: 'Dr. Hughes',
    comments: []
  },
  {
    id: 'han27',
    patientId: 'p88',
    reviewDates: [{ date: apr15, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['FY1', 'Nurse'],
    reasonForReview: 'Delirious elderly patient - may need PRN sedation if becoming distressed or unsafe.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'T+O',
    statusChangedAt: null,
    createdAt: earlyAfternoonTime.toISOString(),
    createdBy: 'Dr. O\'Brien',
    comments: []
  },
  {
    id: 'han28',
    patientId: 'p81',
    reviewDates: [{ date: apr16, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['SHO', 'SpR'],
    reasonForReview: 'Post OGD for bleeding ulcer. Monitor for re-bleeding. Check Hb at midnight.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'General Surgery',
    statusChangedAt: null,
    createdAt: eveningTime.toISOString(),
    createdBy: 'Dr. Khan',
    comments: []
  },
  {
    id: 'han29',
    patientId: 'p64',
    reviewDates: [{ date: apr14, completedAt: undefined }],
    priority: 'Low',
    assignedRoles: ['FY1'],
    reasonForReview: 'Paracetamol overdose - on NAC infusion. Routine bloods check at 04:00.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'Medicine',
    statusChangedAt: null,
    createdAt: nightTime.toISOString(),
    createdBy: 'Dr. Patel',
    comments: []
  },
  {
    id: 'han30',
    patientId: 'p104',
    reviewDates: [{ date: apr14, completedAt: undefined }, { date: apr16, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['SHO'],
    reasonForReview: 'Post cauda equina decompression - monitor neurology and bladder function overnight.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    specialty: 'T+O',
    statusChangedAt: null,
    createdAt: lateAfternoonTime.toISOString(),
    createdBy: 'Mr. Ahmed',
    comments: []
  }
];

// Sample specialty referrals
const d1 = '2026-04-07T09:15:00.000Z';
const d2 = '2026-04-07T14:30:00.000Z';
const d3 = '2026-04-06T08:45:00.000Z';
const d4 = '2026-04-06T16:20:00.000Z';
const d5 = '2026-04-05T10:00:00.000Z';
const d6 = '2026-04-05T13:45:00.000Z';
const d7 = '2026-04-04T09:30:00.000Z';
const d8 = '2026-04-04T15:10:00.000Z';
const d9 = '2026-04-03T11:20:00.000Z';
const d10 = '2026-04-02T08:00:00.000Z';

const sampleSpecialtyReferrals: SpecialtyReferral[] = [
  // Cardiology (10)
  { id: 'ref1', patientId: 'p5', specialty: 'Cardiology', priority: 'High', reasonForReferral: 'Worsening heart failure with EF 25% on echo. BNP markedly elevated at 2400. Patient on maximal oral therapy but ongoing fluid retention. Requires urgent cardiology review for consideration of IV diuretics and possible CRT-D device discussion.', status: 'Pending', createdBy: 'Dr. Thompson', createdAt: d1, updatedAt: d1, comments: [{ id: 'rc1', text: 'Echo report attached. Patient reviewed by on-call - awaiting cardiology input.', createdBy: 'Dr. Thompson', createdAt: d1 }] },
  { id: 'ref2', patientId: 'p8', specialty: 'Cardiology', priority: 'High', reasonForReferral: 'New onset AF with rapid ventricular response (HR 140 bpm). Haemodynamically compromised with BP 85/60. DC cardioversion may be required. Please review urgently for rate/rhythm management.', status: 'Accepted', createdBy: 'Nurse Williams', createdAt: d2, updatedAt: d3, comments: [{ id: 'rc2', text: 'Cardiology SpR reviewed. Rate controlled with IV metoprolol. Anticoagulation started. ECHO booked.', createdBy: 'Dr. Patel', createdAt: d3 }] },
  { id: 'ref3', patientId: 'p13', specialty: 'Cardiology', priority: 'High', reasonForReferral: 'NSTEMI with troponin rise to 8500. ECG changes in leads V1-V4. Currently on DAPT and anticoagulation. Requires cardiology review for consideration of coronary angiography and possible PCI.', status: 'Accepted', createdBy: 'Dr. Chen', createdAt: d3, updatedAt: d4, comments: [] },
  { id: 'ref4', patientId: 'p21', specialty: 'Cardiology', priority: 'Medium', reasonForReferral: 'Infective endocarditis on TOE. Aortic valve vegetation 12mm. Currently on IV benzylpenicillin. Cardiology review requested for ongoing management and surgical referral planning.', status: 'Pending', createdBy: 'Dr. Evans', createdAt: d4, updatedAt: d4, comments: [] },
  { id: 'ref5', patientId: 'p29', specialty: 'Cardiology', priority: 'Medium', reasonForReferral: 'Complete heart block. Temporary pacing wire in situ. Haemodynamically stable. Requires cardiology review for permanent pacemaker insertion planning.', status: 'Accepted', createdBy: 'Nurse Adams', createdAt: d5, updatedAt: d6, comments: [{ id: 'rc3', text: 'PPM insertion booked for Thursday. Patient consented and NBM from midnight.', createdBy: 'Dr. Hughes', createdAt: d6 }] },
  { id: 'ref6', patientId: 'p34', specialty: 'Cardiology', priority: 'Medium', reasonForReferral: 'Dilated cardiomyopathy newly diagnosed on echocardiogram. EF 20%. Requires cardiology review for initiation of ACE inhibitor, beta blocker and consideration of ICD implantation.', status: 'Pending', createdBy: 'Dr. Mitchell', createdAt: d6, updatedAt: d6, comments: [] },
  { id: 'ref7', patientId: 'p47', specialty: 'Cardiology', priority: 'Low', reasonForReferral: 'Persistent hypertension despite triple therapy (BP 175/100). Possible secondary hypertension. Requesting cardiology review for further investigation and optimisation of antihypertensive regimen.', status: 'Pending', createdBy: 'Nurse Brown', createdAt: d7, updatedAt: d7, comments: [] },
  { id: 'ref8', patientId: 'p50', specialty: 'Cardiology', priority: 'High', reasonForReferral: 'Massive PE with right heart strain on CTPA. Haemodynamically borderline. Requesting urgent cardiology review for consideration of catheter-directed thrombolysis vs systemic thrombolysis.', status: 'Declined', createdBy: 'Dr. O\'Brien', createdAt: d8, updatedAt: d9, comments: [{ id: 'rc4', text: 'Declined - patient managed by respiratory team. Systemic thrombolysis given with good response.', createdBy: 'Dr. Kumar', createdAt: d9 }] },
  { id: 'ref9', patientId: 'p60', specialty: 'Cardiology', priority: 'Low', reasonForReferral: 'Asymptomatic bradycardia (HR 38 bpm) noted on routine monitoring. Currently on atenolol. Requesting cardiology review to assess need for 24h tape and medication adjustment.', status: 'Pending', createdBy: 'Nurse Jackson', createdAt: d9, updatedAt: d9, comments: [] },
  { id: 'ref10', patientId: 'p68', specialty: 'Cardiology', priority: 'Medium', reasonForReferral: 'Takotsubo cardiomyopathy post major stressor (bereavement). Apical ballooning on echo. LV function recovering. Cardiology review for outpatient follow-up planning and medication optimisation.', status: 'Accepted', createdBy: 'Dr. Thompson', createdAt: d10, updatedAt: d10, comments: [] },

  // Dermatology (10)
  { id: 'ref11', patientId: 'p1', specialty: 'Dermatology', priority: 'High', reasonForReferral: 'Extensive erythroderma covering >90% BSA. Patient systemically unwell with fever and raised inflammatory markers. Possible drug reaction vs flare of underlying psoriasis. Urgent dermatology review required for diagnosis and management.', status: 'Pending', createdBy: 'Dr. Mitchell', createdAt: d1, updatedAt: d1, comments: [] },
  { id: 'ref12', patientId: 'p6', specialty: 'Dermatology', priority: 'High', reasonForReferral: 'Suspected Stevens-Johnson Syndrome. Widespread blistering and mucosal involvement following co-trimoxazole started 10 days ago. Ophthalmology also involved. Requires urgent dermatology input for management and biopsy.', status: 'Accepted', createdBy: 'Dr. Chen', createdAt: d2, updatedAt: d3, comments: [{ id: 'rc5', text: 'Dermatology reviewed. Drug stopped. IV corticosteroids started. Transfer to specialist unit being arranged.', createdBy: 'Dr. Sharma', createdAt: d3 }] },
  { id: 'ref13', patientId: 'p11', specialty: 'Dermatology', priority: 'Medium', reasonForReferral: 'Cellulitis not responding to IV flucloxacillin after 5 days. Query necrotising fasciitis - border poorly defined, significant pain. Dermatology review requested alongside surgical review.', status: 'Pending', createdBy: 'Nurse Taylor', createdAt: d3, updatedAt: d3, comments: [] },
  { id: 'ref14', patientId: 'p16', specialty: 'Dermatology', priority: 'Medium', reasonForReferral: 'Rapidly expanding pigmented lesion on back, irregular border and satellite lesions. Possible melanoma. Requires urgent dermatology review and excision biopsy.', status: 'Accepted', createdBy: 'Dr. Evans', createdAt: d4, updatedAt: d5, comments: [{ id: 'rc6', text: 'Dermoscopy performed - high suspicion melanoma. Wide local excision booked. Oncology referral also raised.', createdBy: 'Dr. Hassan', createdAt: d5 }] },
  { id: 'ref15', patientId: 'p25', specialty: 'Dermatology', priority: 'Medium', reasonForReferral: 'Severe psoriatic flare with >60% BSA involvement. Patient has failed multiple topical therapies. Inpatient admission. Requesting dermatology review for initiation of systemic therapy (methotrexate or biologic).', status: 'Pending', createdBy: 'Nurse Williams', createdAt: d5, updatedAt: d5, comments: [] },
  { id: 'ref16', patientId: 'p31', specialty: 'Dermatology', priority: 'Low', reasonForReferral: 'Chronic pruritic rash unresponsive to antihistamines and topical steroids. Present for 3 months. Requesting dermatology review for patch testing and specialist management.', status: 'Pending', createdBy: 'Dr. Thompson', createdAt: d6, updatedAt: d6, comments: [] },
  { id: 'ref17', patientId: 'p37', specialty: 'Dermatology', priority: 'High', reasonForReferral: 'Bullous pemphigoid with extensive blistering. Nikolsky sign positive. Requires urgent dermatology review for confirmation of diagnosis and commencement of systemic immunosuppression.', status: 'Accepted', createdBy: 'Nurse Adams', createdAt: d7, updatedAt: d8, comments: [{ id: 'rc7', text: 'Skin biopsy taken. High dose prednisolone commenced. Dermatology team taking over as primary team.', createdBy: 'Dr. Hassan', createdAt: d8 }] },
  { id: 'ref18', patientId: 'p43', specialty: 'Dermatology', priority: 'Low', reasonForReferral: 'Acne vulgaris with significant scarring despite prolonged antibiotic treatment. Requesting dermatology review for consideration of isotretinoin therapy and scarring management options.', status: 'Cancelled', createdBy: 'Dr. O\'Brien', createdAt: d8, updatedAt: d9, comments: [{ id: 'rc8', text: 'Patient discharged - to be referred via outpatient route.', createdBy: 'Nurse Brown', createdAt: d9 }] },
  { id: 'ref19', patientId: 'p50', specialty: 'Dermatology', priority: 'Medium', reasonForReferral: 'Pyoderma gangrenosum on lower limb, expanding despite wound care. Associated with IBD. Requesting dermatology review for confirmation and systemic immunosuppressive treatment.', status: 'Pending', createdBy: 'Dr. Mitchell', createdAt: d9, updatedAt: d9, comments: [] },
  { id: 'ref20', patientId: 'p60', specialty: 'Dermatology', priority: 'Medium', reasonForReferral: 'Vasculitic rash on lower limbs with palpable purpura. Bloods show raised ANCA. Dermatology review requested for skin biopsy and joint management with rheumatology.', status: 'Pending', createdBy: 'Dr. Chen', createdAt: d10, updatedAt: d10, comments: [] },

  // Respiratory (10)
  { id: 'ref21', patientId: 'p2', specialty: 'Respiratory', priority: 'High', reasonForReferral: 'Severe COPD exacerbation with type 2 respiratory failure (pCO2 9.8kPa). NIV commenced but patient struggling to tolerate. Requires urgent respiratory review for management escalation and possible ITU referral.', status: 'Pending', createdBy: 'Nurse Williams', createdAt: d1, updatedAt: d1, comments: [] },
  { id: 'ref22', patientId: 'p11', specialty: 'Respiratory', priority: 'High', reasonForReferral: 'Life-threatening asthma. PEFR <33% predicted. Not responding to salbutamol nebs and IV hydrocortisone. Requesting urgent respiratory review for escalation of therapy.', status: 'Accepted', createdBy: 'Dr. Thompson', createdAt: d2, updatedAt: d2, comments: [{ id: 'rc9', text: 'Reviewed. IV magnesium given. Heliox commenced. ITU bed requested as backup.', createdBy: 'Dr. Kumar', createdAt: d2 }] },
  { id: 'ref23', patientId: 'p29', specialty: 'Respiratory', priority: 'High', reasonForReferral: 'Pneumothorax with tension features. Mediastinal shift on CXR. Patient deteriorating - SpO2 82% on high flow oxygen. Respiratory/thoracic review urgently required.', status: 'Accepted', createdBy: 'Nurse Adams', createdAt: d3, updatedAt: d3, comments: [{ id: 'rc10', text: 'Emergency needle decompression performed. Chest drain inserted. Patient stabilising.', createdBy: 'Dr. Kumar', createdAt: d3 }] },
  { id: 'ref24', patientId: 'p38', specialty: 'Respiratory', priority: 'Medium', reasonForReferral: 'Suspected community-acquired pneumonia not responding to first-line antibiotics after 72 hours. CXR shows multilobar consolidation. Requesting respiratory review for antibiotic guidance and possible bronchoscopy.', status: 'Pending', createdBy: 'Dr. Evans', createdAt: d4, updatedAt: d4, comments: [] },
  { id: 'ref25', patientId: 'p47', specialty: 'Respiratory', priority: 'Medium', reasonForReferral: 'Large pleural effusion causing dyspnoea. CT shows loculated fluid. Requesting respiratory review for thoracocentesis or chest drain insertion under ultrasound guidance.', status: 'Accepted', createdBy: 'Dr. Chen', createdAt: d5, updatedAt: d6, comments: [{ id: 'rc11', text: 'US-guided pleural aspiration performed. 1.2L straw-coloured fluid drained. Cytology sent.', createdBy: 'Dr. Kumar', createdAt: d6 }] },
  { id: 'ref26', patientId: 'p57', specialty: 'Respiratory', priority: 'Medium', reasonForReferral: 'Haemoptysis with 200ml blood in 24h. CT chest shows cavitating lesion in right upper lobe. Possible TB vs carcinoma. Requesting respiratory review for bronchoscopy and sputum collection.', status: 'Pending', createdBy: 'Nurse Taylor', createdAt: d6, updatedAt: d6, comments: [] },
  { id: 'ref27', patientId: 'p64', specialty: 'Respiratory', priority: 'Low', reasonForReferral: 'Pulmonary fibrosis (UIP pattern on HRCT) newly diagnosed on imaging. Requesting respiratory review for spirometry, 6-minute walk test and initiation of antifibrotic therapy.', status: 'Pending', createdBy: 'Dr. Mitchell', createdAt: d7, updatedAt: d7, comments: [] },
  { id: 'ref28', patientId: 'p72', specialty: 'Respiratory', priority: 'High', reasonForReferral: 'Suspected Pneumocystis jirovecii pneumonia in immunocompromised patient (on azathioprine). Bilateral ground-glass changes on CT. O2 requirement rapidly increasing. Requesting respiratory review.', status: 'Accepted', createdBy: 'Dr. Thompson', createdAt: d8, updatedAt: d8, comments: [{ id: 'rc12', text: 'High-dose co-trimoxazole started. BAL performed - PCP confirmed on direct immunofluorescence.', createdBy: 'Dr. Kumar', createdAt: d8 }] },
  { id: 'ref29', patientId: 'p79', specialty: 'Respiratory', priority: 'Medium', reasonForReferral: 'Obstructive sleep apnoea suspected. Patient with BMI 42, excessive daytime somnolence and Epworth score 18. Requesting respiratory review for sleep studies and CPAP initiation.', status: 'Pending', createdBy: 'Nurse Brown', createdAt: d9, updatedAt: d9, comments: [] },
  { id: 'ref30', patientId: 'p88', specialty: 'Respiratory', priority: 'Low', reasonForReferral: 'Sarcoidosis with bilateral hilar lymphadenopathy on CXR. Serum ACE elevated. Requesting respiratory review for bronchoscopy with BAL and transbronchial biopsy.', status: 'Pending', createdBy: 'Dr. Evans', createdAt: d10, updatedAt: d10, comments: [] },

  // Anaesthetics (3)
  { id: 'ref31', patientId: 'p93', specialty: 'Anaesthetics', priority: 'High', reasonForReferral: 'Difficult airway anticipated - Mallampati IV, limited mouth opening, short neck. Patient requires emergency laparotomy tonight. Anaesthetics review for pre-operative airway assessment and awake fibreoptic intubation planning.', status: 'Accepted', createdBy: 'Mr. Wilson', createdAt: d3, updatedAt: d4, comments: [] },
  { id: 'ref32', patientId: 'p100', specialty: 'Anaesthetics', priority: 'Medium', reasonForReferral: 'Complex pain management post major joint replacement. Current opiate regimen inadequate. Requesting anaesthetics/pain team review for multimodal analgesia optimisation and possible epidural assessment.', status: 'Pending', createdBy: 'Nurse Adams', createdAt: d6, updatedAt: d6, comments: [] },
  { id: 'ref33', patientId: 'p104', specialty: 'Anaesthetics', priority: 'Low', reasonForReferral: 'Pre-operative assessment required for elective bowel resection. Patient with significant cardiac history (CABG 2018) and CKD stage 3. Anaesthetics review for risk stratification and pre-op optimisation.', status: 'Pending', createdBy: 'Dr. Mitchell', createdAt: d8, updatedAt: d8, comments: [] },

  // Endocrinology (3)
  { id: 'ref34', patientId: 'p6', specialty: 'Endocrinology', priority: 'High', reasonForReferral: 'Diabetic ketoacidosis not resolving despite 24h FRII. pH still 7.22, bicarbonate 12. Requesting endocrinology review for insulin regimen adjustment and management optimisation.', status: 'Accepted', createdBy: 'Dr. Thompson', createdAt: d2, updatedAt: d3, comments: [{ id: 'rc13', text: 'Endocrinology reviewed. FRII rate increased. Aim for ketones <0.5 before switching to SC insulin.', createdBy: 'Dr. Shah', createdAt: d3 }] },
  { id: 'ref35', patientId: 'p44', specialty: 'Endocrinology', priority: 'Medium', reasonForReferral: 'Adrenal incidentaloma found on CT abdomen. 2.8cm left adrenal lesion with suspicious features. Requesting endocrinology review for hormonal workup and management planning.', status: 'Pending', createdBy: 'Dr. Evans', createdAt: d5, updatedAt: d5, comments: [] },
  { id: 'ref36', patientId: 'p57', specialty: 'Endocrinology', priority: 'Medium', reasonForReferral: 'Thyroid storm suspected. HR 155, temp 39.8°C, agitated. TSH suppressed, T4 markedly elevated. Requesting urgent endocrinology review for Burch-Wartofsky scoring and management.', status: 'Pending', createdBy: 'Nurse Taylor', createdAt: d7, updatedAt: d7, comments: [] },

  // Gastroenterology (3)
  { id: 'ref37', patientId: 'p31', specialty: 'Gastroenterology', priority: 'High', reasonForReferral: 'Upper GI bleed with Hb drop from 110 to 72 in 12 hours. Haematemesis ongoing. Requesting urgent gastroenterology review for OGD and variceal vs peptic ulcer management.', status: 'Accepted', createdBy: 'Dr. Khan', createdAt: d1, updatedAt: d2, comments: [{ id: 'rc14', text: 'OGD performed - active bleeding peptic ulcer. Adrenaline injection and clipping performed. Omeprazole infusion started.', createdBy: 'Dr. Patel', createdAt: d2 }] },
  { id: 'ref38', patientId: 'p81', specialty: 'Gastroenterology', priority: 'Medium', reasonForReferral: 'Ulcerative colitis flare with bloody diarrhoea 12x/day and CRP 215. Failed IV steroids at 5 days. Requesting gastroenterology review for rescue therapy (cyclosporin or infliximab).', status: 'Pending', createdBy: 'Dr. Mitchell', createdAt: d5, updatedAt: d5, comments: [] },
  { id: 'ref39', patientId: 'p88', specialty: 'Gastroenterology', priority: 'Low', reasonForReferral: 'Iron deficiency anaemia with Hb 78. Colonoscopy required to exclude colorectal cancer. Requesting gastroenterology outpatient review and endoscopy listing.', status: 'Pending', createdBy: 'Nurse Brown', createdAt: d9, updatedAt: d9, comments: [] },

  // Gynaecology (3)
  { id: 'ref40', patientId: 'p64', specialty: 'Gynaecology', priority: 'High', reasonForReferral: 'Suspected ectopic pregnancy. Beta-hCG rising (3200), no intrauterine pregnancy on transvaginal USS. Right adnexal mass 3cm. Requesting urgent gynaecology review.', status: 'Accepted', createdBy: 'Nurse Adams', createdAt: d3, updatedAt: d3, comments: [{ id: 'rc15', text: 'Reviewed - ectopic confirmed. Patient for theatre within 2 hours for laparoscopy.', createdBy: 'Mr. Ahmed', createdAt: d3 }] },
  { id: 'ref41', patientId: 'p79', specialty: 'Gynaecology', priority: 'Medium', reasonForReferral: 'Ovarian cyst 8cm with raised CA-125 (450 U/mL). USS features concerning for malignancy. Requesting gynaecology review for further assessment and management planning.', status: 'Pending', createdBy: 'Dr. Evans', createdAt: d6, updatedAt: d6, comments: [] },
  { id: 'ref42', patientId: 'p93', specialty: 'Gynaecology', priority: 'Medium', reasonForReferral: 'Post-menopausal bleeding. TVS shows endometrial thickness 14mm. Requesting gynaecology review for hysteroscopy and endometrial biopsy.', status: 'Pending', createdBy: 'Dr. Thompson', createdAt: d9, updatedAt: d9, comments: [] },

  // Haematology (3)
  { id: 'ref43', patientId: 'p13', specialty: 'Haematology', priority: 'High', reasonForReferral: 'Acute leukaemia suspected on blood film. WBC 98, blasts 78%. Requesting urgent haematology review for bone marrow biopsy and initiation of treatment.', status: 'Accepted', createdBy: 'Dr. Chen', createdAt: d2, updatedAt: d3, comments: [{ id: 'rc16', text: 'Haematology reviewed. BMA performed. AML confirmed. Starting daunorubicin/cytarabine protocol.', createdBy: 'Dr. Ali', createdAt: d3 }] },
  { id: 'ref44', patientId: 'p38', specialty: 'Haematology', priority: 'Medium', reasonForReferral: 'TTP suspected. MAHA on blood film, thrombocytopenia (plt 18), creatinine rising. ADAMTS13 sent. Requesting urgent haematology review for plasma exchange initiation.', status: 'Pending', createdBy: 'Nurse Taylor', createdAt: d5, updatedAt: d5, comments: [] },
  { id: 'ref45', patientId: 'p57', specialty: 'Haematology', priority: 'Medium', reasonForReferral: 'Recurrent DVT on anticoagulation. Thrombophilia screen previously negative. Requesting haematology review for investigation of antiphospholipid syndrome and long-term anticoagulation management.', status: 'Pending', createdBy: 'Dr. Mitchell', createdAt: d8, updatedAt: d8, comments: [] },

  // Hepatology (3)
  { id: 'ref46', patientId: 'p34', specialty: 'Hepatology', priority: 'High', reasonForReferral: 'Acute liver failure - paracetamol overdose. INR 4.2, pH 7.28, creatinine rising. Kings criteria met. Requesting urgent hepatology review for assessment for liver transplantation.', status: 'Accepted', createdBy: 'Nurse Williams', createdAt: d1, updatedAt: d1, comments: [{ id: 'rc17', text: 'Hepatology reviewed. Transfer to liver unit arranged. Kings criteria ongoing monitoring. Transplant team notified.', createdBy: 'Dr. Evans', createdAt: d1 }] },
  { id: 'ref47', patientId: 'p81', specialty: 'Hepatology', priority: 'Medium', reasonForReferral: 'Decompensated cirrhosis with new onset ascites. Child-Pugh C. Requesting hepatology review for ascitic drain, hepatic encephalopathy management and transplant assessment.', status: 'Pending', createdBy: 'Dr. Evans', createdAt: d5, updatedAt: d5, comments: [] },
  { id: 'ref48', patientId: 'p100', specialty: 'Hepatology', priority: 'Low', reasonForReferral: 'Non-alcoholic fatty liver disease with bridging fibrosis on biopsy (F3). Requesting hepatology review for optimisation of metabolic risk factors and fibroscan surveillance planning.', status: 'Pending', createdBy: 'Dr. Thompson', createdAt: d9, updatedAt: d9, comments: [] },

  // Infectious Diseases (3)
  { id: 'ref49', patientId: 'p8', specialty: 'Infectious Diseases', priority: 'High', reasonForReferral: 'Septicaemia with gram-negative bacteraemia. Blood cultures growing E. coli with ESBL resistance pattern. Requesting ID review for antibiotic rationalisation and source investigation.', status: 'Accepted', createdBy: 'Dr. Thompson', createdAt: d2, updatedAt: d3, comments: [{ id: 'rc18', text: 'ID reviewed. Switched to meropenem. Echo to exclude endocarditis. CT chest/abdomen for source.', createdBy: 'Dr. Rashid', createdAt: d3 }] },
  { id: 'ref50', patientId: 'p44', specialty: 'Infectious Diseases', priority: 'Medium', reasonForReferral: 'Suspected miliary tuberculosis. Constitutional symptoms, bilateral micronodular shadowing on CXR. AFB smear positive. Requesting ID review for treatment initiation and contact tracing.', status: 'Pending', createdBy: 'Dr. Kumar', createdAt: d6, updatedAt: d6, comments: [] },
  { id: 'ref51', patientId: 'p68', specialty: 'Infectious Diseases', priority: 'Medium', reasonForReferral: 'HIV diagnosis confirmed (CD4 45, viral load 890,000). Opportunistic infections screen sent. Requesting ID review for ART initiation and prophylaxis.', status: 'Pending', createdBy: 'Nurse Jackson', createdAt: d9, updatedAt: d9, comments: [] },

  // Intensive Care (3)
  { id: 'ref52', patientId: 'p2', specialty: 'Intensive Care', priority: 'High', reasonForReferral: 'Septic shock with MAP <65 despite 3L fluid resuscitation and noradrenaline at 0.4 mcg/kg/min. Lactate rising at 6.2. Requesting ITU review for level 3 care and vasopressor escalation.', status: 'Accepted', createdBy: 'Dr. Chen', createdAt: d1, updatedAt: d1, comments: [{ id: 'rc19', text: 'ITU SpR reviewed. Level 3 bed available. Transfer in progress. Vasopressin added.', createdBy: 'Dr. Morris', createdAt: d1 }] },
  { id: 'ref53', patientId: 'p29', specialty: 'Intensive Care', priority: 'High', reasonForReferral: 'Post-operative respiratory failure after major oesophagectomy. FiO2 0.8, P/F ratio 110. Bilateral infiltrates. ARDS picture. Requesting ITU review for intubation and lung-protective ventilation.', status: 'Accepted', createdBy: 'Mr. Wilson', createdAt: d4, updatedAt: d4, comments: [] },
  { id: 'ref54', patientId: 'p72', specialty: 'Intensive Care', priority: 'Medium', reasonForReferral: 'Worsening acute pancreatitis (Ranson score 5). Developing organ dysfunction. Requesting ITU review for level 2/3 care assessment and monitoring.', status: 'Pending', createdBy: 'Dr. Evans', createdAt: d7, updatedAt: d7, comments: [] },

  // Interventional Radiology (3)
  { id: 'ref55', patientId: 'p31', specialty: 'Interventional Radiology', priority: 'High', reasonForReferral: 'Ongoing GI haemorrhage with haemodynamic compromise. OGD unsuccessful at obtaining haemostasis. Requesting urgent IR review for angiography and embolisation.', status: 'Accepted', createdBy: 'Dr. Khan', createdAt: d3, updatedAt: d4, comments: [{ id: 'rc20', text: 'IR performed mesenteric angiography. Haemostasis achieved with coil embolisation. Patient stable.', createdBy: 'Dr. Patel', createdAt: d4 }] },
  { id: 'ref56', patientId: 'p57', specialty: 'Interventional Radiology', priority: 'Medium', reasonForReferral: 'Biliary obstruction with cholangitis. ERCP failed due to surgically altered anatomy. Requesting IR review for percutaneous transhepatic cholangiography and biliary drainage.', status: 'Pending', createdBy: 'Dr. Mitchell', createdAt: d6, updatedAt: d6, comments: [] },
  { id: 'ref57', patientId: 'p93', specialty: 'Interventional Radiology', priority: 'Medium', reasonForReferral: 'Hepatocellular carcinoma with portal vein involvement. Unsuitable for surgical resection. Requesting IR review for TACE or SIRT assessment.', status: 'Pending', createdBy: 'Dr. Evans', createdAt: d9, updatedAt: d9, comments: [] },

  // General Surgery (3)
  { id: 'ref58', patientId: 'p43', specialty: 'General Surgery', priority: 'High', reasonForReferral: 'Perforated viscus on erect CXR. Patient acutely unwell with peritonism. Requesting urgent surgical review for emergency laparotomy.', status: 'Accepted', createdBy: 'Dr. Thompson', createdAt: d2, updatedAt: d2, comments: [{ id: 'rc21', text: 'Surgical review completed. Patient for emergency theatre within 1 hour. Consent obtained.', createdBy: 'Mr. Wilson', createdAt: d2 }] },
  { id: 'ref59', patientId: 'p100', specialty: 'General Surgery', priority: 'Medium', reasonForReferral: 'Incarcerated inguinal hernia with signs of bowel obstruction. Requesting surgical review for assessment and possible emergency repair.', status: 'Pending', createdBy: 'Nurse Taylor', createdAt: d5, updatedAt: d5, comments: [] },
  { id: 'ref60', patientId: 'p104', specialty: 'General Surgery', priority: 'Low', reasonForReferral: 'Symptomatic gallstones confirmed on ultrasound with two episodes of biliary colic. Requesting surgical review for consideration of elective cholecystectomy.', status: 'Pending', createdBy: 'Dr. Chen', createdAt: d8, updatedAt: d8, comments: [] },

  // Nephrology (3)
  { id: 'ref61', patientId: 'p2', specialty: 'Nephrology', priority: 'High', reasonForReferral: 'AKI stage 3 with oliguria <0.3ml/kg/h for 12 hours. Creatinine 542 from baseline 85. Potassium 6.8 with ECG changes. Requesting urgent nephrology review for possible haemodialysis.', status: 'Accepted', createdBy: 'Dr. Mitchell', createdAt: d3, updatedAt: d3, comments: [{ id: 'rc22', text: 'Nephrology reviewed. Urgent haemodiafiltration commenced via femoral Vascath. Monitoring in HDU.', createdBy: 'Dr. Okafor', createdAt: d3 }] },
  { id: 'ref62', patientId: 'p47', specialty: 'Nephrology', priority: 'Medium', reasonForReferral: 'Rapidly progressive glomerulonephritis. Creatinine 380 and rising. Urinalysis shows RBC casts. ANCAs positive. Requesting nephrology review for renal biopsy and consideration of pulse steroids/cyclophosphamide.', status: 'Pending', createdBy: 'Dr. Evans', createdAt: d6, updatedAt: d6, comments: [] },
  { id: 'ref63', patientId: 'p72', specialty: 'Nephrology', priority: 'Low', reasonForReferral: 'CKD stage 4 (eGFR 18) with progressive decline. Requesting nephrology review for pre-dialysis education, AVF formation planning and renal replacement therapy decision.', status: 'Pending', createdBy: 'Nurse Adams', createdAt: d10, updatedAt: d10, comments: [] },

  // Neurology (3)
  { id: 'ref64', patientId: 'p16', specialty: 'Neurology', priority: 'High', reasonForReferral: 'Status epilepticus not responding to benzodiazepines. Now on IV levetiracetam and phenytoin load. Requesting urgent neurology review for further anti-epileptic therapy and EEG monitoring.', status: 'Accepted', createdBy: 'Dr. Chen', createdAt: d1, updatedAt: d2, comments: [{ id: 'rc23', text: 'Neurology reviewed. Propofol infusion started for refractory status. EEG requested. ITU level care.', createdBy: 'Dr. Osei', createdAt: d2 }] },
  { id: 'ref65', patientId: 'p38', specialty: 'Neurology', priority: 'Medium', reasonForReferral: 'Guillain-Barré syndrome suspected. Progressive ascending weakness over 5 days. NCS/EMG showing demyelinating pattern. Requesting neurology review for IVIG treatment and respiratory monitoring.', status: 'Pending', createdBy: 'Nurse Williams', createdAt: d5, updatedAt: d5, comments: [] },
  { id: 'ref66', patientId: 'p64', specialty: 'Neurology', priority: 'Medium', reasonForReferral: 'Multiple sclerosis relapse with rapidly worsening visual acuity and optic neuritis. Requesting neurology review for IV methylprednisolone and long-term disease-modifying therapy.', status: 'Pending', createdBy: 'Dr. Thompson', createdAt: d8, updatedAt: d8, comments: [] },

  // Neurosurgery (3)
  { id: 'ref67', patientId: 'p25', specialty: 'Neurosurgery', priority: 'High', reasonForReferral: 'Extradural haematoma on CT head. GCS 12 and falling. Pupil asymmetry developing. Requesting urgent neurosurgical review for emergency craniotomy.', status: 'Accepted', createdBy: 'Dr. Mitchell', createdAt: d2, updatedAt: d2, comments: [{ id: 'rc24', text: 'Neurosurgery reviewed. Patient for emergency theatre. Craniotomy and evacuation performed.', createdBy: 'Mr. Patel', createdAt: d2 }] },
  { id: 'ref68', patientId: 'p50', specialty: 'Neurosurgery', priority: 'Medium', reasonForReferral: 'Lumbar disc prolapse with cauda equina syndrome. Urinary retention and saddle anaesthesia. Requesting urgent neurosurgery review for emergency decompression.', status: 'Accepted', createdBy: 'Nurse Taylor', createdAt: d4, updatedAt: d5, comments: [] },
  { id: 'ref69', patientId: 'p79', specialty: 'Neurosurgery', priority: 'Medium', reasonForReferral: 'Brain tumour on MRI - ring-enhancing lesion 3.5cm with significant oedema and midline shift. Requesting neurosurgery review for biopsy and craniotomy planning.', status: 'Pending', createdBy: 'Dr. Evans', createdAt: d7, updatedAt: d7, comments: [] },

  // Oncology (3)
  { id: 'ref70', patientId: 'p16', specialty: 'Oncology', priority: 'High', reasonForReferral: 'Hypercalcaemia of malignancy (calcium 3.8). Known breast cancer with extensive bone metastases. Requesting oncology review for bisphosphonate treatment and systemic therapy review.', status: 'Accepted', createdBy: 'Dr. Thompson', createdAt: d3, updatedAt: d4, comments: [{ id: 'rc25', text: 'Oncology reviewed. IV zoledronate given. Palliative care co-involved. Systemic therapy paused.', createdBy: 'Dr. Ahmed', createdAt: d4 }] },
  { id: 'ref71', patientId: 'p44', specialty: 'Oncology', priority: 'Medium', reasonForReferral: 'Suspected cord compression - back pain with progressive lower limb weakness in known lymphoma patient. MRI spine shows epidural disease at T8. Requesting urgent oncology review for high-dose steroids and radiotherapy.', status: 'Pending', createdBy: 'Nurse Jackson', createdAt: d6, updatedAt: d6, comments: [] },
  { id: 'ref72', patientId: 'p68', specialty: 'Oncology', priority: 'Low', reasonForReferral: 'Newly diagnosed lung adenocarcinoma on biopsy (EGFR positive). Stage IIIB. Requesting oncology review for MDT discussion and targeted therapy initiation.', status: 'Pending', createdBy: 'Dr. Evans', createdAt: d10, updatedAt: d10, comments: [] },

  // Ophthalmology (3)
  { id: 'ref73', patientId: 'p6', specialty: 'Ophthalmology', priority: 'High', reasonForReferral: 'Acute angle closure glaucoma - red eye, IOP 52mmHg, corneal oedema. Patient in severe pain. Requesting urgent ophthalmology review for IOP reduction and laser iridotomy.', status: 'Accepted', createdBy: 'Dr. Chen', createdAt: d1, updatedAt: d1, comments: [{ id: 'rc26', text: 'Ophthalmology reviewed. IOP lowered with acetazolamide and timolol. Laser PI performed.', createdBy: 'Dr. James', createdAt: d1 }] },
  { id: 'ref74', patientId: 'p38', specialty: 'Ophthalmology', priority: 'Medium', reasonForReferral: 'Sudden painless visual loss in left eye. Fundoscopy shows pale disc and cherry-red spot at macula - central retinal artery occlusion. Requesting ophthalmology review.', status: 'Pending', createdBy: 'Nurse Adams', createdAt: d5, updatedAt: d5, comments: [] },
  { id: 'ref75', patientId: 'p64', specialty: 'Ophthalmology', priority: 'Medium', reasonForReferral: 'Diabetic retinopathy with vitreous haemorrhage causing sudden visual deterioration. Requesting ophthalmology review for vitrectomy assessment.', status: 'Pending', createdBy: 'Dr. Mitchell', createdAt: d8, updatedAt: d8, comments: [] },

  // Orthopaedics (3)
  { id: 'ref76', patientId: 'p37', specialty: 'Orthopaedics', priority: 'High', reasonForReferral: 'Compartment syndrome right forearm following trauma. Tense swelling, pain out of proportion, paraesthesia in hand. Requesting urgent orthopaedics review for fasciotomy.', status: 'Accepted', createdBy: 'Dr. Thompson', createdAt: d2, updatedAt: d2, comments: [{ id: 'rc27', text: 'Orthopaedics reviewed - confirmed compartment syndrome. Patient for emergency fasciotomy.', createdBy: 'Mr. Ahmed', createdAt: d2 }] },
  { id: 'ref77', patientId: 'p57', specialty: 'Orthopaedics', priority: 'Medium', reasonForReferral: 'Prosthetic joint infection - raised CRP, swollen hot joint 2 years post-TKR. Requesting orthopaedics review for aspiration and consideration of revision surgery.', status: 'Pending', createdBy: 'Nurse Brown', createdAt: d6, updatedAt: d6, comments: [] },
  { id: 'ref78', patientId: 'p93', specialty: 'Orthopaedics', priority: 'Medium', reasonForReferral: 'Vertebral fracture at L2 in known myeloma patient. MRI shows extensive disease. Requesting orthopaedics review for vertebroplasty assessment.', status: 'Pending', createdBy: 'Dr. Evans', createdAt: d9, updatedAt: d9, comments: [] },

  // Paediatrics (3)
  { id: 'ref79', patientId: 'p1', specialty: 'Paediatrics', priority: 'High', reasonForReferral: 'Child 8 years old transferred from A&E with suspected meningococcal meningitis. Petechial rash, GCS 13, neck stiffness, photophobia. Requesting urgent paediatric review for LP and antibiotics.', status: 'Accepted', createdBy: 'Dr. Thompson', createdAt: d1, updatedAt: d1, comments: [{ id: 'rc28', text: 'Paediatrics reviewed. IV ceftriaxone commenced. CT head done - LP performed. Awaiting CSF results.', createdBy: 'Dr. Singh', createdAt: d1 }] },
  { id: 'ref80', patientId: 'p11', specialty: 'Paediatrics', priority: 'Medium', reasonForReferral: 'Diabetic ketoacidosis in 14-year-old. First presentation. pH 7.19, glucose 28. Requesting paediatric review for FRII management and diabetes nurse education.', status: 'Pending', createdBy: 'Nurse Williams', createdAt: d5, updatedAt: d5, comments: [] },
  { id: 'ref81', patientId: 'p25', specialty: 'Paediatrics', priority: 'Low', reasonForReferral: 'Failure to thrive in 2-year-old. Weight below 0.4th centile. Requesting paediatric dietitian and developmental review.', status: 'Pending', createdBy: 'Nurse Jackson', createdAt: d9, updatedAt: d9, comments: [] },

  // Palliative Care (3)
  { id: 'ref82', patientId: 'p25', specialty: 'Palliative Care', priority: 'High', reasonForReferral: 'End-stage pancreatic cancer with intractable pain (NRS 9/10). Current analgesia inadequate. Requesting palliative care review for pain management optimisation and goals of care discussion.', status: 'Accepted', createdBy: 'Dr. Mitchell', createdAt: d2, updatedAt: d3, comments: [{ id: 'rc29', text: 'Palliative care reviewed. Syringe driver commenced. Family meeting arranged. DNACPR discussed and documented.', createdBy: 'Dr. Ford', createdAt: d3 }] },
  { id: 'ref83', patientId: 'p29', specialty: 'Palliative Care', priority: 'Medium', reasonForReferral: 'End-stage COPD. Patient expressing wishes for comfort measures only. Requesting palliative care review for advanced care planning and symptom management.', status: 'Pending', createdBy: 'Nurse Adams', createdAt: d6, updatedAt: d6, comments: [] },
  { id: 'ref84', patientId: 'p79', specialty: 'Palliative Care', priority: 'Medium', reasonForReferral: 'Glioblastoma multiforme, progressive despite radiotherapy. Patient declining performance status. Requesting palliative care review for symptom control and discharge home planning with hospice input.', status: 'Pending', createdBy: 'Dr. Evans', createdAt: d9, updatedAt: d9, comments: [] },

  // Psychiatry (3)
  { id: 'ref85', patientId: 'p47', specialty: 'Psychiatry', priority: 'High', reasonForReferral: 'Serious suicide attempt (overdose, paracetamol and amitriptyline). Medically fit for psychiatric assessment. Requesting urgent psychiatry review for mental state assessment and risk management plan.', status: 'Accepted', createdBy: 'Dr. Thompson', createdAt: d2, updatedAt: d3, comments: [{ id: 'rc30', text: 'Psychiatry reviewed. Section 136 applied. Patient detained under MHA for inpatient psychiatric assessment.', createdBy: 'Dr. Kovacs', createdAt: d3 }] },
  { id: 'ref86', patientId: 'p64', specialty: 'Psychiatry', priority: 'Medium', reasonForReferral: 'Delirium tremens day 3 of alcohol withdrawal. CIWA score 28. Hallucinations, agitation, tremor. Requesting psychiatry liaison review for benzodiazepine titration and detox monitoring.', status: 'Pending', createdBy: 'Nurse Brown', createdAt: d6, updatedAt: d6, comments: [] },
  { id: 'ref87', patientId: 'p88', specialty: 'Psychiatry', priority: 'Low', reasonForReferral: 'Functional neurological disorder suspected. Dissociative seizures on video telemetry. No epileptiform discharges. Requesting psychiatry review for CBT referral and psychoeducation.', status: 'Pending', createdBy: 'Dr. Evans', createdAt: d10, updatedAt: d10, comments: [] },

  // Rheumatology (3)
  { id: 'ref88', patientId: 'p1', specialty: 'Rheumatology', priority: 'High', reasonForReferral: 'Acute septic arthritis of left knee - joint hot, swollen, WBC in synovial fluid >80,000. Requesting rheumatology review alongside orthopaedics for joint washout planning and antibiotic selection.', status: 'Pending', createdBy: 'Dr. Mitchell', createdAt: d3, updatedAt: d3, comments: [] },
  { id: 'ref89', patientId: 'p38', specialty: 'Rheumatology', priority: 'Medium', reasonForReferral: 'Newly diagnosed SLE with nephritis (proteinuria 4g/24h, haematuria, creatinine rising). Requesting rheumatology review for renal biopsy co-ordination and immunosuppression planning.', status: 'Accepted', createdBy: 'Dr. Chen', createdAt: d6, updatedAt: d7, comments: [] },
  { id: 'ref90', patientId: 'p72', specialty: 'Rheumatology', priority: 'Low', reasonForReferral: 'Ankylosing spondylitis with inadequate response to NSAIDs and sulfasalazine. Requesting rheumatology review for anti-TNF therapy assessment.', status: 'Pending', createdBy: 'Nurse Taylor', createdAt: d10, updatedAt: d10, comments: [] },

  // Urology (3)
  { id: 'ref91', patientId: 'p50', specialty: 'Urology', priority: 'High', reasonForReferral: 'Urosepsis with obstructed infected kidney. CT shows left hydronephrosis with calculus at PUJ. Requesting urgent urology review for emergency nephrostomy or ureteric stent.', status: 'Accepted', createdBy: 'Nurse Williams', createdAt: d1, updatedAt: d2, comments: [{ id: 'rc31', text: 'Urology reviewed. Ureteric stent inserted under GA. Patient responding to IV meropenem.', createdBy: 'Mr. Ahmed', createdAt: d2 }] },
  { id: 'ref92', patientId: 'p79', specialty: 'Urology', priority: 'Medium', reasonForReferral: 'Haematuria with clot retention. Bladder washout ongoing. Suspected bladder cancer on cystoscopy (suspicious lesion). Requesting urology review for TURBT planning.', status: 'Pending', createdBy: 'Dr. Thompson', createdAt: d5, updatedAt: d5, comments: [] },
  { id: 'ref93', patientId: 'p104', specialty: 'Urology', priority: 'Low', reasonForReferral: 'PSA 68 ng/mL with hard irregular prostate on DRE. Requesting urology review for TRUS biopsy and prostate cancer workup.', status: 'Pending', createdBy: 'Dr. Evans', createdAt: d9, updatedAt: d9, comments: [] },

  // Vascular Surgery (3)
  { id: 'ref94', patientId: 'p13', specialty: 'Vascular Surgery', priority: 'High', reasonForReferral: 'Acute limb ischaemia. Cold pulseless painful right leg, mottling to knee. Onset 4 hours. Requesting urgent vascular surgery review for embolectomy or bypass.', status: 'Accepted', createdBy: 'Dr. Thompson', createdAt: d1, updatedAt: d1, comments: [{ id: 'rc32', text: 'Vascular reviewed. Patient for urgent embolectomy. Heparin started. Theatre notified.', createdBy: 'Mr. Patel', createdAt: d1 }] },
  { id: 'ref95', patientId: 'p47', specialty: 'Vascular Surgery', priority: 'High', reasonForReferral: 'Ruptured abdominal aortic aneurysm. CT shows 7.8cm AAA with retroperitoneal haematoma. Requesting emergency vascular surgery review - patient for EVAR or open repair.', status: 'Accepted', createdBy: 'Nurse Adams', createdAt: d3, updatedAt: d3, comments: [{ id: 'rc33', text: 'Vascular reviewed. For emergency EVAR. Theatre team assembled. Blood products requested.', createdBy: 'Mr. Patel', createdAt: d3 }] },
  { id: 'ref96', patientId: 'p81', specialty: 'Vascular Surgery', priority: 'Medium', reasonForReferral: 'Critical limb ischaemia with non-healing ulcer on left great toe. ABPI 0.42. CT angiogram shows femoro-popliteal occlusion. Requesting vascular review for revascularisation options.', status: 'Pending', createdBy: 'Dr. Mitchell', createdAt: d7, updatedAt: d7, comments: [] }
];

const _today = new Date().toISOString().split('T')[0];
const _tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const _yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const _2dAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
const _3dAgo = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];

const sampleTasks: PatientTask[] = [
  { id: 'task1', patientId: 'p1', createdBy: 'Dr. Williams', assignedTo: ['Nurse'], priority: 'High', taskDetails: 'Hourly observations required. Record BP, HR, RR, SpO2, Temp and NEWS every hour. Alert registrar if NEWS ≥5 or any single parameter scores 3.', status: 'New', dueDate: _today, dueTime: '09:00', createdAt: `${_3dAgo}T08:00:00.000Z`, updatedAt: `${_3dAgo}T08:00:00.000Z`, comments: [] },
  { id: 'task2', patientId: 'p2', createdBy: 'Dr. Patel', assignedTo: ['Ward Doctor'], priority: 'High', taskDetails: 'Review morning blood results. Hb was 7.2 on admission. Discuss with haematology if below 7.0. Consider transfusion if symptomatic.', status: 'New', dueDate: _today, dueTime: '10:00', createdAt: `${_2dAgo}T09:00:00.000Z`, updatedAt: `${_2dAgo}T09:00:00.000Z`, comments: [] },
  { id: 'task3', patientId: 'p3', createdBy: 'Nurse Jenkins', assignedTo: ['Physio'], priority: 'Medium', taskDetails: 'Mobility assessment following hip replacement. Patient walked short distances yesterday. Aim for 10m corridor walk with frame. Review stair assessment if ward physio agrees.', status: 'In Progress', dueDate: _today, dueTime: '11:00', createdAt: `${_2dAgo}T10:00:00.000Z`, updatedAt: `${_yesterday}T14:00:00.000Z`, comments: [{ id: 'tc3a', text: 'Started assessment this morning. Patient keen but fatiguing quickly.', createdBy: 'Physio Thompson', createdAt: `${_yesterday}T14:00:00.000Z` }] },
  { id: 'task4', patientId: 'p4', createdBy: 'Dr. Chen', assignedTo: ['Occupational Therapist'], priority: 'Medium', taskDetails: 'Home assessment required. Patient lives alone in a 2-storey house. Needs stair assessment, kitchen assessment and review of grab rails. Aim for discharge planning meeting this week.', status: 'New', dueDate: _tomorrow, createdAt: `${_2dAgo}T11:00:00.000Z`, updatedAt: `${_2dAgo}T11:00:00.000Z`, comments: [] },
  { id: 'task5', patientId: 'p5', createdBy: 'Dr. Williams', assignedTo: ['Dietician'], priority: 'High', taskDetails: 'Nutritional assessment urgent. Patient has lost 8kg over past 6 weeks. BMI now 16.2. Review MUST score and initiate supplemental nutrition. Consider NG feeding if oral intake insufficient.', status: 'New', dueDate: _today, createdAt: `${_yesterday}T08:30:00.000Z`, updatedAt: `${_yesterday}T08:30:00.000Z`, comments: [] },
  { id: 'task6', patientId: 'p6', createdBy: 'Nurse Davis', assignedTo: ['HCA'], priority: 'Low', taskDetails: 'Assist with morning wash and dressing. Patient can partially self-care but needs help with lower limbs. Ensure bed and surrounding area are clean and tidy.', status: 'Complete', dueDate: _yesterday, dueTime: '08:00', createdAt: `${_3dAgo}T07:00:00.000Z`, updatedAt: `${_yesterday}T09:00:00.000Z`, comments: [] },
  { id: 'task7', patientId: 'p7', createdBy: 'Dr. Patel', assignedTo: ['Nurse', 'Ward Doctor'], priority: 'High', taskDetails: 'Strict fluid balance monitoring. Patient in acute heart failure. Record all input and output hourly. Alert if urine output <30ml/hr for 2 consecutive hours. Daily weight at 07:00.', status: 'In Progress', dueDate: _today, dueTime: '07:00', createdAt: `${_2dAgo}T06:00:00.000Z`, updatedAt: `${_yesterday}T18:00:00.000Z`, comments: [{ id: 'tc7a', text: 'Urine output has improved overnight. Currently averaging 45ml/hr.', createdBy: 'Night Nurse', createdAt: `${_yesterday}T06:00:00.000Z`, seenAt: `${_yesterday}T08:00:00.000Z` }] },
  { id: 'task8', patientId: 'p8', createdBy: 'Dr. Ahmed', assignedTo: ['Physio'], priority: 'Medium', taskDetails: 'Respiratory physiotherapy for patient with post-operative atelectasis. Left lower lobe changes on CXR. Aim for 3 sessions today. Teach active cycle of breathing technique.', status: 'In Progress', dueDate: _today, createdAt: `${_yesterday}T09:00:00.000Z`, updatedAt: `${_yesterday}T15:00:00.000Z`, comments: [] },
  { id: 'task9', patientId: 'p9', createdBy: 'Dr. Williams', assignedTo: ['Ward Doctor'], priority: 'Medium', taskDetails: 'Discharge planning review. Patient medically fit but awaiting care package. Contact social services for update on package status. Estimated discharge tomorrow if package confirmed.', status: 'New', dueDate: _today, dueTime: '14:00', createdAt: `${_yesterday}T10:00:00.000Z`, updatedAt: `${_yesterday}T10:00:00.000Z`, comments: [] },
  { id: 'task10', patientId: 'p10', createdBy: 'Nurse Smith', assignedTo: ['Nurse'], priority: 'High', taskDetails: 'Blood glucose monitoring QDS. Patient with poorly controlled T2DM post-surgery. Target BM 6-10 mmol/L. Sliding scale insulin in place — follow protocol. Notify doctor if BM >15 or <4.', status: 'New', dueDate: _today, createdAt: `${_yesterday}T11:00:00.000Z`, updatedAt: `${_yesterday}T11:00:00.000Z`, comments: [] },
  { id: 'task11', patientId: 'p11', createdBy: 'Dr. Chen', assignedTo: ['Dietician'], priority: 'Medium', taskDetails: 'Review enteral feeding regime for patient on NG feeds. Current rate 50ml/hr. Reassess tolerance and adjust rate as clinically indicated. Document in nutrition plan.', status: 'Complete', dueDate: _yesterday, createdAt: `${_3dAgo}T09:00:00.000Z`, updatedAt: `${_yesterday}T16:00:00.000Z`, comments: [{ id: 'tc11a', text: 'Rate increased to 60ml/hr. Tolerating well. Will review again in 24 hours.', createdBy: 'Dietician Brown', createdAt: `${_yesterday}T16:00:00.000Z` }] },
  { id: 'task12', patientId: 'p12', createdBy: 'Dr. Patel', assignedTo: ['Occupational Therapist'], priority: 'Low', taskDetails: 'Cognitive assessment for elderly patient with background dementia. Patient appears more confused than baseline. Mini-ACE or MOCA assessment. Discuss results with medical team.', status: 'New', dueDate: _tomorrow, createdAt: `${_yesterday}T12:00:00.000Z`, updatedAt: `${_yesterday}T12:00:00.000Z`, comments: [] },
  { id: 'task13', patientId: 'p13', createdBy: 'Nurse Johnson', assignedTo: ['HCA'], priority: 'Medium', taskDetails: 'Pressure area care — reposition every 2 hours. Patient at high risk per Waterlow score (21). Document all repositioning in care plan. Alert nurse if any skin breakdown noted.', status: 'In Progress', dueDate: _today, createdAt: `${_2dAgo}T08:00:00.000Z`, updatedAt: `${_yesterday}T20:00:00.000Z`, comments: [] },
  { id: 'task14', patientId: 'p14', createdBy: 'Dr. Ahmed', assignedTo: ['Ward Doctor', 'Nurse'], priority: 'High', taskDetails: 'Post-op review at 6 hours. Check surgical site, drain output, and pain management. Ensure DVT prophylaxis prescribed. Patient to have routine blood tests at 18:00.', status: 'Complete', dueDate: _yesterday, dueTime: '18:00', createdAt: `${_2dAgo}T12:00:00.000Z`, updatedAt: `${_yesterday}T19:00:00.000Z`, comments: [] },
  { id: 'task15', patientId: 'p15', createdBy: 'Dr. Williams', assignedTo: ['Nurse'], priority: 'Medium', taskDetails: 'Catheter care and fluid balance. Ensure catheter patent and draining freely. Record urine output hourly. Target >0.5ml/kg/hr. Consider trial of void tomorrow if urine output stable.', status: 'New', dueDate: _today, createdAt: `${_yesterday}T13:00:00.000Z`, updatedAt: `${_yesterday}T13:00:00.000Z`, comments: [] },
  { id: 'task16', patientId: 'p1', createdBy: 'Nurse Jenkins', assignedTo: ['Physio'], priority: 'Low', taskDetails: 'Assess for Zimmer frame or walking aid. Patient recovering from acute illness, previously independent. Trial mobilisation on ward. Aim for discharge within 48 hours if safe to mobilise.', status: 'New', dueDate: _tomorrow, createdAt: `${_yesterday}T14:00:00.000Z`, updatedAt: `${_yesterday}T14:00:00.000Z`, comments: [] },
  { id: 'task17', patientId: 'p16', createdBy: 'Dr. Patel', assignedTo: ['Ward Doctor'], priority: 'High', taskDetails: 'Urgent drug chart review. Patient brought in on multiple medications. Reconcile with GP drug list. Check for interactions with new prescriptions. Rewrite drug chart clearly.', status: 'New', dueDate: _today, dueTime: '12:00', createdAt: `${_yesterday}T07:00:00.000Z`, updatedAt: `${_yesterday}T07:00:00.000Z`, comments: [] },
  { id: 'task18', patientId: 'p17', createdBy: 'Dr. Chen', assignedTo: ['Dietician'], priority: 'Low', taskDetails: 'Nutrition support for patient with IBD flare. Low residue diet assessment. Review current supplements. Consider involvement of specialist dietician if not improving.', status: 'New', dueDate: _tomorrow, createdAt: `${_yesterday}T15:00:00.000Z`, updatedAt: `${_yesterday}T15:00:00.000Z`, comments: [] },
  { id: 'task19', patientId: 'p18', createdBy: 'Dr. Ahmed', assignedTo: ['Occupational Therapist'], priority: 'Medium', taskDetails: 'Upper limb function assessment following CVA. Patient has right-sided weakness. Assess ADL ability and functional grip strength. Recommend appropriate aids. Liaise with physio regarding MDT plan.', status: 'In Progress', dueDate: _today, createdAt: `${_2dAgo}T09:00:00.000Z`, updatedAt: `${_today}T09:00:00.000Z`, comments: [{ id: 'tc19a', text: 'Initial assessment done. Right hand grip significantly reduced. Starting adapted ADL programme.', createdBy: 'OT Davies', createdAt: `${_today}T09:00:00.000Z` }] },
  { id: 'task20', patientId: 'p19', createdBy: 'Nurse Carter', assignedTo: ['HCA'], priority: 'Low', taskDetails: 'Assist with meal times. Patient has dysphagia (thickened fluids). Ensure correct consistency is provided. Encourage small frequent mouthfuls. Alert nurse if patient coughs during eating.', status: 'New', dueDate: _today, dueTime: '12:00', createdAt: `${_yesterday}T11:00:00.000Z`, updatedAt: `${_yesterday}T11:00:00.000Z`, comments: [] },
  { id: 'task21', patientId: 'p20', createdBy: 'Dr. Williams', assignedTo: ['Nurse', 'Ward Doctor'], priority: 'High', taskDetails: 'IV antibiotics monitoring. Patient on IV Tazocin 4.5g TDS for severe cellulitis. Ensure cannula patent before each dose. Monitor for allergy reaction. Review switch to oral when CRP trending down.', status: 'In Progress', dueDate: _today, createdAt: `${_3dAgo}T10:00:00.000Z`, updatedAt: `${_yesterday}T10:00:00.000Z`, comments: [] },
  { id: 'task22', patientId: 'p21', createdBy: 'Dr. Patel', assignedTo: ['Physio'], priority: 'Medium', taskDetails: 'Post-fall physiotherapy assessment. Patient fell in corridor overnight. No fractures on X-ray. Formal falls risk assessment, gait analysis, and review of footwear. Consider bed alarm.', status: 'New', dueDate: _today, createdAt: `${_today}T07:00:00.000Z`, updatedAt: `${_today}T07:00:00.000Z`, comments: [] },
  { id: 'task23', patientId: 'p22', createdBy: 'Dr. Chen', assignedTo: ['Ward Doctor'], priority: 'Medium', taskDetails: 'Imaging review with radiologist. CT Chest showing possible pulmonary embolism. Formal radiology report still pending. Chase report and discuss findings with consultant.', status: 'New', dueDate: _today, dueTime: '11:00', createdAt: `${_yesterday}T16:00:00.000Z`, updatedAt: `${_yesterday}T16:00:00.000Z`, comments: [] },
  { id: 'task24', patientId: 'p23', createdBy: 'Nurse Morris', assignedTo: ['Dietician', 'Nurse'], priority: 'Medium', taskDetails: 'Assess oral intake and initiate nutritional support plan. Patient has been nil by mouth for 48 hours post-surgery. Surgical team have now cleared for fluids and light diet. Progress gradually.', status: 'New', dueDate: _today, createdAt: `${_yesterday}T10:00:00.000Z`, updatedAt: `${_yesterday}T10:00:00.000Z`, comments: [] },
  { id: 'task25', patientId: 'p24', createdBy: 'Dr. Ahmed', assignedTo: ['HCA', 'Nurse'], priority: 'Low', taskDetails: 'Bowel care assessment. Patient has not opened bowels for 5 days. Ensure prescribed laxatives are being administered. Report to nurse if no bowel movement by today.', status: 'New', dueDate: _today, createdAt: `${_yesterday}T09:00:00.000Z`, updatedAt: `${_yesterday}T09:00:00.000Z`, comments: [] },
];

// Initialize with sample data if empty
export function initializeData(): void {
  if (!isBrowser) return;

  const initialized = localStorage.getItem(STORAGE_KEYS.initialized);
  if (!initialized) {
    setStorage(STORAGE_KEYS.patients, samplePatients);
    setStorage(STORAGE_KEYS.handoverNotes, sampleHandoverNotes);
    setStorage(STORAGE_KEYS.hospitalAtNight, sampleHospitalAtNight);
    setStorage(STORAGE_KEYS.specialtyReferrals, sampleSpecialtyReferrals);
    setStorage(STORAGE_KEYS.tasks, sampleTasks);
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

// Specialty Referral functions
export function getAllSpecialtyReferrals(): SpecialtyReferral[] {
  return getStorage<SpecialtyReferral[]>(STORAGE_KEYS.specialtyReferrals, [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getSpecialtyReferralById(id: string): SpecialtyReferral | undefined {
  const referrals = getStorage<SpecialtyReferral[]>(STORAGE_KEYS.specialtyReferrals, []);
  return referrals.find(r => r.id === id);
}

export function getSpecialtyReferralsByPatient(patientId: string): SpecialtyReferral[] {
  return getAllSpecialtyReferrals().filter(r => r.patientId === patientId);
}

export function createSpecialtyReferral(referral: SpecialtyReferral): SpecialtyReferral {
  const referrals = getStorage<SpecialtyReferral[]>(STORAGE_KEYS.specialtyReferrals, []);
  referrals.push(referral);
  setStorage(STORAGE_KEYS.specialtyReferrals, referrals);
  return referral;
}

export function updateSpecialtyReferral(id: string, updates: Partial<SpecialtyReferral>): SpecialtyReferral | undefined {
  const referrals = getStorage<SpecialtyReferral[]>(STORAGE_KEYS.specialtyReferrals, []);
  const index = referrals.findIndex(r => r.id === id);
  if (index === -1) return undefined;
  referrals[index] = { ...referrals[index], ...updates, updatedAt: new Date().toISOString() };
  setStorage(STORAGE_KEYS.specialtyReferrals, referrals);
  return referrals[index];
}

export function addCommentToReferral(id: string, comment: ReferralComment): SpecialtyReferral | undefined {
  const referrals = getStorage<SpecialtyReferral[]>(STORAGE_KEYS.specialtyReferrals, []);
  const index = referrals.findIndex(r => r.id === id);
  if (index === -1) return undefined;
  referrals[index] = {
    ...referrals[index],
    comments: [...(referrals[index].comments || []), comment],
    updatedAt: new Date().toISOString()
  };
  setStorage(STORAGE_KEYS.specialtyReferrals, referrals);
  return referrals[index];
}

export function markCommentSeen(referralId: string, commentId: string): SpecialtyReferral | undefined {
  const referrals = getStorage<SpecialtyReferral[]>(STORAGE_KEYS.specialtyReferrals, []);
  const index = referrals.findIndex(r => r.id === referralId);
  if (index === -1) return undefined;
  referrals[index] = {
    ...referrals[index],
    comments: referrals[index].comments.map(c =>
      c.id === commentId ? { ...c, seenAt: new Date().toISOString() } : c
    ),
  };
  setStorage(STORAGE_KEYS.specialtyReferrals, referrals);
  return referrals[index];
}

// ─── Task CRUD ────────────────────────────────────────────────────────────────
export function getAllTasks(): PatientTask[] {
  return getStorage<PatientTask[]>(STORAGE_KEYS.tasks, []);
}

export function getTasksByPatient(patientId: string): PatientTask[] {
  return getAllTasks().filter(t => t.patientId === patientId);
}

export function createTask(task: PatientTask): PatientTask {
  const tasks = getAllTasks();
  tasks.push(task);
  setStorage(STORAGE_KEYS.tasks, tasks);
  return task;
}

export function updateTask(id: string, updates: Partial<PatientTask>): PatientTask | undefined {
  const tasks = getAllTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return undefined;
  tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
  setStorage(STORAGE_KEYS.tasks, tasks);
  return tasks[index];
}

export function addCommentToTask(id: string, comment: TaskComment): PatientTask | undefined {
  const tasks = getAllTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return undefined;
  tasks[index] = {
    ...tasks[index],
    comments: [...(tasks[index].comments || []), comment],
    updatedAt: new Date().toISOString(),
  };
  setStorage(STORAGE_KEYS.tasks, tasks);
  return tasks[index];
}

export function markTaskCommentSeen(taskId: string, commentId: string): PatientTask | undefined {
  const tasks = getAllTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index === -1) return undefined;
  tasks[index] = {
    ...tasks[index],
    comments: tasks[index].comments.map(c =>
      c.id === commentId ? { ...c, seenAt: new Date().toISOString() } : c
    ),
  };
  setStorage(STORAGE_KEYS.tasks, tasks);
  return tasks[index];
}

// Reset data (useful for demo)
export function resetToSampleData(): void {
  if (!isBrowser) return;
  localStorage.removeItem(STORAGE_KEYS.initialized);
  initializeData();
}

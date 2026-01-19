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

// Date helpers
const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

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
  }
];

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
  }
];

// Hospital at Night entries - 20 entries across different roles
const sampleHospitalAtNight: HospitalAtNightEntry[] = [
  // High priority - SpR reviews
  {
    id: 'han1',
    patientId: 'p5',
    reviewDates: [{ date: today, completedAt: undefined }, { date: tomorrow, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SpR'],
    reasonForReview: 'Deteriorating heart failure. Needs senior review for escalation of diuretic therapy. May need IV furosemide.',
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
    id: 'han2',
    patientId: 'p8',
    reviewDates: [{ date: today, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SpR', 'SHO'],
    reasonForReview: 'NEWS 6 - sepsis secondary to UTI. May need escalation if not responding to antibiotics.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Dr. Thompson',
    comments: []
  },
  {
    id: 'han3',
    patientId: 'p34',
    reviewDates: [{ date: today, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SpR'],
    reasonForReview: 'Acute liver failure - paracetamol OD. Needs ongoing monitoring and possible transfer to liver unit.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Nurse Taylor',
    comments: [
      {
        id: 'c2',
        text: 'Liver unit aware. Kings criteria being monitored. Call if pH <7.3 or INR >3',
        createdBy: 'Dr. Evans',
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'han4',
    patientId: 'p31',
    reviewDates: [{ date: today, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SpR'],
    reasonForReview: 'Post variceal banding - monitor for re-bleeding. Check Hb at 22:00.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Dr. Evans',
    comments: []
  },
  // High priority - SHO reviews
  {
    id: 'han5',
    patientId: 'p2',
    reviewDates: [{ date: today, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SHO', 'SpR'],
    reasonForReview: 'Review U&Es and fluid status. May need IV diuretics if not responding to oral. AKI improving but needs monitoring.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Dr. Chen',
    comments: []
  },
  {
    id: 'han6',
    patientId: 'p50',
    reviewDates: [{ date: today, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SHO'],
    reasonForReview: 'New PE post THR. Started anticoagulation. Monitor for deterioration.',
    reviewStatus: 'Pending',
    reviewType: 'Ad-hoc',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Nurse Adams',
    comments: []
  },
  // Medium priority - SHO reviews
  {
    id: 'han7',
    patientId: 'p1',
    reviewDates: [{ date: today, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['SHO'],
    reasonForReview: 'Check evening observations and review oxygen requirements. May need O2 adjustment.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Nurse Adams',
    comments: []
  },
  {
    id: 'han8',
    patientId: 'p6',
    reviewDates: [{ date: today, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['SHO'],
    reasonForReview: 'DKA - check ketones and glucose at 22:00. May need FRII adjustment.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Nurse Williams',
    comments: []
  },
  {
    id: 'han9',
    patientId: 'p13',
    reviewDates: [{ date: today, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['SHO'],
    reasonForReview: 'PE on treatment. Check stability and review anticoagulation plan.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Nurse Jackson',
    comments: []
  },
  // FY1 reviews
  {
    id: 'han10',
    patientId: 'p11',
    reviewDates: [{ date: today, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['FY1'],
    reasonForReview: 'Acute asthma - review PEF and consider stepping down oxygen if improving.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Dr. Williams',
    comments: []
  },
  {
    id: 'han11',
    patientId: 'p16',
    reviewDates: [{ date: today, completedAt: undefined }],
    priority: 'Low',
    assignedRoles: ['FY1'],
    reasonForReview: 'Gastroenteritis - check fluid balance and consider discharge tomorrow if tolerating diet.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Nurse Brown',
    comments: []
  },
  {
    id: 'han12',
    patientId: 'p43',
    reviewDates: [{ date: today, completedAt: undefined }],
    priority: 'Low',
    assignedRoles: ['FY1'],
    reasonForReview: 'Post appendicectomy day 1 - routine bloods check. Discharge planning if well.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Mr. Wilson',
    comments: []
  },
  // Nurse reviews
  {
    id: 'han13',
    patientId: 'p25',
    reviewDates: [{ date: today, completedAt: undefined }, { date: tomorrow, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['Nurse'],
    reasonForReview: 'Palliative care - syringe driver check. PRN medications may be needed overnight.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Nurse Jackson',
    comments: []
  },
  {
    id: 'han14',
    patientId: 'p37',
    reviewDates: [{ date: today, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['Nurse', 'FY1'],
    reasonForReview: 'Delirious patient - may need PRN sedation. Regular reorientation and safety checks.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Dr. O\'Brien',
    comments: []
  },
  {
    id: 'han15',
    patientId: 'p29',
    reviewDates: [{ date: today, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['Nurse', 'SpR'],
    reasonForReview: 'End-stage COPD - comfort care. May need PRN morphine for breathlessness.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Dr. Mitchell',
    comments: [
      {
        id: 'c3',
        text: 'Family staying overnight. All comfort measures in place.',
        createdBy: 'Nurse Williams',
        createdAt: new Date().toISOString()
      }
    ]
  },
  // Discharge reviews
  {
    id: 'han16',
    patientId: 'p38',
    reviewDates: [{ date: tomorrow, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['Discharge'],
    reasonForReview: 'Post hip fracture - needs care package arranged before discharge. Social worker involved.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Nurse Adams',
    comments: []
  },
  {
    id: 'han17',
    patientId: 'p40',
    reviewDates: [{ date: today, completedAt: undefined }, { date: tomorrow, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['Discharge'],
    reasonForReview: 'Social admission - waiting for care package and home modifications. OT assessment complete.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Dr. O\'Brien',
    comments: []
  },
  // Mixed role reviews
  {
    id: 'han18',
    patientId: 'p44',
    reviewDates: [{ date: today, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SHO', 'SpR'],
    reasonForReview: 'Bile leak post cholecystectomy. ERCP tomorrow - monitor for sepsis overnight.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Nurse Brown',
    comments: []
  },
  {
    id: 'han19',
    patientId: 'p21',
    reviewDates: [{ date: today, completedAt: undefined }, { date: tomorrow, completedAt: undefined }],
    priority: 'High',
    assignedRoles: ['SpR'],
    reasonForReview: 'Infective endocarditis - on IV antibiotics. Monitor for embolic phenomena.',
    reviewStatus: 'Pending',
    reviewType: 'Scheduled',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Dr. Hughes',
    comments: []
  },
  {
    id: 'han20',
    patientId: 'p47',
    reviewDates: [{ date: today, completedAt: undefined }],
    priority: 'Medium',
    assignedRoles: ['SHO', 'FY1'],
    reasonForReview: 'Awaiting emergency appendicectomy - may go to theatre late. Needs pre-op bloods and sliding scale.',
    reviewStatus: 'Pending',
    reviewType: 'Ad-hoc',
    statusChangedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: 'Mr. Wilson',
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

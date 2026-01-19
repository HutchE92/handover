import Database from 'better-sqlite3';
import path from 'path';
import { Patient, HandoverNote, HospitalAtNightEntry } from './types';

const dbPath = path.join(process.cwd(), 'data', 'handover.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    nhsNumber TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    dateOfBirth TEXT NOT NULL,
    ward TEXT NOT NULL,
    bedNumber TEXT NOT NULL,
    consultant TEXT NOT NULL,
    admissionDate TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    allergies TEXT,
    resuscitationStatus TEXT NOT NULL DEFAULT 'Not Discussed',
    earlyWarningScore INTEGER,
    isActive INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS handover_notes (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    createdBy TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    shiftDate TEXT NOT NULL,
    shiftType TEXT NOT NULL,
    situation TEXT NOT NULL,
    background TEXT NOT NULL,
    assessment TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_patients_ward ON patients(ward);
  CREATE INDEX IF NOT EXISTS idx_patients_active ON patients(isActive);
  CREATE INDEX IF NOT EXISTS idx_handover_patient ON handover_notes(patientId);
  CREATE INDEX IF NOT EXISTS idx_handover_date ON handover_notes(shiftDate);

  CREATE TABLE IF NOT EXISTS hospital_at_night (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    reviewDates TEXT NOT NULL,
    priority TEXT NOT NULL,
    assignedRoles TEXT NOT NULL,
    reasonForReview TEXT NOT NULL,
    reviewStatus TEXT NOT NULL DEFAULT 'Pending',
    reviewType TEXT NOT NULL DEFAULT 'Scheduled',
    statusChangedAt TEXT,
    createdAt TEXT NOT NULL,
    createdBy TEXT NOT NULL,
    comments TEXT NOT NULL DEFAULT '[]',
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_han_patient ON hospital_at_night(patientId);
  CREATE INDEX IF NOT EXISTS idx_han_status ON hospital_at_night(reviewStatus);
`);

// Add comments column if it doesn't exist (migration for existing databases)
try {
  db.exec('ALTER TABLE hospital_at_night ADD COLUMN comments TEXT NOT NULL DEFAULT "[]"');
} catch {
  // Column already exists
}

// Add reviewType column if it doesn't exist (migration for existing databases)
try {
  db.exec('ALTER TABLE hospital_at_night ADD COLUMN reviewType TEXT NOT NULL DEFAULT "Scheduled"');
} catch {
  // Column already exists
}

// Patient queries
export function getAllPatients(activeOnly = true): Patient[] {
  const stmt = activeOnly
    ? db.prepare('SELECT * FROM patients WHERE isActive = 1 ORDER BY ward, bedNumber')
    : db.prepare('SELECT * FROM patients ORDER BY ward, bedNumber');
  return stmt.all() as Patient[];
}

export function getPatientsByWard(ward: string): Patient[] {
  const stmt = db.prepare('SELECT * FROM patients WHERE ward = ? AND isActive = 1 ORDER BY bedNumber');
  return stmt.all(ward) as Patient[];
}

export function getPatientById(id: string): Patient | undefined {
  const stmt = db.prepare('SELECT * FROM patients WHERE id = ?');
  return stmt.get(id) as Patient | undefined;
}

export function createPatient(patient: Patient): Patient {
  const stmt = db.prepare(`
    INSERT INTO patients (id, nhsNumber, firstName, lastName, dateOfBirth, ward, bedNumber,
      consultant, admissionDate, diagnosis, allergies, resuscitationStatus, earlyWarningScore,
      isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    patient.id,
    patient.nhsNumber,
    patient.firstName,
    patient.lastName,
    patient.dateOfBirth,
    patient.ward,
    patient.bedNumber,
    patient.consultant,
    patient.admissionDate,
    patient.diagnosis,
    patient.allergies || '',
    patient.resuscitationStatus,
    patient.earlyWarningScore,
    patient.isActive ? 1 : 0,
    patient.createdAt,
    patient.updatedAt
  );
  return patient;
}

export function updatePatient(id: string, updates: Partial<Patient>): Patient | undefined {
  const current = getPatientById(id);
  if (!current) return undefined;

  const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
  const stmt = db.prepare(`
    UPDATE patients SET
      nhsNumber = ?, firstName = ?, lastName = ?, dateOfBirth = ?, ward = ?, bedNumber = ?,
      consultant = ?, admissionDate = ?, diagnosis = ?, allergies = ?, resuscitationStatus = ?,
      earlyWarningScore = ?, isActive = ?, updatedAt = ?
    WHERE id = ?
  `);
  stmt.run(
    updated.nhsNumber,
    updated.firstName,
    updated.lastName,
    updated.dateOfBirth,
    updated.ward,
    updated.bedNumber,
    updated.consultant,
    updated.admissionDate,
    updated.diagnosis,
    updated.allergies || '',
    updated.resuscitationStatus,
    updated.earlyWarningScore,
    updated.isActive ? 1 : 0,
    updated.updatedAt,
    id
  );
  return updated;
}

export function dischargePatient(id: string): boolean {
  const stmt = db.prepare('UPDATE patients SET isActive = 0, updatedAt = ? WHERE id = ?');
  const result = stmt.run(new Date().toISOString(), id);
  return result.changes > 0;
}

export function deletePatient(id: string): boolean {
  const stmt = db.prepare('DELETE FROM patients WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// Handover note queries
export function getAllHandoverNotes(): HandoverNote[] {
  const stmt = db.prepare('SELECT * FROM handover_notes ORDER BY createdAt DESC');
  return stmt.all() as HandoverNote[];
}

export function getHandoverNotesByPatient(patientId: string): HandoverNote[] {
  const stmt = db.prepare('SELECT * FROM handover_notes WHERE patientId = ? ORDER BY createdAt DESC');
  return stmt.all(patientId) as HandoverNote[];
}

export function getHandoverNoteById(id: string): HandoverNote | undefined {
  const stmt = db.prepare('SELECT * FROM handover_notes WHERE id = ?');
  return stmt.get(id) as HandoverNote | undefined;
}

export function getLatestHandoverForPatient(patientId: string): HandoverNote | undefined {
  const stmt = db.prepare('SELECT * FROM handover_notes WHERE patientId = ? ORDER BY createdAt DESC LIMIT 1');
  return stmt.get(patientId) as HandoverNote | undefined;
}

export function getHandoverNotesByDate(shiftDate: string): HandoverNote[] {
  const stmt = db.prepare('SELECT * FROM handover_notes WHERE shiftDate = ? ORDER BY createdAt DESC');
  return stmt.all(shiftDate) as HandoverNote[];
}

export function createHandoverNote(note: HandoverNote): HandoverNote {
  const stmt = db.prepare(`
    INSERT INTO handover_notes (id, patientId, createdBy, createdAt, shiftDate, shiftType,
      situation, background, assessment, recommendation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    note.id,
    note.patientId,
    note.createdBy,
    note.createdAt,
    note.shiftDate,
    note.shiftType,
    note.situation,
    note.background,
    note.assessment,
    note.recommendation
  );
  return note;
}

export function updateHandoverNote(id: string, updates: Partial<HandoverNote>): HandoverNote | undefined {
  const current = getHandoverNoteById(id);
  if (!current) return undefined;

  const updated = { ...current, ...updates };
  const stmt = db.prepare(`
    UPDATE handover_notes SET
      situation = ?, background = ?, assessment = ?, recommendation = ?
    WHERE id = ?
  `);
  stmt.run(
    updated.situation,
    updated.background,
    updated.assessment,
    updated.recommendation,
    id
  );
  return updated;
}

export function deleteHandoverNote(id: string): boolean {
  const stmt = db.prepare('DELETE FROM handover_notes WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// Utility queries
export function getUniqueWards(): string[] {
  const stmt = db.prepare('SELECT DISTINCT ward FROM patients WHERE isActive = 1 ORDER BY ward');
  const results = stmt.all() as { ward: string }[];
  return results.map(r => r.ward);
}

export function getPatientsWithLatestHandover(): (Patient & { latestHandover?: HandoverNote })[] {
  const patients = getAllPatients();
  return patients.map(patient => ({
    ...patient,
    latestHandover: getLatestHandoverForPatient(patient.id)
  }));
}

// Hospital at Night queries
interface HaNDbRow {
  id: string;
  patientId: string;
  reviewDates: string;
  priority: string;
  assignedRoles: string;
  reasonForReview: string;
  reviewStatus: string;
  reviewType: string;
  statusChangedAt: string | null;
  createdAt: string;
  createdBy: string;
  comments: string;
}

function parseHaNEntry(row: HaNDbRow): HospitalAtNightEntry {
  return {
    ...row,
    reviewDates: JSON.parse(row.reviewDates),
    assignedRoles: JSON.parse(row.assignedRoles),
    comments: JSON.parse(row.comments || '[]'),
    priority: row.priority as HospitalAtNightEntry['priority'],
    reviewStatus: row.reviewStatus as HospitalAtNightEntry['reviewStatus'],
    reviewType: (row.reviewType || 'Scheduled') as HospitalAtNightEntry['reviewType'],
  };
}

export function getAllHospitalAtNightEntries(): HospitalAtNightEntry[] {
  const stmt = db.prepare('SELECT * FROM hospital_at_night ORDER BY createdAt DESC');
  const rows = stmt.all() as HaNDbRow[];
  return rows.map(parseHaNEntry);
}

export function getHospitalAtNightById(id: string): HospitalAtNightEntry | undefined {
  const stmt = db.prepare('SELECT * FROM hospital_at_night WHERE id = ?');
  const row = stmt.get(id) as HaNDbRow | undefined;
  return row ? parseHaNEntry(row) : undefined;
}

export function getHospitalAtNightByPatient(patientId: string): HospitalAtNightEntry[] {
  const stmt = db.prepare('SELECT * FROM hospital_at_night WHERE patientId = ? ORDER BY createdAt DESC');
  const rows = stmt.all(patientId) as HaNDbRow[];
  return rows.map(parseHaNEntry);
}

export function createHospitalAtNightEntry(entry: HospitalAtNightEntry): HospitalAtNightEntry {
  const stmt = db.prepare(`
    INSERT INTO hospital_at_night (id, patientId, reviewDates, priority, assignedRoles,
      reasonForReview, reviewStatus, reviewType, statusChangedAt, createdAt, createdBy, comments)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    entry.id,
    entry.patientId,
    JSON.stringify(entry.reviewDates),
    entry.priority,
    JSON.stringify(entry.assignedRoles),
    entry.reasonForReview,
    entry.reviewStatus,
    entry.reviewType || 'Scheduled',
    entry.statusChangedAt,
    entry.createdAt,
    entry.createdBy,
    JSON.stringify(entry.comments || [])
  );
  return entry;
}

export function updateHospitalAtNightEntry(id: string, updates: Partial<HospitalAtNightEntry>): HospitalAtNightEntry | undefined {
  const current = getHospitalAtNightById(id);
  if (!current) return undefined;

  const updated = { ...current, ...updates };
  const stmt = db.prepare(`
    UPDATE hospital_at_night SET
      reviewDates = ?, priority = ?, assignedRoles = ?, reasonForReview = ?,
      reviewStatus = ?, reviewType = ?, statusChangedAt = ?, comments = ?
    WHERE id = ?
  `);
  stmt.run(
    JSON.stringify(updated.reviewDates),
    updated.priority,
    JSON.stringify(updated.assignedRoles),
    updated.reasonForReview,
    updated.reviewStatus,
    updated.reviewType || 'Scheduled',
    updated.statusChangedAt,
    JSON.stringify(updated.comments || []),
    id
  );
  return updated;
}

export function deleteHospitalAtNightEntry(id: string): boolean {
  const stmt = db.prepare('DELETE FROM hospital_at_night WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

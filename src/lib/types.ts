export interface Patient {
  id: string;
  nhsNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ward: string;
  bedNumber: string;
  consultant: string;
  admissionDate: string;
  diagnosis: string;
  allergies: string;
  resuscitationStatus: 'Full' | 'DNACPR' | 'Not Discussed';
  earlyWarningScore: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HandoverNote {
  id: string;
  patientId: string;
  createdBy: string;
  createdAt: string;
  shiftDate: string;
  shiftType: 'Day' | 'Night' | 'Long Day';
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
}

export interface PatientWithHandover extends Patient {
  latestHandover?: HandoverNote;
}

export type ResuscitationStatus = 'Full' | 'DNACPR' | 'Not Discussed';
export type ShiftType = 'Day' | 'Night' | 'Long Day';

// Hospital at Night types
export type HaNPriority = 'High' | 'Medium' | 'Low';
export type HaNReviewRole = 'FY1' | 'SHO' | 'SpR' | 'Discharge' | 'Nurse';
export type HaNReviewStatus = 'Pending' | 'Complete';
export type HaNReviewType = 'Scheduled' | 'Ad-hoc';
export type HaNSpecialty = 'Medicine' | 'T+O' | 'General Surgery';

export interface HaNReviewDate {
  date: string;
  completedAt?: string; // ISO date string when this specific date was marked complete
}

export interface HaNComment {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
}

export interface HospitalAtNightEntry {
  id: string;
  patientId: string;
  reviewDates: HaNReviewDate[];
  priority: HaNPriority;
  assignedRoles: HaNReviewRole[];
  reasonForReview: string;
  reviewStatus: HaNReviewStatus;
  reviewType: HaNReviewType;
  specialty: HaNSpecialty;
  statusChangedAt: string | null;
  createdAt: string;
  createdBy: string;
  comments: HaNComment[];
}

export interface HospitalAtNightWithPatient extends HospitalAtNightEntry {
  patient?: Patient;
  latestHandover?: HandoverNote;
}

export function getNewsScoreColor(score: number | null): string {
  if (score === null) return 'bg-gray-100 text-gray-600';
  if (score <= 4) return 'bg-green-100 text-green-800';
  if (score <= 6) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

export function getResusStatusColor(status: ResuscitationStatus): string {
  switch (status) {
    case 'Full':
      return 'bg-green-100 text-green-800';
    case 'DNACPR':
      return 'bg-purple-100 text-purple-800';
    case 'Not Discussed':
      return 'bg-gray-100 text-gray-600';
  }
}

export function formatNhsNumber(nhs: string): string {
  const cleaned = nhs.replace(/\s/g, '');
  if (cleaned.length !== 10) return nhs;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
}

export function validateNhsNumber(nhs: string): boolean {
  const cleaned = nhs.replace(/\s/g, '');
  return /^\d{10}$/.test(cleaned);
}

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

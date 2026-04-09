import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.join(process.cwd(), 'data', 'handover.db');
const db = new Database(dbPath);

const priorities = ['High', 'Medium', 'Low', 'Discharge'] as const;
const roles = ['FY1', 'SHO', 'SpR', 'Discharge', 'Nurse'] as const;

const reasonsForReview = [
  'Review bloods - potassium trending high, may need adjustment of medications',
  'Review breathing - patient desaturating on current oxygen, may need escalation',
  'Review pain control - current analgesia not adequate, patient scoring 7/10',
  'Review fluid balance - negative balance overnight, may need IV fluids',
  'Chase CT scan result and discuss with radiology if needed',
  'Review blood glucose control - sliding scale may need adjusting',
  'Assess for possible sepsis - patient spiked temperature 38.5, bloods sent',
  'Review antibiotic choice - culture results now available',
  'Assess wound - dressing change due, check for signs of infection',
  'Review catheter - not draining well, may need flushing or replacement',
  'Chase echocardiogram result - needed for discharge planning',
  'Review INR - patient on warfarin, may need dose adjustment',
  'Assess mobility - patient for discharge, needs physio clearance',
  'Review NG feed - not tolerating current rate, dietitian input needed',
  'Chase MRI result and discuss with neurology',
  'Review sedation - patient agitated overnight, may need medication review',
  'Assess swallow - SALT review needed before restarting oral intake',
  'Review electrolytes - sodium dropping, may need fluid restriction',
  'Chase cardiology review - patient has new murmur on examination',
  'Review blood transfusion - Hb dropped, may need another unit',
  'Assess for DVT - calf swelling noted, Doppler may be needed',
  'Review oxygen requirement - patient on 4L, aim to wean if possible',
  'Chase microbiology advice on antibiotic duration',
  'Review bowels - patient not opened for 4 days, may need intervention',
  'Assess mental state - patient confused overnight, delirium screen needed',
  'Review blood pressure control - hypertensive on current medications',
  'Chase orthopaedic review for #NOF - surgery timing',
  'Review kidney function - creatinine rising, may need renal input',
  'Assess skin integrity - pressure area developing, needs review',
  'Review discharge medications - pharmacy queries on prescription'
];

const nurseNames = [
  'Sarah Mitchell', 'James Wilson', 'Emma Thompson', 'Michael Brown', 'Sophie Taylor',
  'David Roberts', 'Hannah Davies', 'Christopher Evans', 'Laura Hughes', 'Daniel Williams'
];

function getRandomElement<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomElements<T>(arr: readonly T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateReviewDates(): { date: string; completedAt?: string }[] {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dates: { date: string; completedAt?: string }[] = [];

  // Random number of review dates (1-3)
  const numDates = Math.floor(Math.random() * 3) + 1;

  for (let i = 0; i < numDates; i++) {
    const useToday = Math.random() > 0.5;
    const date = useToday ? today : tomorrow;
    dates.push({
      date: date.toISOString().split('T')[0]
    });
  }

  // Sort dates chronologically
  dates.sort((a, b) => a.date.localeCompare(b.date));

  return dates;
}

async function seedHospitalAtNight() {
  console.log('Seeding Hospital at Night entries...\n');

  // Clear existing H@N entries
  db.exec('DELETE FROM hospital_at_night');
  console.log('Cleared existing Hospital at Night entries\n');

  // Get random patients
  const patients = db.prepare('SELECT id, firstName, lastName, ward, bedNumber FROM patients WHERE isActive = 1 ORDER BY RANDOM() LIMIT 20').all() as {
    id: string;
    firstName: string;
    lastName: string;
    ward: string;
    bedNumber: string;
  }[];

  if (patients.length < 20) {
    console.log(`Warning: Only ${patients.length} active patients found`);
  }

  const insertStmt = db.prepare(`
    INSERT INTO hospital_at_night (id, patientId, reviewDates, priority, assignedRoles,
      reasonForReview, reviewStatus, statusChangedAt, createdAt, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let created = 0;

  // Ensure we cover all roles and priorities
  const roleDistribution: Record<string, number> = {
    'FY1': 0,
    'SHO': 0,
    'SpR': 0,
    'Discharge': 0,
    'Nurse': 0
  };

  for (let i = 0; i < patients.length; i++) {
    const patient = patients[i];

    // Determine priority - spread across all types
    let priority: typeof priorities[number];
    if (i < 5) {
      priority = 'High';
    } else if (i < 10) {
      priority = 'Medium';
    } else if (i < 15) {
      priority = 'Low';
    } else {
      priority = 'Discharge';
    }

    // Determine roles - ensure coverage
    let assignedRoles: typeof roles[number][];
    if (i < 5) {
      // First 5: Ensure each primary role gets at least one
      assignedRoles = [roles[i % 5]];
      // Sometimes add a secondary role
      if (Math.random() > 0.5) {
        const secondRole = roles[(i + 1) % 5];
        if (!assignedRoles.includes(secondRole)) {
          assignedRoles.push(secondRole);
        }
      }
    } else {
      // Rest: Random roles
      assignedRoles = getRandomElements(roles, 1, 2);
    }

    // Track role distribution
    assignedRoles.forEach(role => {
      roleDistribution[role]++;
    });

    // Some entries should be complete (about 25%)
    const isComplete = Math.random() < 0.25;
    const reviewStatus = isComplete ? 'Complete' : 'Pending';
    const statusChangedAt = isComplete ? new Date().toISOString() : null;

    const now = new Date();
    // Vary creation times over the past few hours
    now.setHours(now.getHours() - Math.floor(Math.random() * 8));

    const entry = {
      id: uuidv4(),
      patientId: patient.id,
      reviewDates: generateReviewDates(),
      priority,
      assignedRoles,
      reasonForReview: getRandomElement(reasonsForReview),
      reviewStatus,
      statusChangedAt,
      createdAt: now.toISOString(),
      createdBy: getRandomElement(nurseNames)
    };

    insertStmt.run(
      entry.id,
      entry.patientId,
      JSON.stringify(entry.reviewDates),
      entry.priority,
      JSON.stringify(entry.assignedRoles),
      entry.reasonForReview,
      entry.reviewStatus,
      entry.statusChangedAt,
      entry.createdAt,
      entry.createdBy
    );

    console.log(`Added: ${patient.lastName}, ${patient.firstName} (${patient.ward}, Bed ${patient.bedNumber})`);
    console.log(`  Priority: ${priority}, Roles: ${assignedRoles.join(', ')}, Status: ${reviewStatus}`);
    created++;
  }

  console.log(`\n========================================`);
  console.log(`Seed complete! Created ${created} Hospital at Night entries`);
  console.log(`\nRole distribution:`);
  Object.entries(roleDistribution).forEach(([role, count]) => {
    console.log(`  ${role}: ${count} patients`);
  });
}

seedHospitalAtNight().catch(console.error);

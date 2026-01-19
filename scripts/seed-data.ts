import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.join(process.cwd(), 'data', 'handover.db');
const db = new Database(dbPath);

// British first names
const maleFirstNames = [
  'James', 'William', 'Oliver', 'George', 'Thomas', 'Harry', 'Jack', 'Charlie', 'Oscar', 'Henry',
  'Arthur', 'Noah', 'Leo', 'Alfie', 'Jacob', 'Freddie', 'Edward', 'Theodore', 'Alexander', 'Joseph',
  'Samuel', 'Sebastian', 'Archie', 'Joshua', 'Ethan', 'Isaac', 'Lucas', 'Max', 'Mohammed', 'Daniel',
  'Benjamin', 'Elijah', 'Finley', 'Harrison', 'Mason', 'Logan', 'Adam', 'Dylan', 'Liam', 'Toby',
  'David', 'Michael', 'Robert', 'Richard', 'Christopher', 'Matthew', 'Anthony', 'Mark', 'Steven', 'Paul',
  'Andrew', 'Kenneth', 'Brian', 'Kevin', 'Ronald', 'Timothy', 'Jason', 'Jeffrey', 'Gary', 'Ryan',
  'Nicholas', 'Eric', 'Stephen', 'Jonathan', 'Larry', 'Justin', 'Scott', 'Brandon', 'Raymond', 'Gregory',
  'Frank', 'Patrick', 'Peter', 'Harold', 'Douglas', 'Dennis', 'Gerald', 'Carl', 'Keith', 'Roger',
  'Albert', 'Arthur', 'Lawrence', 'Jesse', 'Terry', 'Sean', 'Christian', 'Austin', 'Joe', 'Phillip'
];

const femaleFirstNames = [
  'Olivia', 'Amelia', 'Isla', 'Ava', 'Emily', 'Sophia', 'Grace', 'Mia', 'Poppy', 'Ella',
  'Lily', 'Evie', 'Charlotte', 'Freya', 'Ivy', 'Florence', 'Isabella', 'Willow', 'Rosie', 'Sophie',
  'Daisy', 'Alice', 'Elsie', 'Sienna', 'Harper', 'Jessica', 'Ruby', 'Millie', 'Phoebe', 'Eva',
  'Emma', 'Eleanor', 'Maisie', 'Aria', 'Luna', 'Penelope', 'Layla', 'Chloe', 'Maya', 'Lucy',
  'Margaret', 'Patricia', 'Barbara', 'Elizabeth', 'Jennifer', 'Maria', 'Susan', 'Dorothy', 'Lisa', 'Nancy',
  'Karen', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle', 'Laura',
  'Sarah', 'Kimberly', 'Deborah', 'Kathleen', 'Joyce', 'Virginia', 'Stephanie', 'Catherine', 'Christine', 'Pamela',
  'Brenda', 'Nicole', 'Amy', 'Anna', 'Angela', 'Shirley', 'Anne', 'Jean', 'Marie', 'Judith',
  'Doris', 'Evelyn', 'Frances', 'Irene', 'Joan', 'Edna', 'Ethel', 'Gladys', 'Martha', 'Rose'
];

const lastNames = [
  'Smith', 'Jones', 'Williams', 'Brown', 'Taylor', 'Davies', 'Wilson', 'Evans', 'Thomas', 'Johnson',
  'Roberts', 'Walker', 'Wright', 'Robinson', 'Thompson', 'White', 'Hughes', 'Edwards', 'Green', 'Hall',
  'Lewis', 'Harris', 'Clarke', 'Patel', 'Jackson', 'Wood', 'Turner', 'Martin', 'Cooper', 'Hill',
  'Ward', 'Morris', 'Moore', 'Clark', 'Lee', 'King', 'Baker', 'Harrison', 'Morgan', 'Allen',
  'James', 'Scott', 'Ellis', 'Bennett', 'Gray', 'Price', 'Khan', 'Lloyd', 'Mitchell', 'Simpson',
  'Watson', 'Adams', 'Shaw', 'Phillips', 'Collins', 'Stevens', 'Kelly', 'Griffiths', 'Chapman', 'Carter',
  'Campbell', 'Murray', 'Parker', 'Marshall', 'Stewart', 'Cox', 'Richardson', 'Cook', 'Bailey', 'Bell',
  'Young', 'Foster', 'Powell', 'Perry', 'Russell', 'Butler', 'Barnes', 'Fisher', 'Mason', 'Hunt'
];

const consultants = [
  'Dr. A. Sharma', 'Dr. S. Patel', 'Dr. J. Williams', 'Dr. M. Thompson', 'Dr. R. Davies',
  'Dr. K. Ahmed', 'Dr. L. Chen', 'Dr. P. O\'Brien', 'Dr. E. Hughes', 'Dr. C. Taylor',
  'Dr. N. Singh', 'Dr. F. Wilson', 'Dr. H. Brown', 'Dr. T. Evans', 'Dr. D. Roberts',
  'Dr. B. Jackson', 'Dr. G. Martin', 'Dr. I. Lewis', 'Dr. W. Clark', 'Dr. V. Turner'
];

const diagnoses = [
  'Community-acquired pneumonia',
  'Acute exacerbation of COPD',
  'Congestive heart failure',
  'Type 2 diabetes - poor glycaemic control',
  'Acute kidney injury',
  'Urinary tract infection with sepsis',
  'Cellulitis of lower limb',
  'Acute coronary syndrome',
  'Stroke - left MCA territory',
  'Fractured neck of femur',
  'Acute pancreatitis',
  'Upper GI bleed',
  'Lower GI bleed - diverticular',
  'Pulmonary embolism',
  'Atrial fibrillation with rapid ventricular response',
  'Decompensated liver disease',
  'Acute exacerbation of asthma',
  'Diabetic ketoacidosis',
  'Hyperosmolar hyperglycaemic state',
  'Acute appendicitis - post-operative',
  'Bowel obstruction',
  'Cholecystitis',
  'Acute diverticulitis',
  'Pyelonephritis',
  'Meningitis',
  'Encephalitis',
  'Seizure disorder - breakthrough seizures',
  'Parkinson\'s disease - medication review',
  'Falls - mechanical',
  'Delirium - multifactorial',
  'Anaemia under investigation',
  'Chest pain - query cardiac',
  'Shortness of breath - under investigation',
  'Syncope - under investigation',
  'Electrolyte disturbance - hyponatraemia',
  'Hyperkalaemia',
  'NSTEMI',
  'STEMI - post PCI',
  'Infective endocarditis',
  'Osteomyelitis'
];

const pastMedicalHistories = [
  'Type 2 diabetes mellitus, hypertension, hypercholesterolaemia',
  'COPD on home nebulisers, ex-smoker (40 pack years), ischaemic heart disease',
  'Atrial fibrillation on warfarin, previous stroke 2019, hypertension',
  'Chronic kidney disease stage 3b, gout, peripheral vascular disease',
  'Heart failure with reduced ejection fraction (EF 35%), ICD in situ, type 2 diabetes',
  'Rheumatoid arthritis on methotrexate, osteoporosis, previous DVT',
  'Parkinson\'s disease, dementia, recurrent falls',
  'Cirrhosis secondary to alcohol, oesophageal varices, previous SBP',
  'Epilepsy on levetiracetam, learning difficulties, anxiety',
  'Breast cancer 2018 - in remission, hypothyroidism, depression',
  'Asthma, GORD, anxiety, fibromyalgia',
  'Prostate cancer on hormone therapy, osteoarthritis, BPH',
  'Crohn\'s disease on biologics, previous bowel resection, anaemia',
  'Multiple sclerosis, urinary retention requiring ISC, depression',
  'Previous MI x2, CABG 2015, CKD stage 4, type 2 diabetes',
  'Alcoholic liver disease, portal hypertension, previous variceal bleed',
  'Schizophrenia, type 2 diabetes, NAFLD',
  'Bipolar disorder, hypothyroidism, obesity',
  'COPD, lung cancer stage 4 - palliative, cachexia',
  'Dementia, hypertension, recurrent UTIs, permanent catheter',
  'Aortic stenosis - moderate, AF, CKD stage 3a',
  'Previous CVA with residual left-sided weakness, PEG fed, recurrent aspiration',
  'Type 1 diabetes on insulin pump, coeliac disease, Addison\'s disease',
  'SLE on hydroxychloroquine, CKD stage 3, previous DVT/PE',
  'Motor neurone disease, BiPAP overnight, PEG in situ'
];

const allergies = [
  '', '', '', '', '', // Many patients have no allergies
  'Penicillin - rash',
  'Penicillin - anaphylaxis',
  'NKDA',
  'Codeine - nausea',
  'Morphine - hallucinations',
  'Sulfonamides - rash',
  'NSAIDs - GI bleed',
  'Aspirin - bronchospasm',
  'Trimethoprim - rash',
  'Metoclopramide - dystonia',
  'ACE inhibitors - angioedema',
  'Latex',
  'Iodine contrast - mild reaction',
  'Amoxicillin - rash',
  'Co-amoxiclav - diarrhoea'
];

const situations = [
  (diagnosis: string) => `${diagnosis}. Admitted ${Math.floor(Math.random() * 7) + 1} days ago via A&E. Currently clinically stable but requiring ongoing monitoring.`,
  (diagnosis: string) => `${diagnosis}. Patient transferred from ITU yesterday following period of NIV support. Improving but still requiring supplemental oxygen.`,
  (diagnosis: string) => `${diagnosis}. New admission today, referred by GP with worsening symptoms over the past week. Initial investigations underway.`,
  (diagnosis: string) => `${diagnosis}. Day ${Math.floor(Math.random() * 5) + 3} of admission. Making good progress with treatment, being considered for step-down.`,
  (diagnosis: string) => `${diagnosis}. Deteriorated overnight requiring increased monitoring. Medical team reviewing this morning.`,
  (diagnosis: string) => `${diagnosis}. Awaiting specialist input from ${['cardiology', 'respiratory', 'gastroenterology', 'neurology', 'renal'][Math.floor(Math.random() * 5)]}. Currently stable.`,
  (diagnosis: string) => `${diagnosis}. Post-procedure day ${Math.floor(Math.random() * 3) + 1}. Recovering well, mobilising with physio.`,
  (diagnosis: string) => `${diagnosis}. Complex social situation delaying discharge. Medically fit but awaiting POC assessment.`,
  (diagnosis: string) => `${diagnosis}. Responding well to IV antibiotics, due to switch to oral today if bloods improving.`,
  (diagnosis: string) => `${diagnosis}. Elderly patient with multiple comorbidities. Family meeting scheduled for this afternoon to discuss ceiling of care.`
];

const assessments = [
  'Obs stable: BP 128/76, HR 82, RR 18, SpO2 96% on 2L, Temp 37.2. Bloods this AM: Hb 112, WCC 11.2, CRP 45 (down from 89), U&Es stable. Chest X-ray: improving consolidation right lower zone. Patient reports feeling better, eating and drinking well.',
  'NEWS 4 (raised due to oxygen requirement). BP 140/85, HR 92, RR 22, SpO2 92% on 4L. Bloods: WCC 15.4, CRP 124, Lactate 1.8. ABG: pH 7.38, pCO2 5.1, pO2 8.9. Patient fatigued but alert and orientated.',
  'Clinically improving. Obs within normal limits. Bloods: Hb 98 (was 85), WCC 8.4, Plt 245, CRP 32. LFTs normalising. Appetite improving, passed urine independently overnight. Mobilising to bathroom with frame.',
  'Remains febrile (38.4) despite 48hrs antibiotics. Blood cultures pending. Urine dip positive, MSU sent. CT abdomen performed yesterday - no collection identified. Senior review requested.',
  'Post-op day 2: wound clean and dry, no signs of infection. Pain well controlled on regular paracetamol and PRN codeine. Bowels opened this morning. Tolerating diet. Physio assessed - safe to mobilise with stick.',
  'Acute deterioration overnight: new AF with RVR (HR 140s). Already on rate control but subtherapeutic. Cardiology input obtained - bisoprolol increased and loading dose digoxin given. Now HR 95, BP stable.',
  'Neuro obs stable following CVA. GCS 15, NIHSS 4. Power improving left side (now 4/5 upper, 3/5 lower). SALT reviewed - modified diet (soft and bite-sized, thickened fluids). CT head: established infarct, no haemorrhagic transformation.',
  'Blood glucose poorly controlled (range 14-22 despite sliding scale). HbA1c 98. Diabetes CNS reviewing. Ketones negative. Eating well. May need long-acting insulin adjustment.',
  'Fluid balance: +1850ml over 24hrs. Crackles bilateral bases. JVP raised 6cm. BNP elevated at 1240. Diuretics increased this morning. Strict fluid restriction 1.5L. Daily weights commenced.',
  'Delirium screen: new confusion overnight. CAM positive. Urine dip negative, CRP stable, glucose normal. CT head: chronic small vessel disease, no acute changes. Likely precipitated by constipation - PR performed, good result. Now more settled.',
  'Haemodynamically stable following GI bleed. Hb 94 (was 72 on admission), no further malaena. OGD yesterday: duodenal ulcer with visible vessel, treated with clips and adrenaline. For repeat Hb today, H. pylori testing.',
  'Pain well controlled. Inflammatory markers trending down (CRP 58 from 145). Tolerating oral diet. IV antibiotics complete - switched to oral. Wound VAC in situ, next change due Thursday.',
  'Respiratory: weaned to 1L O2, sats maintaining 94-96%. Chest physio twice daily. Sputum sent for culture. Peak flow improving (now 280, was 180 on admission). Discharge planning commenced.',
  'Renal function improving: Cr 156 (was 234), eGFR 35. Urine output >0.5ml/kg/hr. Nephrotoxics withheld. Renal team happy with progress, repeat U&Es tomorrow. Can restart ACEi when Cr <130.',
  'Liver screen sent. INR 1.8, Albumin 28. USS abdomen: fatty liver, no focal lesion, patent portal vein. Alcohol liaison team involved. Pabrinex completed. Lactulose and rifaximin commenced for mild encephalopathy.'
];

const recommendations = [
  'Chase AM bloods - expecting improvement in CRP. If improving, discuss with micro re: stepping down to oral antibiotics. Continue current management. SALT review if any concerns with swallowing. Update family this afternoon.',
  'Continue current antibiotics - review at 48hrs. Repeat CXR if not improving. May need CT chest if fails to respond. Ensure adequate fluid intake. Escalate if NEWS >5 or increasing oxygen requirement.',
  'For discharge planning - refer to community matron and district nurses. Ensure GP follow-up in 1 week. TTO medications to be written. Patient education regarding warning signs.',
  'Urgent cardiology review today re: arrhythmia management. Ensure on cardiac monitor. Repeat ECG if symptoms. Keep family informed of any changes. Consider anticoagulation if remains in AF >24hrs.',
  'Physio/OT assessment today for discharge planning. Social worker referral made - awaiting assessment. Family meeting arranged for 2pm to discuss ongoing care needs. Chase CT report.',
  'Repeat bloods tomorrow AM. Continue IV fluids overnight. Strict fluid balance. Catheter to remain until mobilising. VTE assessment - ensure prescribed. Dietitian review if poor oral intake continues.',
  'Discuss at MDT - complex discharge needs. Await POC assessment outcome. Refer to palliative care if appropriate. Ensure ceiling of care clearly documented. Update GP regarding admission.',
  'Chase micro advice on antibiotic choice - current sensitivities pending. Repeat blood cultures if temp spike. Consider line change if ongoing fever. Surgical review if any abdominal concerns.',
  'Diabetes CNS to review insulin regimen. Aim for discharge by end of week if glucose control improves. Ensure diabetes educator seen before discharge. Arrange diabetes clinic follow-up.',
  'Medical review this morning regarding readiness for discharge. Pharmacy to complete TTO. Patient transport booked for 2pm. Ensure discharge letter sent to GP. Community services notified.',
  'Escalate to registrar if any deterioration. Ensure resuscitation status clearly documented. Continue supportive care. Family aware of prognosis. Chaplaincy referral if requested.',
  'Orthogeriatric review today. Optimise bone health - calcium/Vit D, consider bisphosphonate. Falls prevention bundle in place. Refer to community rehab on discharge.',
  'Haematology advice pending regarding anticoagulation. Gastro follow-up arranged for 6 weeks. Ensure H. pylori eradication if positive. PPI to continue for 8 weeks minimum.',
  'SALT re-assessment tomorrow. If passing, can trial oral medications. Speech therapy input for dysarthria. Stroke clinic follow-up in 6 weeks. Ensure secondary prevention optimised.',
  'Chase echo result - important for discharge planning. Consider diuretic adjustment based on fluid status. Daily weights essential. Heart failure CNS to see before discharge.'
];

const nurseNames = [
  'Sarah Mitchell', 'James Wilson', 'Emma Thompson', 'Michael Brown', 'Sophie Taylor',
  'David Roberts', 'Hannah Davies', 'Christopher Evans', 'Laura Hughes', 'Daniel Williams',
  'Rebecca Clark', 'Matthew Lewis', 'Jessica Walker', 'Thomas Moore', 'Charlotte Hall',
  'Oliver Green', 'Emily Turner', 'Jack Harrison', 'Amy Scott', 'Benjamin Young'
];

function generateNhsNumber(): string {
  let nhs = '';
  for (let i = 0; i < 10; i++) {
    nhs += Math.floor(Math.random() * 10);
  }
  return nhs;
}

function generateDateOfBirth(minAge: number, maxAge: number): string {
  const today = new Date();
  const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
  const birthYear = today.getFullYear() - age;
  const birthMonth = Math.floor(Math.random() * 12);
  const birthDay = Math.floor(Math.random() * 28) + 1;
  return new Date(birthYear, birthMonth, birthDay).toISOString().split('T')[0];
}

function generateAdmissionDate(): string {
  const today = new Date();
  const daysAgo = Math.floor(Math.random() * 14) + 1;
  const admissionDate = new Date(today);
  admissionDate.setDate(admissionDate.getDate() - daysAgo);
  return admissionDate.toISOString().split('T')[0];
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePatient(ward: string, bedNumber: string): any {
  const isMale = Math.random() > 0.5;
  const firstName = isMale ? getRandomElement(maleFirstNames) : getRandomElement(femaleFirstNames);
  const lastName = getRandomElement(lastNames);
  const diagnosis = getRandomElement(diagnoses);
  const allergy = getRandomElement(allergies);

  // Generate age with realistic distribution for hospital patients
  let minAge, maxAge;
  const ageRoll = Math.random();
  if (ageRoll < 0.1) {
    minAge = 18; maxAge = 35; // Young adults
  } else if (ageRoll < 0.25) {
    minAge = 36; maxAge = 50; // Middle aged
  } else if (ageRoll < 0.5) {
    minAge = 51; maxAge = 65; // Older middle aged
  } else if (ageRoll < 0.8) {
    minAge = 66; maxAge = 80; // Elderly
  } else {
    minAge = 81; maxAge = 98; // Very elderly
  }

  const resusOptions = ['Full', 'Full', 'Full', 'DNACPR', 'Not Discussed'] as const;
  const newsScore = Math.random() < 0.7 ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 8) + 4;

  const now = new Date().toISOString();

  return {
    id: uuidv4(),
    nhsNumber: generateNhsNumber(),
    firstName,
    lastName,
    dateOfBirth: generateDateOfBirth(minAge, maxAge),
    ward,
    bedNumber,
    consultant: getRandomElement(consultants),
    admissionDate: generateAdmissionDate(),
    diagnosis,
    allergies: allergy,
    resuscitationStatus: getRandomElement(resusOptions),
    earlyWarningScore: newsScore,
    isActive: 1,
    createdAt: now,
    updatedAt: now
  };
}

function generateHandover(patientId: string, diagnosis: string): any {
  const situationTemplate = getRandomElement(situations);
  const shiftTypes = ['Day', 'Night', 'Long Day'] as const;

  const today = new Date();
  const shiftDate = new Date(today);
  shiftDate.setDate(shiftDate.getDate() - Math.floor(Math.random() * 3));

  return {
    id: uuidv4(),
    patientId,
    createdBy: getRandomElement(nurseNames),
    createdAt: new Date().toISOString(),
    shiftDate: shiftDate.toISOString().split('T')[0],
    shiftType: getRandomElement(shiftTypes),
    situation: situationTemplate(diagnosis),
    background: getRandomElement(pastMedicalHistories),
    assessment: getRandomElement(assessments),
    recommendation: getRandomElement(recommendations)
  };
}

async function seedDatabase() {
  console.log('Starting database seed...\n');

  // Clear existing data
  db.exec('DELETE FROM handover_notes');
  db.exec('DELETE FROM patients');
  console.log('Cleared existing data\n');

  const insertPatient = db.prepare(`
    INSERT INTO patients (id, nhsNumber, firstName, lastName, dateOfBirth, ward, bedNumber,
      consultant, admissionDate, diagnosis, allergies, resuscitationStatus, earlyWarningScore,
      isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertHandover = db.prepare(`
    INSERT INTO handover_notes (id, patientId, createdBy, createdAt, shiftDate, shiftType,
      situation, background, assessment, recommendation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let totalPatients = 0;
  let totalHandovers = 0;

  // Generate 10-15 patients per ward
  for (let wardNum = 1; wardNum <= 20; wardNum++) {
    const ward = `Ward ${wardNum}`;
    const patientCount = Math.floor(Math.random() * 6) + 10; // 10-15 patients

    console.log(`Generating ${patientCount} patients for ${ward}...`);

    // Generate bed numbers (not all beds will be filled)
    const availableBeds = Array.from({ length: 28 }, (_, i) => `${i + 1}`);
    const selectedBeds = availableBeds
      .sort(() => Math.random() - 0.5)
      .slice(0, patientCount)
      .sort((a, b) => parseInt(a) - parseInt(b));

    for (const bedNumber of selectedBeds) {
      const patient = generatePatient(ward, bedNumber);

      insertPatient.run(
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
        patient.allergies,
        patient.resuscitationStatus,
        patient.earlyWarningScore,
        patient.isActive,
        patient.createdAt,
        patient.updatedAt
      );
      totalPatients++;

      // Generate 1-3 handovers per patient
      const handoverCount = Math.floor(Math.random() * 3) + 1;
      for (let h = 0; h < handoverCount; h++) {
        const handover = generateHandover(patient.id, patient.diagnosis);

        // Adjust dates for multiple handovers
        const handoverDate = new Date();
        handoverDate.setDate(handoverDate.getDate() - h);
        handover.shiftDate = handoverDate.toISOString().split('T')[0];
        handover.createdAt = handoverDate.toISOString();

        insertHandover.run(
          handover.id,
          handover.patientId,
          handover.createdBy,
          handover.createdAt,
          handover.shiftDate,
          handover.shiftType,
          handover.situation,
          handover.background,
          handover.assessment,
          handover.recommendation
        );
        totalHandovers++;
      }
    }
  }

  console.log(`\nSeed complete!`);
  console.log(`Created ${totalPatients} patients`);
  console.log(`Created ${totalHandovers} handover notes`);
}

seedDatabase().catch(console.error);

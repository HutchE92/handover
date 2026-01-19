import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import {
  getAllHospitalAtNightEntries,
  createHospitalAtNightEntry,
  getAllPatients,
  getLatestHandoverForPatient
} from '@/lib/db';
import { HospitalAtNightEntry, HospitalAtNightWithPatient } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    let entries = getAllHospitalAtNightEntries();

    // Filter by patientId if provided
    if (patientId) {
      entries = entries.filter(e => e.patientId === patientId);
    }

    const patients = getAllPatients(false);

    // Merge patient and handover data
    const entriesWithPatients: HospitalAtNightWithPatient[] = entries.map(entry => {
      const patient = patients.find(p => p.id === entry.patientId);
      const latestHandover = patient ? getLatestHandoverForPatient(patient.id) : undefined;
      return {
        ...entry,
        patient,
        latestHandover
      };
    });

    return NextResponse.json({ entries: entriesWithPatients });
  } catch (error) {
    console.error('Error fetching hospital at night entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const now = new Date().toISOString();
    const entry: HospitalAtNightEntry = {
      id: uuidv4(),
      patientId: body.patientId,
      reviewDates: body.reviewDates,
      priority: body.priority,
      assignedRoles: body.assignedRoles,
      reasonForReview: body.reasonForReview,
      reviewStatus: 'Pending',
      reviewType: body.reviewType || 'Scheduled',
      statusChangedAt: null,
      createdAt: now,
      createdBy: body.createdBy || 'Unknown',
      comments: [],
    };

    const created = createHospitalAtNightEntry(entry);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating hospital at night entry:', error);
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    );
  }
}

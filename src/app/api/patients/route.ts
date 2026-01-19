import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getAllPatients, createPatient, getUniqueWards } from '@/lib/db';
import { Patient } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const patients = getAllPatients(!includeInactive);
    const wards = getUniqueWards();

    return NextResponse.json({ patients, wards });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const now = new Date().toISOString();
    const patient: Patient = {
      id: uuidv4(),
      nhsNumber: body.nhsNumber.replace(/\s/g, ''),
      firstName: body.firstName,
      lastName: body.lastName,
      dateOfBirth: body.dateOfBirth,
      ward: body.ward,
      bedNumber: body.bedNumber,
      consultant: body.consultant,
      admissionDate: body.admissionDate,
      diagnosis: body.diagnosis,
      allergies: body.allergies || '',
      resuscitationStatus: body.resuscitationStatus || 'Not Discussed',
      earlyWarningScore: body.earlyWarningScore ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const created = createPatient(patient);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}

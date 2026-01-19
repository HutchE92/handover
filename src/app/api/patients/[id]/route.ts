import { NextRequest, NextResponse } from 'next/server';
import { getPatientById, updatePatient, dischargePatient, deletePatient } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const patient = getPatientById(id);

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updates = {
      nhsNumber: body.nhsNumber?.replace(/\s/g, ''),
      firstName: body.firstName,
      lastName: body.lastName,
      dateOfBirth: body.dateOfBirth,
      ward: body.ward,
      bedNumber: body.bedNumber,
      consultant: body.consultant,
      admissionDate: body.admissionDate,
      diagnosis: body.diagnosis,
      allergies: body.allergies,
      resuscitationStatus: body.resuscitationStatus,
      earlyWarningScore: body.earlyWarningScore ?? null,
    };

    const updated = updatePatient(id, updates);

    if (!updated) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'discharge') {
      const success = dischargePatient(id);
      if (!success) {
        return NextResponse.json(
          { error: 'Patient not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, message: 'Patient discharged' });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const success = deletePatient(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}

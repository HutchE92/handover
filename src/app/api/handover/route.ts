import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getAllHandoverNotes, getHandoverNotesByPatient, getHandoverNotesByDate, createHandoverNote } from '@/lib/db';
import { HandoverNote } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const shiftDate = searchParams.get('shiftDate');

    let notes: HandoverNote[];

    if (patientId) {
      notes = getHandoverNotesByPatient(patientId);
    } else if (shiftDate) {
      notes = getHandoverNotesByDate(shiftDate);
    } else {
      notes = getAllHandoverNotes();
    }

    return NextResponse.json({ handoverNotes: notes });
  } catch (error) {
    console.error('Error fetching handover notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch handover notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const note: HandoverNote = {
      id: uuidv4(),
      patientId: body.patientId,
      createdBy: body.createdBy,
      createdAt: new Date().toISOString(),
      shiftDate: body.shiftDate,
      shiftType: body.shiftType,
      situation: body.situation,
      background: body.background,
      assessment: body.assessment,
      recommendation: body.recommendation,
    };

    const created = createHandoverNote(note);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating handover note:', error);
    return NextResponse.json(
      { error: 'Failed to create handover note' },
      { status: 500 }
    );
  }
}

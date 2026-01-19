import { NextRequest, NextResponse } from 'next/server';
import { getHandoverNoteById, updateHandoverNote, deleteHandoverNote } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const note = getHandoverNoteById(id);

    if (!note) {
      return NextResponse.json(
        { error: 'Handover note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error fetching handover note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch handover note' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updates = {
      situation: body.situation,
      background: body.background,
      assessment: body.assessment,
      recommendation: body.recommendation,
    };

    const updated = updateHandoverNote(id, updates);

    if (!updated) {
      return NextResponse.json(
        { error: 'Handover note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating handover note:', error);
    return NextResponse.json(
      { error: 'Failed to update handover note' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const success = deleteHandoverNote(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Handover note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting handover note:', error);
    return NextResponse.json(
      { error: 'Failed to delete handover note' },
      { status: 500 }
    );
  }
}

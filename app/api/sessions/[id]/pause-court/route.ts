import { NextRequest, NextResponse } from 'next/server';
import { SessionModel } from '@/lib/db/models/session';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { courtNumber, action } = await request.json(); // action: 'pause' | 'resume'
    const params = await context.params;
    const { id } = params;

    const session = await SessionModel.findById(id);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Find and update the court
    const court = session.courts_data.find(c => c.court_number === courtNumber);
    if (!court) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    court.status = action === 'pause' ? 'paused' : 'in_progress';
    court.is_active = action !== 'pause';

    await SessionModel.updateSession(id, session);

    return NextResponse.json({ 
      success: true,
      court: court,
      session: session 
    });
  } catch (error) {
    console.error('Error updating court status:', error);
    return NextResponse.json(
      { error: 'Failed to update court status' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { SessionModel } from '@/lib/db/models/session';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { config } = await request.json();
    const params = await context.params;
    const { id } = params;

    const session = await SessionModel.findById(id);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update session configuration
    session.config = { ...session.config, ...config };

    // If court count changed, adjust courts_data
    if (config.court_count && config.court_count !== session.courts_data.length) {
      if (config.court_count > session.courts_data.length) {
        // Add new courts
        for (let i = session.courts_data.length + 1; i <= config.court_count; i++) {
          session.courts_data.push({
            court_number: i,
            players: [],
            is_active: false,
            status: 'available'
          });
        }
      } else {
        // Remove excess courts (move players to waiting queue)
        const removedCourts = session.courts_data.splice(config.court_count);
        const playersToQueue = removedCourts.flatMap(court => court.players);
        session.waiting_queue.push(...playersToQueue);
        session.next_up_queue = session.waiting_queue.slice(0, 4);
      }
    }

    await SessionModel.updateSession(id, session);

    return NextResponse.json({ 
      success: true,
      session: session 
    });
  } catch (error) {
    console.error('Error updating session config:', error);
    return NextResponse.json(
      { error: 'Failed to update session config' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { SessionModel } from '@/lib/db/models/session';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { courtNumber, oldPlayerId, newPlayerId } = await request.json();
    const params = await context.params;
    const { id } = params;

    const session = await SessionModel.findById(id);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Find the court
    const court = session.courts_data.find(c => c.court_number === courtNumber);
    if (!court) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    // Replace player in court
    const playerIndex = court.players.findIndex(p => p === oldPlayerId);
    if (playerIndex === -1) {
      return NextResponse.json({ error: 'Player not found in court' }, { status: 404 });
    }

    court.players[playerIndex] = newPlayerId;

    // Update waiting queue - remove new player and add old player
    session.waiting_queue = session.waiting_queue.filter(p => p !== newPlayerId);
    session.waiting_queue.push(oldPlayerId);

    // Update next up queue
    session.next_up_queue = session.waiting_queue.slice(0, 4);

    // Update player statuses
    const oldPlayer = session.player_data.find(p => p.player_id === oldPlayerId);
    const newPlayer = session.player_data.find(p => p.player_id === newPlayerId);
    
    if (oldPlayer) oldPlayer.is_active = false;
    if (newPlayer) newPlayer.is_active = true;

    await SessionModel.updateSession(id, session);

    return NextResponse.json({ 
      success: true,
      session: session 
    });
  } catch (error) {
    console.error('Error substituting player:', error);
    return NextResponse.json(
      { error: 'Failed to substitute player' },
      { status: 500 }
    );
  }
}
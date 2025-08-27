import { NextRequest, NextResponse } from 'next/server';
import { SessionModel } from '@/lib/db/models/session';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { player } = await request.json();
    const params = await context.params;
    const { id } = params;

    const session = await SessionModel.findById(id);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Add new player to session
    const newPlayer = {
      player_id: `player_${Date.now()}`,
      name: player.name,
      wins: 0,
      losses: 0,
      points_for: 0,
      points_against: 0,
      played_with: [],
      played_against: [],
      skill_rating: 500,
      session_skill_rating: 500,
      is_active: true,
      is_paused: false
    };

    session.player_data.push(newPlayer);

    // Add to waiting queue
    session.waiting_queue.push(newPlayer.player_id);

    await SessionModel.updateSession(id, session);

    return NextResponse.json({ 
      success: true, 
      player: newPlayer,
      session: session 
    });
  } catch (error) {
    console.error('Error adding player:', error);
    return NextResponse.json(
      { error: 'Failed to add player' },
      { status: 500 }
    );
  }
}
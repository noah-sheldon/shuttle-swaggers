import { NextRequest, NextResponse } from 'next/server';
import { SessionModel } from '@/lib/db/models/session';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { action, playerName } = await request.json();
    const params = await context.params;
    
    const session = await SessionModel.findById(params.id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (action === 'add') {
      // Add player to waiting queue
      const newPlayerId = `player_${Date.now()}`;
      const updatedQueue = [...session.waiting_queue, newPlayerId];
      
      // Also add to player_data if not exists
      const playerExists = session.player_data.find(p => p.name === playerName);
      if (!playerExists) {
        const newPlayer = {
          player_id: newPlayerId,
          name: playerName,
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
        await SessionModel.updatePlayerData(params.id, [...session.player_data, newPlayer]);
      }
      
      await SessionModel.updateWaitingQueue(params.id, updatedQueue);
      return NextResponse.json({ message: 'Player added successfully' });
      
    } else if (action === 'remove') {
      // Remove player from waiting queue
      const updatedQueue = session.waiting_queue.filter(playerId => {
        const player = session.player_data.find(p => p.player_id === playerId);
        return player?.name !== playerName;
      });
      
      await SessionModel.updateWaitingQueue(params.id, updatedQueue);
      return NextResponse.json({ message: 'Player removed successfully' });
      
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error managing players:', error);
    return NextResponse.json(
      { error: 'Failed to manage players' }, 
      { status: 500 }
    );
  }
}
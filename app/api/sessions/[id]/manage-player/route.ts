import { NextRequest, NextResponse } from 'next/server';
import { SessionModel } from '@/lib/db/models/session';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { playerId, action } = await request.json();
    const params = await context.params;
    
    const session = await SessionModel.findById(params.id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const playerIndex = session.player_data.findIndex(p => p.player_id === playerId);
    if (playerIndex === -1) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    let updatedPlayerData = [...session.player_data];

    if (action === 'pause') {
      // Pause the player
      updatedPlayerData[playerIndex].is_paused = true;
      updatedPlayerData[playerIndex].is_active = true; // Keep active but paused
      
      // Remove from waiting queue if they're in it
      const playerId_to_remove = playerId;
      const updatedWaitingQueue = session.waiting_queue.filter(qPlayerId => qPlayerId !== playerId_to_remove);
      await SessionModel.updateWaitingQueue(params.id, updatedWaitingQueue);
      
      await SessionModel.updatePlayerData(params.id, updatedPlayerData);
      return NextResponse.json({ message: 'Player paused successfully' });
      
    } else if (action === 'resume') {
      // Resume the player (unpause)
      updatedPlayerData[playerIndex].is_paused = false;
      updatedPlayerData[playerIndex].is_active = true;
      
      // Add to waiting queue if not already there
      if (!session.waiting_queue.includes(playerId)) {
        const updatedWaitingQueue = [...session.waiting_queue, playerId];
        await SessionModel.updateWaitingQueue(params.id, updatedWaitingQueue);
      }
      
      await SessionModel.updatePlayerData(params.id, updatedPlayerData);
      return NextResponse.json({ message: 'Player resumed successfully' });
      
    } else {
      return NextResponse.json({ error: 'Invalid action. Use "pause" or "resume"' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error managing player:', error);
    return NextResponse.json(
      { error: 'Failed to manage player' }, 
      { status: 500 }
    );
  }
}
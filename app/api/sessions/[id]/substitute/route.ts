import { NextRequest, NextResponse } from 'next/server';
import { SessionModel } from '@/lib/db/models/session';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { courtNumber, playerOut, playerIn, position } = await request.json();
    const params = await context.params;
    
    const session = await SessionModel.findById(params.id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Find the court
    const courtIndex = session.courts_data?.findIndex(c => c.court_number === courtNumber) ?? -1;
    if (courtIndex === -1) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    // Find players in the session
    const playerOutData = session.player_data.find(p => p.name === playerOut || p.player_id === playerOut);
    const playerInData = session.player_data.find(p => p.name === playerIn || p.player_id === playerIn);

    if (!playerOutData) {
      return NextResponse.json({ error: 'Player to substitute not found' }, { status: 404 });
    }

    if (!playerInData) {
      return NextResponse.json({ error: 'Substitute player not found' }, { status: 404 });
    }

    // Check if substitute player is available (not currently playing)
    const isPlayerInActive = session.courts_data?.some(court => 
      court.players.includes(playerInData.player_id)
    );

    if (isPlayerInActive) {
      return NextResponse.json({ error: 'Substitute player is currently playing' }, { status: 400 });
    }

    // Update court data
    let updatedCourtsData = [...(session.courts_data || [])];
    const court = updatedCourtsData[courtIndex];

    // Replace player in court
    const playerIndex = court.players.findIndex(id => id === playerOutData.player_id);
    if (playerIndex === -1) {
      return NextResponse.json({ error: 'Player not found in specified court' }, { status: 404 });
    }

    // Substitute the player
    updatedCourtsData[courtIndex] = {
      ...court,
      players: court.players.map(id => 
        id === playerOutData.player_id ? playerInData.player_id : id
      )
    };

    // Update waiting queue - remove substitute player and add substituted player
    let updatedWaitingQueue = session.waiting_queue.filter(id => id !== playerInData.player_id);
    if (!updatedWaitingQueue.includes(playerOutData.player_id)) {
      updatedWaitingQueue.push(playerOutData.player_id);
    }

    // Update player status
    const updatedPlayerData = session.player_data.map(player => {
      if (player.player_id === playerOutData.player_id) {
        return { ...player, is_active: false };
      }
      if (player.player_id === playerInData.player_id) {
        return { ...player, is_active: true };
      }
      return player;
    });

    // Update session
    const updatedSession = {
      ...session,
      courts_data: updatedCourtsData,
      waiting_queue: updatedWaitingQueue,
      player_data: updatedPlayerData
    };

    await SessionModel.updateSession(params.id, updatedSession);
    
    return NextResponse.json({ 
      message: 'Player substitution completed successfully',
      substitution: {
        court: courtNumber,
        out: playerOut,
        in: playerIn,
        time: new Date()
      }
    });
    
  } catch (error) {
    console.error('Error substituting player:', error);
    return NextResponse.json(
      { error: 'Failed to substitute player' }, 
      { status: 500 }
    );
  }
}
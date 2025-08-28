import { NextRequest, NextResponse } from 'next/server';
import { SessionModel } from '@/lib/db/models/session';
import { SessionAlgorithm } from '@/lib/algos/session';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const { action } = await request.json();

    const session = await SessionModel.findById(id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (action !== 'check_and_assign') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Only process if this is a partnership rotation session
    if (session.config?.game_type !== 'partnership_rotation') {
      return NextResponse.json({ message: 'Auto-assignment only for partnership rotation' });
    }

    let updatedSession = { ...session };
    let assignmentsMade = 0;

    // Find available courts (not currently playing)
    const availableCourts = updatedSession.courts_data.filter(court => 
      court.status === 'available' || court.players.length < 4
    );

    // Get active unpaused players in waiting queue
    const activeWaitingPlayers = updatedSession.waiting_queue.filter(playerId => {
      const player = updatedSession.player_data.find(p => p.player_id === playerId);
      return player && player.is_active && !player.is_paused;
    });

    // For each available court, try to assign 4 players if available
    for (const court of availableCourts) {
      if (activeWaitingPlayers.length >= 4) {
        // Take first 4 players from waiting queue
        const courtPlayers = activeWaitingPlayers.splice(0, 4);
        
        // Find best partnerships using the algorithm
        const teams = SessionAlgorithm.findBestPartnerships(
          courtPlayers, 
          updatedSession.player_data
        );

        // Update court
        const courtIndex = updatedSession.courts_data.findIndex(c => c.court_number === court.court_number);
        if (courtIndex !== -1) {
          updatedSession.courts_data[courtIndex] = {
            ...court,
            players: courtPlayers,
            status: 'in_progress',
            is_active: true,
            current_match: {
              match_id: `match_${Date.now()}_${court.court_number}`,
              teams: teams,
              scores: [0, 0],
              winner_team_index: 0,
              court_number: court.court_number,
              start_time: new Date(),
              status: 'in_progress'
            }
          };
          assignmentsMade++;
        }

        // Remove assigned players from waiting queue
        updatedSession.waiting_queue = updatedSession.waiting_queue.filter(
          playerId => !courtPlayers.includes(playerId)
        );
      }
    }

    // Update next_up_queue with remaining active players
    const remainingActive = updatedSession.waiting_queue.filter(playerId => {
      const player = updatedSession.player_data.find(p => p.player_id === playerId);
      return player && player.is_active && !player.is_paused;
    });

    updatedSession.next_up_queue = remainingActive.slice(0, 4);

    // Save the updated session
    if (assignmentsMade > 0) {
      await SessionModel.updateSession(id, updatedSession);
    }

    return NextResponse.json({ 
      message: `Auto-assigned ${assignmentsMade} court(s)`,
      assignmentsMade,
      playersWaiting: remainingActive.length,
      availableCourts: availableCourts.length
    });

  } catch (error) {
    console.error('Error in auto-assignment:', error);
    return NextResponse.json(
      { error: 'Failed to auto-assign courts' }, 
      { status: 500 }
    );
  }
}
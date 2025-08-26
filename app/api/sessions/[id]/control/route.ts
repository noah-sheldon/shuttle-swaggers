import { NextRequest, NextResponse } from 'next/server';
import { SessionModel } from '@/lib/db/models/session';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { action, courtNumber, matchData } = await request.json();
    const params = await context.params;
    
    const session = await SessionModel.findById(params.id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    let updatedSession = { ...session };

    switch (action) {
      case 'pause_court':
        // Pause a specific court
        updatedSession.courts_data = session.courts_data?.map(court => 
          court.court_number === courtNumber 
            ? { ...court, status: 'paused', is_active: false }
            : court
        ) || [];
        break;

      case 'resume_court':
        // Resume a paused court
        updatedSession.courts_data = session.courts_data?.map(court => 
          court.court_number === courtNumber 
            ? { ...court, status: 'in_progress', is_active: true }
            : court
        ) || [];
        break;

      case 'maintenance_court':
        // Set court to maintenance mode
        updatedSession.courts_data = session.courts_data?.map(court => 
          court.court_number === courtNumber 
            ? { ...court, status: 'maintenance', is_active: false }
            : court
        ) || [];
        break;

      case 'restart_match':
        // Restart current match on a court
        updatedSession.courts_data = session.courts_data?.map(court => {
          if (court.court_number === courtNumber && court.current_match) {
            return {
              ...court,
              current_match: {
                ...court.current_match,
                start_time: new Date(),
                scores: [0, 0],
                status: 'in_progress'
              }
            };
          }
          return court;
        }) || [];
        break;

      case 'modify_score':
        // Modify current match score
        if (!matchData || !matchData.scores) {
          return NextResponse.json({ error: 'Score data required' }, { status: 400 });
        }

        updatedSession.courts_data = session.courts_data?.map(court => {
          if (court.court_number === courtNumber && court.current_match) {
            return {
              ...court,
              current_match: {
                ...court.current_match,
                scores: matchData.scores,
                winner_team_index: matchData.scores[0] > matchData.scores[1] ? 0 : 1
              }
            };
          }
          return court;
        }) || [];
        break;

      case 'pause_player':
        // Temporarily pause a player from rotation
        if (!matchData || !matchData.playerId) {
          return NextResponse.json({ error: 'Player ID required' }, { status: 400 });
        }

        updatedSession.player_data = session.player_data.map(player =>
          player.player_id === matchData.playerId
            ? { ...player, is_paused: true }
            : player
        );
        break;

      case 'resume_player':
        // Resume a paused player
        if (!matchData || !matchData.playerId) {
          return NextResponse.json({ error: 'Player ID required' }, { status: 400 });
        }

        updatedSession.player_data = session.player_data.map(player =>
          player.player_id === matchData.playerId
            ? { ...player, is_paused: false }
            : player
        );
        break;

      case 'reset_session_ratings':
        // Reset all players' session ratings but keep historical data
        updatedSession.player_data = session.player_data.map(player => ({
          ...player,
          session_skill_rating: 500,
          wins: 0,
          losses: 0,
          points_for: 0,
          points_against: 0,
          played_with: [],
          played_against: []
        }));
        break;

      case 'reset_historical_ratings':
        // Reset historical performance data
        updatedSession.player_data = session.player_data.map(player => ({
          ...player,
          skill_rating: 500
        }));
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update the session in database
    await SessionModel.updateSession(params.id, updatedSession);
    
    return NextResponse.json({ 
      message: `${action.replace('_', ' ')} completed successfully`,
      action,
      courtNumber,
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('Error controlling session:', error);
    return NextResponse.json(
      { error: 'Failed to control session' }, 
      { status: 500 }
    );
  }
}
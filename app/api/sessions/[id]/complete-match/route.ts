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
    const { courtNumber, scores, winnerTeamIndex } = await request.json();

    const session = await SessionModel.findById(id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Find the court
    const courtIndex = session.courts_data.findIndex(c => c.court_number === courtNumber);
    if (courtIndex === -1) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    const court = session.courts_data[courtIndex];
    if (!court.current_match || court.players.length !== 4) {
      return NextResponse.json({ error: 'No active match on this court' }, { status: 400 });
    }

    // Create match record
    const completedMatch = {
      ...court.current_match,
      scores: scores,
      winner_team_index: winnerTeamIndex,
      end_time: new Date(),
      status: 'completed' as const,
      duration_seconds: Math.floor((new Date().getTime() - new Date(court.current_match.start_time).getTime()) / 1000)
    };

    // Update player statistics
    const winnerTeam = court.players.slice(winnerTeamIndex * 2, (winnerTeamIndex + 1) * 2);
    const loserTeam = court.players.slice((1 - winnerTeamIndex) * 2, ((1 - winnerTeamIndex) + 1) * 2);

    let updatedPlayerData = [...session.player_data];
    
    // Update winners
    winnerTeam.forEach(playerId => {
      const playerIndex = updatedPlayerData.findIndex(p => p.player_id === playerId);
      if (playerIndex !== -1) {
        updatedPlayerData[playerIndex].wins += 1;
        updatedPlayerData[playerIndex].points_for += scores[winnerTeamIndex];
        updatedPlayerData[playerIndex].points_against += scores[1 - winnerTeamIndex];
        updatedPlayerData[playerIndex].session_skill_rating += 10; // Winner bonus
        
        // Track partnerships
        const partner = winnerTeam.find(id => id !== playerId);
        if (partner && !updatedPlayerData[playerIndex].played_with.includes(partner)) {
          updatedPlayerData[playerIndex].played_with.push(partner);
        }
        
        // Track opponents
        loserTeam.forEach(opponentId => {
          if (!updatedPlayerData[playerIndex].played_against.includes(opponentId)) {
            updatedPlayerData[playerIndex].played_against.push(opponentId);
          }
        });
      }
    });

    // Update losers
    loserTeam.forEach(playerId => {
      const playerIndex = updatedPlayerData.findIndex(p => p.player_id === playerId);
      if (playerIndex !== -1) {
        updatedPlayerData[playerIndex].losses += 1;
        updatedPlayerData[playerIndex].points_for += scores[1 - winnerTeamIndex];
        updatedPlayerData[playerIndex].points_against += scores[winnerTeamIndex];
        updatedPlayerData[playerIndex].session_skill_rating = Math.max(400, updatedPlayerData[playerIndex].session_skill_rating - 5); // Small penalty
        
        // Track partnerships
        const partner = loserTeam.find(id => id !== playerId);
        if (partner && !updatedPlayerData[playerIndex].played_with.includes(partner)) {
          updatedPlayerData[playerIndex].played_with.push(partner);
        }
        
        // Track opponents
        winnerTeam.forEach(opponentId => {
          if (!updatedPlayerData[playerIndex].played_against.includes(opponentId)) {
            updatedPlayerData[playerIndex].played_against.push(opponentId);
          }
        });
      }
    });

    // Handle Partnership Rotation logic
    if (session.config?.game_type === 'partnership_rotation') {
      // Winners stay on court, get new partners from queue
      // Losers go to back of queue
      if (session.waiting_queue.length >= 2) {
        // Get next 2 players from queue
        const newPlayers = session.waiting_queue.slice(0, 2);
        const updatedQueue = [...session.waiting_queue.slice(2), ...loserTeam];
        
        // Create new teams with winners and new players
        const allPlayersForNewMatch = [...winnerTeam, ...newPlayers];
        const newTeams = SessionAlgorithm.findBestPartnerships(allPlayersForNewMatch, updatedPlayerData);
        
        // Update court with new match
        session.courts_data[courtIndex] = {
          ...court,
          players: allPlayersForNewMatch,
          status: 'in_progress',
          current_match: {
            match_id: `match_${Date.now()}_${courtNumber}`,
            teams: newTeams,
            scores: [0, 0],
            winner_team_index: 0,
            court_number: courtNumber,
            start_time: new Date(),
            status: 'in_progress'
          }
        };
        
        session.waiting_queue = updatedQueue;
        session.next_up_queue = updatedQueue.slice(0, 4);
      } else {
        // Not enough players for new match - court becomes available
        session.courts_data[courtIndex] = {
          ...court,
          players: [],
          status: 'available',
          is_active: false,
          current_match: undefined
        };
        
        // Add all players back to queue
        session.waiting_queue = [...session.waiting_queue, ...court.players];
        session.next_up_queue = session.waiting_queue.slice(0, 4);
      }
    } else {
      // For other game types, just make court available
      session.courts_data[courtIndex] = {
        ...court,
        players: [],
        status: 'available',
        is_active: false,
        current_match: undefined
      };
    }

    // Add completed match to session history
    session.matches = [...(session.matches || []), completedMatch];
    session.player_data = updatedPlayerData;

    // Save updated session
    await SessionModel.updateSession(id, session);

    return NextResponse.json({ 
      message: 'Match completed successfully',
      match: completedMatch,
      newMatch: session.courts_data[courtIndex].current_match 
    });

  } catch (error) {
    console.error('Error completing match:', error);
    return NextResponse.json(
      { error: 'Failed to complete match' }, 
      { status: 500 }
    );
  }
}
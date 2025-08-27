import { NextRequest, NextResponse } from 'next/server';
import { SessionModel } from '@/lib/db/models/session';
import { TournamentAlgorithms } from '@/lib/algos/tournament';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { resetType } = await request.json(); // 'session' | 'historical'
    const params = await context.params;
    const { id } = params;

    const session = await SessionModel.findById(id);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (resetType === 'session') {
      // Reset only session-specific data
      session.player_data = TournamentAlgorithms.resetSessionRatings(session.player_data);
      session.matches = [];
      session.rankings = [];
    } else if (resetType === 'historical') {
      // Reset all historical data but keep player names
      session.player_data = session.player_data.map(player => ({
        ...player,
        wins: 0,
        losses: 0,
        points_for: 0,
        points_against: 0,
        played_with: [],
        played_against: [],
        skill_rating: 500,
        session_skill_rating: 500
      }));
      session.matches = [];
      session.rankings = [];
    }

    await SessionModel.updateSession(id, session);

    return NextResponse.json({ 
      success: true,
      session: session 
    });
  } catch (error) {
    console.error('Error resetting session data:', error);
    return NextResponse.json(
      { error: 'Failed to reset session data' },
      { status: 500 }
    );
  }
}
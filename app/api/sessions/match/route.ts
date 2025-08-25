import { NextRequest, NextResponse } from 'next/server';
import { SessionModel } from '@/lib/db/models/session';
import { SessionAlgorithm } from '@/lib/algos/session';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, match } = await request.json();

    // Get current session
    const session = await SessionModel.findById(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update player statistics
    const updatedPlayerData = SessionAlgorithm.updatePlayerStats(session.player_data, match);
    
    // Calculate new rankings
    const newRankings = SessionAlgorithm.calculateRankings(updatedPlayerData);

    // Add match to session
    await SessionModel.addMatch(sessionId, match);
    
    // Update player data and rankings
    await SessionModel.updatePlayerData(sessionId, updatedPlayerData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding match:', error);
    return NextResponse.json({ error: 'Failed to add match' }, { status: 500 });
  }
}
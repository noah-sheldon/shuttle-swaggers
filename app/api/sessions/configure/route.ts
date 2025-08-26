import { NextRequest, NextResponse } from 'next/server';
import { SessionModel } from '@/lib/db/models/session';
import { TournamentAlgorithms } from '@/lib/algos/tournament';
import { Player } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, location, config, selected_players } = body;
    
    // Create player data with initial skill ratings
    const player_data: Player[] = selected_players.map((name: string, index: number) => ({
      player_id: `player_${Date.now()}_${index}`,
      name,
      wins: 0,
      losses: 0,
      points_for: 0,
      points_against: 0,
      played_with: [],
      played_against: [],
      skill_rating: 500, // Default middle rating (0-1000)
      session_skill_rating: 500, // Starts fresh each session
      is_active: true,
      is_paused: false
    }));

    // Initialize session based on game type
    const initialization = TournamentAlgorithms.initializeSession(player_data, config);

    const sessionData = {
      date: new Date(date),
      location,
      config,
      courts_data: initialization.courts_data,
      player_data,
      matches: [],
      rankings: [],
      is_live: false,
      status: 'upcoming' as const,
      waiting_queue: initialization.waiting_queue,
      next_up_queue: initialization.next_up_queue,
      tournament_bracket: initialization.tournament_bracket,
      session_start_time: undefined,
      
      // Legacy support
      courts: config.court_count
    };

    const session = await SessionModel.create(sessionData);
    return NextResponse.json({ success: true, session });
    
  } catch (error) {
    console.error('Error configuring session:', error);
    return NextResponse.json({ error: 'Failed to configure session' }, { status: 500 });
  }
}
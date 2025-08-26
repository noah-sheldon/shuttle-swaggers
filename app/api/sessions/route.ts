import { NextRequest, NextResponse } from 'next/server';
import { SessionModel } from '@/lib/db/models/session';

export async function GET() {
  try {
    const sessions = await SessionModel.findUpcoming();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const sessionData = {
      date: new Date(body.date),
      location: body.location,
      config: {
        game_type: 'partnership_rotation' as const,
        scoring_system: 'single_set_21' as const,
        court_count: body.courts,
        max_duration_minutes: 120,
        skill_balancing: true
      },
      courts_data: [],
      player_data: [],
      matches: [],
      rankings: [],
      is_live: false,
      status: 'upcoming' as const,
      waiting_queue: [],
      next_up_queue: [],
      
      // Legacy support
      courts: body.courts
    };

    const session = await SessionModel.create(sessionData);
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
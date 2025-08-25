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
      courts: body.courts,
      player_data: [],
      matches: [],
      rankings: [],
      is_live: false,
      waiting_queue: []
    };

    const session = await SessionModel.create(sessionData);
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
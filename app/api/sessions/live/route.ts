import { NextResponse } from 'next/server';
import { SessionModel } from '@/lib/db/models/session';

export async function GET() {
  try {
    const liveSession = await SessionModel.findLive();
    return NextResponse.json(liveSession);
  } catch (error) {
    console.error('Error fetching live session:', error);
    return NextResponse.json({ error: 'Failed to fetch live session' }, { status: 500 });
  }
}
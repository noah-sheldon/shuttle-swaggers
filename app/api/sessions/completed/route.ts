import { NextRequest, NextResponse } from 'next/server';
import { SessionModel } from '@/lib/db/models/session';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const sessions = await SessionModel.findCompleted(limit);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching completed sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch completed sessions' }, { status: 500 });
  }
}
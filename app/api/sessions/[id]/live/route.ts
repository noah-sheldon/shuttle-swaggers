import { NextRequest, NextResponse } from 'next/server';
import { SessionModel } from '@/lib/db/models/session';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action } = await request.json();
    
    if (action === 'start') {
      // Check if there's already a live session
      const existingLiveSession = await SessionModel.findLive();
      if (existingLiveSession) {
        return NextResponse.json(
          { error: 'Another session is already live' }, 
          { status: 409 }
        );
      }
      
      await SessionModel.startLiveSession(params.id);
      return NextResponse.json({ message: 'Session started successfully' });
      
    } else if (action === 'end') {
      await SessionModel.endLiveSession(params.id);
      return NextResponse.json({ message: 'Session ended successfully' });
      
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error managing live session:', error);
    return NextResponse.json(
      { error: 'Failed to manage session' }, 
      { status: 500 }
    );
  }
}
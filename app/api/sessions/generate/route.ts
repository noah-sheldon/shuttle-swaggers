import { NextRequest, NextResponse } from 'next/server';
import { SessionModel } from '@/lib/db/models/session';
import { generateSessions } from '@/lib/utils/sessionGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, monthsAhead = 2 } = body;
    
    // Parse start date or use August 26, 2025 as default
    const start = startDate ? new Date(startDate) : new Date('2025-08-26T00:00:00.000Z');
    
    // Generate sessions for the specified period
    const sessionsToCreate = generateSessions(start, monthsAhead);
    
    // Get existing sessions to avoid duplicates
    const existingSessions = await SessionModel.findUpcoming();
    const existingDates = new Set(
      existingSessions.map(session => session.date.toISOString().split('T')[0])
    );
    
    // Filter out sessions that already exist
    const newSessions = sessionsToCreate.filter(session => {
      const sessionDateStr = session.date.toISOString().split('T')[0];
      return !existingDates.has(sessionDateStr);
    });
    
    // Create new sessions
    const createdSessions = [];
    for (const sessionData of newSessions) {
      const session = await SessionModel.create(sessionData);
      createdSessions.push(session);
    }
    
    return NextResponse.json({
      message: `Generated ${createdSessions.length} new sessions`,
      sessions: createdSessions,
      skipped: sessionsToCreate.length - newSessions.length
    });
  } catch (error) {
    console.error('Error generating sessions:', error);
    return NextResponse.json({ error: 'Failed to generate sessions' }, { status: 500 });
  }
}
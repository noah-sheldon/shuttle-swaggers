import { NextRequest, NextResponse } from 'next/server';
import { SessionModel } from '@/lib/db/models/session';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { action, courtNumber, status, newCourtCount } = await request.json();
    const params = await context.params;
    
    const session = await SessionModel.findById(params.id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    let updatedSession = { ...session };

    switch (action) {
      case 'add_court':
        // Add a new court to the session
        const newCourtNumber = (session.courts_data?.length || session.courts) + 1;
        const newCourt = {
          court_number: newCourtNumber,
          players: [],
          is_active: true,
          status: 'available' as const
        };

        updatedSession.courts_data = [...(session.courts_data || []), newCourt];
        updatedSession.courts = updatedSession.courts_data.length;
        updatedSession.config = {
          ...session.config,
          court_count: updatedSession.courts_data.length
        };
        break;

      case 'remove_court':
        if (!courtNumber) {
          return NextResponse.json({ error: 'Court number required' }, { status: 400 });
        }

        // Remove court and redistribute players to waiting queue
        const courtToRemove = session.courts_data?.find(c => c.court_number === courtNumber);
        if (courtToRemove && courtToRemove.players.length > 0) {
          updatedSession.waiting_queue = [...session.waiting_queue, ...courtToRemove.players];
        }

        updatedSession.courts_data = session.courts_data?.filter(c => c.court_number !== courtNumber) || [];
        updatedSession.courts = updatedSession.courts_data.length;
        updatedSession.config = {
          ...session.config,
          court_count: updatedSession.courts_data.length
        };
        break;

      case 'update_status':
        if (!courtNumber || !status) {
          return NextResponse.json({ error: 'Court number and status required' }, { status: 400 });
        }

        updatedSession.courts_data = session.courts_data?.map(court => 
          court.court_number === courtNumber 
            ? { ...court, status }
            : court
        ) || [];
        break;

      case 'bulk_update':
        if (typeof newCourtCount !== 'number') {
          return NextResponse.json({ error: 'New court count required' }, { status: 400 });
        }

        const currentCourts = session.courts_data?.length || session.courts;
        
        if (newCourtCount > currentCourts) {
          // Add courts
          const courtsToAdd = newCourtCount - currentCourts;
          const newCourts = [];
          
          for (let i = 0; i < courtsToAdd; i++) {
            newCourts.push({
              court_number: currentCourts + i + 1,
              players: [],
              is_active: true,
              status: 'available' as const
            });
          }
          
          updatedSession.courts_data = [...(session.courts_data || []), ...newCourts];
        } else if (newCourtCount < currentCourts) {
          // Remove courts and redistribute players
          const courtsToKeep = session.courts_data?.slice(0, newCourtCount) || [];
          const courtsToRemove = session.courts_data?.slice(newCourtCount) || [];
          
          // Add players from removed courts to waiting queue
          const playersToRedistribute = courtsToRemove.flatMap(court => court.players);
          updatedSession.waiting_queue = [...session.waiting_queue, ...playersToRedistribute];
          updatedSession.courts_data = courtsToKeep;
        }

        updatedSession.courts = newCourtCount;
        updatedSession.config = {
          ...session.config,
          court_count: newCourtCount
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update the session in database
    await SessionModel.updateSession(params.id, updatedSession);
    
    return NextResponse.json({ 
      message: 'Courts updated successfully',
      courts_data: updatedSession.courts_data,
      court_count: updatedSession.courts
    });
    
  } catch (error) {
    console.error('Error managing courts:', error);
    return NextResponse.json(
      { error: 'Failed to manage courts' }, 
      { status: 500 }
    );
  }
}
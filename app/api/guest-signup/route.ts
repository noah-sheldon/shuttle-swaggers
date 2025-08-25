import { NextRequest, NextResponse } from 'next/server';
import { GuestModel } from '@/lib/db/models/guest';
import { SessionModel } from '@/lib/db/models/session';
import { sendGuestConfirmation, sendAdminNotification } from '@/lib/email/resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create guest signup
    const guest = await GuestModel.create({
      name: body.name,
      email: body.email,
      mobile: body.mobile,
      feather_experience: body.feather_experience,
      league_experience: body.league_experience,
      league_name: body.league_name || '',
      player_level: body.player_level,
      fitness_level: body.fitness_level,
      session_id: body.session_id,
      created_at: new Date()
    });

    // Get session details for email
    const session = await SessionModel.findById(body.session_id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Send confirmation emails
    try {
      await Promise.all([
        sendGuestConfirmation(guest, session),
        sendAdminNotification(guest, session)
      ]);
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't fail the signup if emails fail
    }

    return NextResponse.json({ success: true, guest });
  } catch (error) {
    console.error('Error creating guest signup:', error);
    return NextResponse.json({ error: 'Failed to create guest signup' }, { status: 500 });
  }
}
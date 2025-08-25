import { Resend } from 'resend';
import { GuestSignUp } from '@/types';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendGuestConfirmation(guest: GuestSignUp, sessionDetails: any) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Shuttle Swaggers <noreply@shuttleswaggers.com>',
      to: [guest.email],
      subject: 'Welcome to Shuttle Swaggers - Sign-up Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #004d40; color: white; padding: 20px; text-align: center;">
            <h1>Welcome to Shuttle Swaggers!</h1>
          </div>
          
          <div style="padding: 20px; background: #f5f5f5;">
            <h2>Hi ${guest.name},</h2>
            
            <p>Thank you for your interest in joining our badminton session! We've received your sign-up and our team will be in touch shortly.</p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>Session Details:</h3>
              <p><strong>Date:</strong> ${new Date(sessionDetails.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${new Date(sessionDetails.date).toLocaleTimeString()}</p>
              <p><strong>Location:</strong> ${sessionDetails.location}</p>
              <p><strong>Guest Fee:</strong> £12</p>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px;">
              <h3>Your Information:</h3>
              <p><strong>Experience Level:</strong> ${guest.player_level}</p>
              <p><strong>Feather Shuttlecock Experience:</strong> ${guest.feather_experience}</p>
              <p><strong>Fitness Level:</strong> ${guest.fitness_level}/5</p>
            </div>
            
            <p style="margin-top: 20px;">A club administrator will contact you at ${guest.mobile} to confirm your spot and provide additional details.</p>
            
            <p>We look forward to seeing you on court!</p>
            
            <p>Best regards,<br>The Shuttle Swaggers Team</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending guest confirmation:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending guest confirmation:', error);
    return { success: false, error };
  }
}

export async function sendAdminNotification(guest: GuestSignUp, sessionDetails: any) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Shuttle Swaggers <noreply@shuttleswaggers.com>',
      to: ['shuttleswaggersbc@gmail.com'],
      subject: `New Guest Sign-up: ${guest.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #004d40; color: white; padding: 20px;">
            <h1>New Guest Sign-up</h1>
          </div>
          
          <div style="padding: 20px; background: #f5f5f5;">
            <h2>Guest Details:</h2>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
              <p><strong>Name:</strong> ${guest.name}</p>
              <p><strong>Email:</strong> ${guest.email}</p>
              <p><strong>Mobile:</strong> ${guest.mobile}</p>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
              <h3>Experience & Skill Level:</h3>
              <p><strong>Player Level:</strong> ${guest.player_level}</p>
              <p><strong>Feather Shuttlecock Experience:</strong> ${guest.feather_experience}</p>
              <p><strong>League Experience:</strong> ${guest.league_experience ? 'Yes' : 'No'}</p>
              ${guest.league_name ? `<p><strong>League:</strong> ${guest.league_name}</p>` : ''}
              <p><strong>Fitness Level:</strong> ${guest.fitness_level}/5</p>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px;">
              <h3>Session Details:</h3>
              <p><strong>Date:</strong> ${new Date(sessionDetails.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${new Date(sessionDetails.date).toLocaleTimeString()}</p>
              <p><strong>Location:</strong> ${sessionDetails.location}</p>
            </div>
            
            <p style="margin-top: 20px; color: #ff6f00;"><strong>Action Required:</strong> Please contact ${guest.name} at ${guest.mobile} to confirm their participation.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending admin notification:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return { success: false, error };
  }
}
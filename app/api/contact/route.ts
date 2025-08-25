import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Send email to admin
    const { data, error } = await resend.emails.send({
      from: 'Shuttle Swaggers <noreply@shuttleswaggers.com>',
      to: ['shuttleswaggersbc@gmail.com'],
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #004d40; color: white; padding: 20px;">
            <h1>New Contact Form Submission</h1>
          </div>
          
          <div style="padding: 20px; background: #f5f5f5;">
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subject:</strong> ${subject}</p>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
              <h3>Message:</h3>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending contact email:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
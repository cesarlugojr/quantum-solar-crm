/**
 * Twilio API Integration
 * 
 * Provides SMS and voice communication capabilities for customer outreach,
 * appointment reminders, and project status updates.
 * 
 * Features:
 * - Send SMS notifications
 * - Appointment reminders
 * - Project status updates
 * - Lead follow-up messages
 * - Bulk messaging capabilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, message, type } = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioNumber) {
      return NextResponse.json(
        { error: 'Twilio configuration missing' },
        { status: 500 }
      );
    }

    // Format phone number (ensure it starts with +1 for US numbers)
    const formattedNumber = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`;

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: formattedNumber,
        From: twilioNumber,
        Body: message
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Twilio API error:', response.status, error);
      return NextResponse.json(
        { error: 'Failed to send SMS' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Log the message for tracking
    console.log(`SMS sent to ${formattedNumber}, SID: ${data.sid}, Type: ${type || 'general'}`);
    
    return NextResponse.json({ 
      success: true, 
      messageSid: data.sid,
      status: data.status
    });
    
  } catch (error) {
    console.error('Error in Twilio API integration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Bulk messaging endpoint
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipients, message } = await request.json();

    if (!recipients || !Array.isArray(recipients) || !message) {
      return NextResponse.json(
        { error: 'Recipients array and message are required' },
        { status: 400 }
      );
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioNumber) {
      return NextResponse.json(
        { error: 'Twilio configuration missing' },
        { status: 500 }
      );
    }

    const results = await Promise.all(
      recipients.map(async (recipient: { phone: string; name?: string }) => {
        try {
          const formattedNumber = recipient.phone.startsWith('+') 
            ? recipient.phone 
            : `+1${recipient.phone.replace(/\D/g, '')}`;

          // Personalize message if name is provided
          const personalizedMessage = recipient.name 
            ? message.replace('[Name]', recipient.name)
            : message;

          const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: formattedNumber,
              From: twilioNumber,
              Body: personalizedMessage
            })
          });

          if (response.ok) {
            const data = await response.json();
            return {
              phone: recipient.phone,
              success: true,
              messageSid: data.sid
            };
          } else {
            return {
              phone: recipient.phone,
              success: false,
              error: 'Failed to send'
            };
          }
        } catch {
          return {
            phone: recipient.phone,
            success: false,
            error: 'Send error'
          };
        }
      })
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: recipients.length,
        successful,
        failed
      }
    });
    
  } catch (error) {
    console.error('Error in Twilio bulk messaging:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Predefined message templates
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templates = {
      appointment_reminder: "Hi [Name]! This is a reminder about your solar consultation appointment tomorrow at [Time]. We're excited to help you save money with solar! - Quantum Solar",
      follow_up: "Hi [Name]! Thanks for your interest in solar. We'd love to answer any questions and provide your custom solar proposal. When's a good time to chat? - Quantum Solar",
      installation_update: "Hi [Name]! Great news - your solar installation is scheduled for [Date]. Our team will arrive between [Time]. Any questions? - Quantum Solar",
      project_complete: "Congratulations [Name]! Your solar system is now active and generating clean energy. You should see savings on your next bill! - Quantum Solar",
      welcome_new_lead: "Thanks for your interest in solar, [Name]! We'll have a solar expert contact you within 24 hours with your custom proposal. - Quantum Solar"
    };

    return NextResponse.json({ templates });
    
  } catch (error) {
    console.error('Error fetching SMS templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder-resend-key');

export async function POST(request: NextRequest) {
  try {
    // Log the start of the request
    console.log('Email send request received');
    console.log('Environment check:', {
      hasApiKey: !!process.env.RESEND_API_KEY,
      apiKeyLength: process.env.RESEND_API_KEY?.length
    });

    if (!process.env.RESEND_API_KEY) {
      throw new Error('Missing Resend API key');
    }

    // Parse request body for dynamic email data
    const body = await request.json();
    console.log('Email request body:', body);

    // Default values for test emails
    const defaultEmailData = {
      from: 'Quantum Solar <info@quantumsolar.us>',
      to: ['info@quantumsolar.us'],
      subject: 'Test Email from Quantum Solar',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #333;">Test Email from Quantum Solar</h1>
          <p>This is a test email sent at: ${new Date().toISOString()}</p>
          <p>If you receive this, the email integration is working correctly.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">Sent via Quantum Solar Website</p>
        </div>
      `,
      text: 'This is a test email from your Quantum Solar website.',
      replyTo: 'info@quantumsolar.us'
    };

    // Use dynamic data if provided, otherwise use defaults
    const emailData = {
      from: 'Quantum Solar <info@quantumsolar.us>',
      to: [body.to || 'cesar@quantumsolar.us'],
      subject: body.subject || defaultEmailData.subject,
      html: body.html || defaultEmailData.html,
      text: body.text || defaultEmailData.text,
      replyTo: 'info@quantumsolar.us'
    };

    console.log('Attempting to send email with config:', emailData);

    // Send the email
    const result = await resend.emails.send(emailData);

    console.log('Resend API response:', result);

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Failed to send email:', error);
    
    // Detailed error logging
    const errorDetails = {
      name: error instanceof Error ? error.name : 'Unknown Error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    };

    console.error('Error details:', errorDetails);

    return NextResponse.json({
      success: false,
      error: errorDetails,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

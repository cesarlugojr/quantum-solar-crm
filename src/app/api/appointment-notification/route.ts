/**
 * Appointment Notification API Endpoint
 * 
 * Handles appointment preference confirmations from the thank you page.
 * Sends separate email notifications without interrupting the lead flow.
 * 
 * Features:
 * - Separate from main lead flow to prevent blocking conversions
 * - Email notifications to sales team
 * - Lead information integration
 * - Error handling with graceful degradation
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { preferredDate, preferredTime, source } = await request.json();

    // Validate required fields
    if (!preferredDate && !preferredTime) {
      return NextResponse.json(
        { error: 'At least one appointment preference is required' },
        { status: 400 }
      );
    }

    try {
      // Get the most recent lead information
      const leadInfo = await getRecentLeadInfo();

      // Send appointment notification email
      await sendAppointmentNotification({
        preferredDate,
        preferredTime,
        source: source || 'unknown',
        leadInfo
      });

      // Store appointment preferences in database (optional - for tracking)
      await storeAppointmentPreference({
        preferredDate,
        preferredTime,
        source,
        leadInfo
      });

      return NextResponse.json({
        success: true,
        message: 'Appointment preferences confirmed successfully'
      });

    } catch (emailError) {
      console.error('Appointment notification error:', emailError);
      
      // Don't fail the request if email fails - this is non-critical
      return NextResponse.json({
        success: true,
        message: 'Appointment preferences received',
        note: 'Email notification may be delayed'
      });
    }

  } catch (error) {
    console.error('Appointment notification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get the most recent lead information from splash form
 */
async function getRecentLeadInfo() {
  try {
    const { data, error } = await supabase
      .from('splash_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching lead info:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error in getRecentLeadInfo:', error);
    return null;
  }
}

/**
 * Store appointment preference for tracking (optional)
 */
async function storeAppointmentPreference(data: {
  preferredDate?: string;
  preferredTime?: string;
  source?: string;
  leadInfo?: Record<string, unknown>;
}) {
  try {
    // Store in a simple format - you could create a dedicated table for this
    const preferenceRecord = {
      lead_id: data.leadInfo?.id || null,
      preferred_date: data.preferredDate || null,
      preferred_time: data.preferredTime || null,
      source: data.source || 'unknown',
      created_at: new Date().toISOString(),
      lead_phone: data.leadInfo?.phone || null,
      lead_email: data.leadInfo?.email || null,
      lead_name: `${data.leadInfo?.first_name || ''} ${data.leadInfo?.last_name || ''}`.trim() || null
    };

    // You could store this in the contact_submissions table with a special type
    // or create a dedicated appointment_preferences table
    console.log('Appointment preference to store:', preferenceRecord);
    
    // For now, just log it - you can implement database storage later if needed
    
  } catch (error) {
    console.error('Error storing appointment preference:', error);
    // Don't fail the main function for this
  }
}

/**
 * Send appointment notification email to sales team
 */
async function sendAppointmentNotification(data: {
  preferredDate?: string;
  preferredTime?: string;
  source: string;
  leadInfo?: Record<string, unknown>;
}) {
  try {
    // Format date for display
    const formattedDate = data.preferredDate 
      ? new Date(data.preferredDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'Not specified';

    // Format time preference
    const timeMap: Record<string, string> = {
      'morning': 'Morning (8:00 AM - 12:00 PM)',
      'afternoon': 'Afternoon (12:00 PM - 5:00 PM)',
      'evening': 'Evening (5:00 PM - 8:00 PM)',
      'weekend': 'Weekend (Saturday/Sunday)',
      'flexible': 'I\'m flexible with timing'
    };
    const formattedTime = data.preferredTime 
      ? (timeMap[data.preferredTime] || data.preferredTime)
      : 'Not specified';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa;">
        <h2 style="color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px;">📅 New Appointment Preference Confirmation</h2>
        
        ${data.leadInfo ? `
          <div style="background-color: #fff; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0; margin-bottom: 15px;">👤 Lead Information</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <p><strong>📝 Name:</strong> ${data.leadInfo.first_name} ${data.leadInfo.last_name}</p>
                <p><strong>📞 Phone:</strong> ${data.leadInfo.phone}</p>
                <p><strong>📧 Email:</strong> ${data.leadInfo.email}</p>
              </div>
              <div>
                <p><strong>🏠 Address:</strong><br>
                   ${data.leadInfo.street_address}<br>
                   ${data.leadInfo.city}, ${data.leadInfo.state} ${data.leadInfo.zip_code}</p>
              </div>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 15px;">
              <h4 style="margin-top: 0; color: #333;">🎯 Qualification Status</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <p><strong>⚡ Utility Company:</strong> ${data.leadInfo.utility_company}</p>
                <p><strong>🏠 Homeowner:</strong> ${data.leadInfo.homeowner_status === 'yes' ? '✅ Yes' : '❌ No'}</p>
                <p><strong>💳 Credit Score:</strong> ${data.leadInfo.credit_score}</p>
                <p><strong>🌳 Shading:</strong> ${data.leadInfo.shading === 'none' ? '✅ No Heavy Shading' : '⚠️ Heavy Shading'}</p>
              </div>
              <p><strong>📋 Status:</strong> <span style="color: ${
                (data.leadInfo.homeowner_status === 'yes' && 
                 data.leadInfo.credit_score === '650+' && 
                 data.leadInfo.shading === 'none') ? '#28a745' : '#dc3545'
              }; font-weight: bold;">
                ${(data.leadInfo.homeowner_status === 'yes' && 
                  data.leadInfo.credit_score === '650+' && 
                  data.leadInfo.shading === 'none') ? '✅ QUALIFIED' : '❌ DISQUALIFIED'}
              </span></p>
              <p><strong>📅 Form Completed:</strong> ${new Date(data.leadInfo.created_at as string).toLocaleString()}</p>
            </div>
          </div>
        ` : `
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;"><strong>⚠️ Lead Information:</strong> No recent form submission found. This may be a direct appointment confirmation.</p>
          </div>
        `}
        
        <div style="background-color: #fff; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
          <h3 style="color: #007bff; margin-top: 0; margin-bottom: 15px;">📅 Appointment Preferences</h3>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
              <div>
                <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center;">
                  <h4 style="margin: 0 0 10px 0; color: #1976d2;">📅 Preferred Date</h4>
                  <p style="margin: 0; font-size: 16px; font-weight: bold; color: #333;">${formattedDate}</p>
                </div>
              </div>
              <div>
                <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; text-align: center;">
                  <h4 style="margin: 0 0 10px 0; color: #388e3c;">🕐 Preferred Time</h4>
                  <p style="margin: 0; font-size: 16px; font-weight: bold; color: #333;">${formattedTime}</p>
                </div>
              </div>
            </div>
          </div>
          <p><strong>📍 Source:</strong> ${data.source}</p>
          <p><strong>⏰ Confirmed At:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff;">
          <p style="margin: 0; color: #004085;"><strong>🚀 Action Required:</strong> 
            ${(data.leadInfo?.homeowner_status === 'yes' && 
              data.leadInfo?.credit_score === '650+' && 
              data.leadInfo?.shading === 'none') ? 
              'This qualified lead has confirmed their appointment preferences. Contact them within 24 hours to schedule their consultation using their preferred timing.' :
              'Review the lead qualification status and appointment preferences. Follow up as appropriate based on qualification criteria.'
            }
          </p>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          Sent from your Quantum Solar website • Appointment Confirmation System<br>
          Lead ID: ${data.leadInfo?.id || 'N/A'} • Confirmed: ${new Date().toISOString()}
        </p>
      </div>
    `;

    await resend.emails.send({
      from: 'Quantum Solar <info@quantumsolar.us>',
      to: [
        'cesar@quantumsolar.us',
        // 'leads@leadrnnr.com', // Commented out for testing
        // 'doug@leadrnnr.com', // Commented out for testing
        // 'bryan@leadrnnr.com' // Commented out for testing
      ],
      subject: 'New Appointment Preferences Confirmed - Ameren Illinois Campaign',
      html: emailHtml
    });

    console.log('Appointment notification email sent successfully');

  } catch (error) {
    console.error('Error sending appointment notification email:', error);
    throw error;
  }
}

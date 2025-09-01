/**
 * Disqualified Leads API Endpoint
 * 
 * Handles email notifications for leads who get disqualified
 * during the Ameren Illinois splash form process.
 * 
 * Features:
 * - Email notification to admin about disqualified leads
 * - Database tracking of disqualification reasons
 * - TCPA compliance tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder-resend-key');

interface DisqualifiedLeadData {
  sessionId?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  utilityCompany: string;
  homeownerStatus: string;
  creditScore: string;
  shading: string;
  disqualificationReason: string;
  tcpaConsent?: boolean;
  smsConsent?: boolean;
  timestamp?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DisqualifiedLeadData = await request.json();
    console.log('Received disqualified lead data:', body);

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'phone', 'disqualificationReason'];
    const missingFields = requiredFields.filter(field => !body[field as keyof DisqualifiedLeadData]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    let savedLead;
    
    // Save or update disqualified lead in database
    if (body.sessionId) {
      try {
        // Use session-based upsert if available
        const { data, error } = await supabase.rpc('upsert_splash_lead', {
          p_session_id: body.sessionId,
          p_first_name: body.firstName || null,
          p_last_name: body.lastName || null,
          p_phone: body.phone || null,
          p_email: body.email || null,
          p_street_address: body.streetAddress || null,
          p_city: body.city || null,
          p_state: body.state || null,
          p_zip_code: body.zipCode || null,
          p_utility_company: body.utilityCompany || null,
          p_homeowner_status: body.homeownerStatus || null,
          p_credit_score: body.creditScore || null,
          p_shading: body.shading || null,
          p_is_partial: false, // Mark as complete but disqualified
          p_current_step: null,
          p_completed_at: new Date().toISOString(),
          p_tcpa_consent: body.tcpaConsent || false,
          p_sms_consent: body.smsConsent || false
        });
        
        if (error) {
          console.error('Session-based upsert error:', error);
          throw error;
        }
        
        const leadId = data;
        
        // Update the lead with disqualified status
        const { data: updatedLead, error: updateError } = await supabase
          .from('splash_leads')
          .update({ 
            status: 'disqualified',
            notes: `Disqualified: ${body.disqualificationReason}`
          })
          .eq('id', leadId)
          .select()
          .single();
          
        if (updateError) {
          console.error('Error updating lead status:', updateError);
        }
        
        savedLead = updatedLead;
        
      } catch (upsertError) {
        console.error('Upsert failed, falling back to insert:', upsertError);
        
        // Fallback to regular insert
        const leadData = {
          session_id: body.sessionId,
          first_name: body.firstName || null,
          last_name: body.lastName || null,
          phone: body.phone || null,
          email: body.email || null,
          street_address: body.streetAddress || null,
          city: body.city || null,
          state: body.state || null,
          zip_code: body.zipCode || null,
          utility_company: body.utilityCompany || null,
          homeowner_status: body.homeownerStatus || null,
          credit_score: body.creditScore || null,
          shading: body.shading || null,
          is_partial: false,
          current_step: null,
          form_type: 'ameren_illinois_splash',
          source: 'splash_page',
          completed_at: new Date().toISOString(),
          status: 'disqualified',
          notes: `Disqualified: ${body.disqualificationReason}`,
          tcpa_consent: body.tcpaConsent || false,
          sms_consent: body.smsConsent || false,
          consent_timestamp: (body.tcpaConsent || body.smsConsent) ? new Date().toISOString() : null
        };

        const { data, error } = await supabase
          .from('splash_leads')
          .insert([leadData])
          .select();

        if (error) {
          console.error('Insert error:', error);
          return NextResponse.json(
            { error: `Database error: ${error.message}` },
            { status: 500 }
          );
        }

        savedLead = data?.[0];
      }
    } else {
      // No session ID, use regular insert
      const leadData = {
        first_name: body.firstName || null,
        last_name: body.lastName || null,
        phone: body.phone || null,
        email: body.email || null,
        street_address: body.streetAddress || null,
        city: body.city || null,
        state: body.state || null,
        zip_code: body.zipCode || null,
        utility_company: body.utilityCompany || null,
        homeowner_status: body.homeownerStatus || null,
        credit_score: body.creditScore || null,
        shading: body.shading || null,
        is_partial: false,
        current_step: null,
        form_type: 'ameren_illinois_splash',
        source: 'splash_page',
        completed_at: new Date().toISOString(),
        status: 'disqualified',
        notes: `Disqualified: ${body.disqualificationReason}`,
        tcpa_consent: body.tcpaConsent || false,
        sms_consent: body.smsConsent || false,
        consent_timestamp: (body.tcpaConsent || body.smsConsent) ? new Date().toISOString() : null
      };

      const { data, error } = await supabase
        .from('splash_leads')
        .insert([leadData])
        .select();

      if (error) {
        console.error('Insert error:', error);
        return NextResponse.json(
          { error: `Database error: ${error.message}` },
          { status: 500 }
        );
      }

      savedLead = data?.[0];
    }

    // Send disqualified lead email notification
    if (savedLead) {
      try {
        await sendDisqualifiedLeadNotification(body, savedLead);
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Disqualified lead processed successfully',
      data: savedLead
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      },
      { status: 500 }
    );
  }
}

/**
 * Send email notification for disqualified leads
 */
async function sendDisqualifiedLeadNotification(leadData: DisqualifiedLeadData, savedLead: Record<string, unknown>) {
  try {
    // Build field list with only filled fields
    const filledFields: string[] = [];
    if (leadData.firstName) filledFields.push(`<strong>First Name:</strong> ${leadData.firstName}`);
    if (leadData.lastName) filledFields.push(`<strong>Last Name:</strong> ${leadData.lastName}`);
    if (leadData.phone) filledFields.push(`<strong>Phone:</strong> ${leadData.phone}`);
    if (leadData.email) filledFields.push(`<strong>Email:</strong> ${leadData.email}`);
    if (leadData.streetAddress) filledFields.push(`<strong>Address:</strong> ${leadData.streetAddress}`);
    if (leadData.city) filledFields.push(`<strong>City:</strong> ${leadData.city}`);
    if (leadData.state) filledFields.push(`<strong>State:</strong> ${leadData.state}`);
    if (leadData.zipCode) filledFields.push(`<strong>ZIP:</strong> ${leadData.zipCode}`);
    if (leadData.utilityCompany) filledFields.push(`<strong>Utility:</strong> ${leadData.utilityCompany}`);
    if (leadData.homeownerStatus) filledFields.push(`<strong>Homeowner:</strong> ${leadData.homeownerStatus}`);
    if (leadData.creditScore) filledFields.push(`<strong>Credit Score:</strong> ${leadData.creditScore}`);
    if (leadData.shading) filledFields.push(`<strong>Shading:</strong> ${leadData.shading}`);

    // Add disqualification reason
    filledFields.push(`<strong>❌ Disqualification Reason:</strong> ${leadData.disqualificationReason}`);

    // Add TCPA consent information
    const consentInfo: string[] = [];
    if (leadData.tcpaConsent !== undefined) {
      consentInfo.push(`<strong>TCPA Consent:</strong> ${leadData.tcpaConsent ? '✅ Yes' : '❌ No'}`);
    }
    if (leadData.smsConsent !== undefined) {
      consentInfo.push(`<strong>SMS Consent:</strong> ${leadData.smsConsent ? '✅ Yes' : '❌ No'}`);
    }

    const subject = `❌ Disqualified Lead - Ameren Illinois: ${leadData.firstName} ${leadData.lastName}`;

    const emailData = {
      to: process.env.NOTIFICATION_EMAIL || 'cesar@quantumsolar.us',
      subject: subject,
      html: `
        <h2>❌ Disqualified Ameren Illinois Splash Page Lead</h2>
        <p><strong>⚠️ Status:</strong> Lead disqualified during form completion</p>
        <p><strong>🚫 Reason:</strong> ${leadData.disqualificationReason}</p>
        <hr>
        <h3>Lead Information:</h3>
        ${filledFields.map(field => `<p>${field}</p>`).join('')}
        ${filledFields.length === 0 ? '<p><em>No information provided</em></p>' : ''}
        
        ${consentInfo.length > 0 ? `
        <hr>
        <h3>📋 TCPA Compliance Information:</h3>
        ${consentInfo.map(info => `<p>${info}</p>`).join('')}
        ${leadData.tcpaConsent || leadData.smsConsent ? 
          `<p><strong>Consent Timestamp:</strong> ${new Date().toLocaleString()}</p>
           <p><em>⚖️ This lead provided explicit consent before disqualification.</em></p>` :
          `<p><em>⚠️ No consent provided - follow-up must comply with TCPA regulations.</em></p>`
        }
        ` : ''}
        <hr>
        <div style="background-color: #fee; border: 1px solid #fcc; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <h4 style="color: #c33; margin: 0 0 10px 0;">⚠️ Follow-up Opportunity</h4>
          <p style="margin: 0; color: #666;">
            While this lead didn&apos;t qualify for the current Ameren Illinois promotion, they may be eligible for:
          </p>
          <ul style="margin: 10px 0; color: #666;">
            <li>Alternative financing programs</li>
            <li>Future promotions when circumstances change</li>
            <li>Referral opportunities</li>
            <li>Educational content about solar benefits</li>
          </ul>
          <p style="margin: 0; color: #666; font-style: italic;">
            Consider adding to nurture campaign if consent was provided.
          </p>
        </div>
        <hr>
        <p><small>Database ID: ${savedLead.id}</small></p>
        <p><small>Timestamp: ${new Date().toLocaleString()}</small></p>
      `
    };

    // Send email using Resend
    await resend.emails.send({
      from: 'Quantum Solar <info@quantumsolar.us>',
      to: [
        'cesar@quantumsolar.us',
        // 'leads@leadrnnr.com', // Commented out for testing
        // 'doug@leadrnnr.com', // Commented out for testing
        // 'bryan@leadrnnr.com' // Commented out for testing
      ],
      subject: emailData.subject,
      html: emailData.html
    });

    console.log('Disqualified lead email sent successfully');

  } catch (error) {
    console.error('Disqualified lead email notification error:', error);
    throw error;
  }
}

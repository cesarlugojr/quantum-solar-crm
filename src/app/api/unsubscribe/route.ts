/**
 * Unsubscribe Handler - CAN-SPAM Compliance
 *
 * Handles email unsubscribe requests.
 * CRITICAL: Required by CAN-SPAM Act (penalty: up to $43,792 for violations).
 *
 * Supports two methods:
 * 1. GET with token - Shows unsubscribe confirmation page
 * 2. POST with enrollment_id or email - Processes unsubscribe request
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
);

/**
 * Unsubscribe by enrollment ID
 */
async function unsubscribeByEnrollmentId(enrollmentId: string) {
  const { data, error } = await supabase
    .from('campaign_enrollments')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', enrollmentId)
    .select()
    .single();

  if (error) {
    console.error('Error unsubscribing enrollment:', error);
    throw new Error('Failed to process unsubscribe request');
  }

  return data;
}

/**
 * Unsubscribe all enrollments for an email address
 */
async function unsubscribeByEmail(email: string) {
  const { data, error } = await supabase
    .from('campaign_enrollments')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('email_address', email)
    .in('status', ['active', 'paused'])
    .select();

  if (error) {
    console.error('Error unsubscribing by email:', error);
    throw new Error('Failed to process unsubscribe request');
  }

  return data || [];
}

/**
 * GET handler - Show unsubscribe confirmation page
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const enrollmentId = searchParams.get('enrollment_id');
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  // TODO: Verify token for security (prevent unauthorized unsubscribes)

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Unsubscribe - Quantum Solar</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }
        .logo {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo h1 {
          color: #dc2626;
          font-size: 28px;
          font-weight: 700;
        }
        h2 {
          color: #1f2937;
          font-size: 24px;
          margin-bottom: 16px;
          text-align: center;
        }
        p {
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 24px;
          text-align: center;
        }
        form {
          margin-top: 32px;
        }
        input[type="email"] {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          margin-bottom: 16px;
          transition: border-color 0.2s;
        }
        input[type="email"]:focus {
          outline: none;
          border-color: #dc2626;
        }
        .button-group {
          display: flex;
          gap: 12px;
          flex-direction: column;
        }
        button {
          width: 100%;
          padding: 14px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary {
          background: #dc2626;
          color: white;
        }
        .btn-primary:hover {
          background: #b91c1c;
          transform: translateY(-1px);
        }
        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }
        .btn-secondary:hover {
          background: #e5e7eb;
        }
        .success {
          background: #dcfce7;
          border: 2px solid #86efac;
          border-radius: 8px;
          padding: 16px;
          margin-top: 24px;
          text-align: center;
        }
        .success h3 {
          color: #166534;
          font-size: 18px;
          margin-bottom: 8px;
        }
        .success p {
          color: #15803d;
          margin: 0;
        }
        .footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 14px;
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <h1>QUANTUM SOLAR</h1>
        </div>

        <h2>Unsubscribe from Emails</h2>
        <p>
          We're sorry to see you go. If you unsubscribe, you'll no longer receive emails about:
          <br><br>
          • Solar installation updates<br>
          • Energy savings tips<br>
          • Special promotions<br>
          • Illinois solar incentives
        </p>

        <form id="unsubscribe-form" method="POST">
          ${enrollmentId ? `<input type="hidden" name="enrollment_id" value="${enrollmentId}">` : ''}
          ${!enrollmentId ? `
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value="${email || ''}"
              required
            >
          ` : ''}

          <div class="button-group">
            <button type="submit" class="btn-primary">
              Unsubscribe
            </button>
            <a href="https://quantumsolar.us" style="text-decoration: none;">
              <button type="button" class="btn-secondary">
                Keep Me Subscribed
              </button>
            </a>
          </div>
        </form>

        <div class="footer">
          <p>
            Quantum Solar Enterprises LLC<br>
            <a href="https://quantumsolar.us" style="color: #dc2626; text-decoration: none;">quantumsolar.us</a>
          </p>
        </div>
      </div>

      <script>
        document.getElementById('unsubscribe-form').addEventListener('submit', async (e) => {
          e.preventDefault();

          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData);

          const button = e.target.querySelector('.btn-primary');
          button.textContent = 'Processing...';
          button.disabled = true;

          try {
            const response = await fetch('/api/unsubscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
              document.querySelector('.container').innerHTML = \`
                <div class="logo">
                  <h1>QUANTUM SOLAR</h1>
                </div>
                <div class="success">
                  <h3>✓ Unsubscribed Successfully</h3>
                  <p>You have been removed from our email list. You will no longer receive emails from Quantum Solar.</p>
                </div>
                <div class="footer" style="margin-top: 32px;">
                  <p>
                    Changed your mind? <a href="https://quantumsolar.us/contact" style="color: #dc2626;">Contact us</a> to resubscribe.
                  </p>
                </div>
              \`;
            } else {
              alert('Error processing your request. Please try again or contact support.');
              button.textContent = 'Unsubscribe';
              button.disabled = false;
            }
          } catch (error) {
            alert('Error processing your request. Please try again.');
            button.textContent = 'Unsubscribe';
            button.disabled = false;
          }
        });
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

/**
 * POST handler - Process unsubscribe request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enrollment_id, email } = body;

    if (!enrollment_id && !email) {
      return NextResponse.json({
        success: false,
        error: 'Either enrollment_id or email is required',
      }, { status: 400 });
    }

    let unsubscribed;

    if (enrollment_id) {
      // Unsubscribe specific enrollment
      unsubscribed = await unsubscribeByEnrollmentId(enrollment_id);
      console.log(`✓ Unsubscribed enrollment: ${enrollment_id}`);
    } else if (email) {
      // Unsubscribe all enrollments for this email
      unsubscribed = await unsubscribeByEmail(email);
      console.log(`✓ Unsubscribed ${unsubscribed.length} enrollments for ${email}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed',
      unsubscribed: Array.isArray(unsubscribed) ? unsubscribed.length : 1,
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process unsubscribe',
    }, { status: 500 });
  }
}

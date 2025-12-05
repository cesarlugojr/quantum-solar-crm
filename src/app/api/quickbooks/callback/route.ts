/**
 * QuickBooks OAuth Callback Endpoint
 *
 * Handles the OAuth callback from QuickBooks and stores tokens.
 * GET /api/quickbooks/callback
 */

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, storeTokens } from '@/lib/quickbooks';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Check for errors from QuickBooks
    const error = searchParams.get('error');
    if (error) {
      const errorDescription = searchParams.get('error_description');
      console.error('QBO OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/crm/settings?qbo_error=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }

    // Get authorization code and realm ID
    const code = searchParams.get('code');
    const realmId = searchParams.get('realmId');

    if (!code || !realmId) {
      console.error('Missing code or realmId');
      return NextResponse.redirect(
        new URL('/crm/settings?qbo_error=missing_params', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, realmId);

    // Store tokens in database
    await storeTokens(tokens);

    // Redirect to settings page with success message
    return NextResponse.redirect(
      new URL('/crm/settings?qbo_connected=true', request.url)
    );
  } catch (error) {
    console.error('Error handling QBO callback:', error);
    return NextResponse.redirect(
      new URL(`/crm/settings?qbo_error=${encodeURIComponent('Failed to complete connection')}`, request.url)
    );
  }
}

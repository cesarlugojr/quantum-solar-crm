/**
 * QuickBooks OAuth Authorization Endpoint
 *
 * Redirects user to QuickBooks for authorization.
 * GET /api/quickbooks/authorize
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAuthorizationUrl } from '@/lib/quickbooks';

export async function GET() {
  try {
    // Only allow authenticated users to connect QBO
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authUrl = getAuthorizationUrl();

    // Redirect to QuickBooks authorization
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to initiate QuickBooks connection' },
      { status: 500 }
    );
  }
}

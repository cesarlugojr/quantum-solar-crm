/**
 * QuickBooks Connection Status Endpoint
 *
 * Returns the current QuickBooks connection status.
 * GET /api/quickbooks/status
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isQBOConnected, getStoredTokens } from '@/lib/quickbooks';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connected = await isQBOConnected();
    const tokens = connected ? await getStoredTokens() : null;

    return NextResponse.json({
      connected,
      realmId: tokens?.realm_id || null,
      expiresAt: tokens?.refresh_token_expires_at || null,
    });
  } catch (error) {
    console.error('Error checking QBO status:', error);
    return NextResponse.json(
      { error: 'Failed to check QuickBooks status' },
      { status: 500 }
    );
  }
}

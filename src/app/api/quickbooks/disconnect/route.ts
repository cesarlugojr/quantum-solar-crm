/**
 * QuickBooks Disconnect Endpoint
 *
 * Disconnects the QuickBooks integration.
 * POST /api/quickbooks/disconnect
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { disconnectQBO } from '@/lib/quickbooks';

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await disconnectQBO();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting QBO:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect QuickBooks' },
      { status: 500 }
    );
  }
}

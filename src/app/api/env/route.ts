import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasResendKey: !!process.env.RESEND_API_KEY,
    keyLength: process.env.RESEND_API_KEY?.length || 0,
    timestamp: new Date().toISOString()
  });
}

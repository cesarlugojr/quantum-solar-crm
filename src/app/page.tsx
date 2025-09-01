/**
 * CRM Root Page
 * 
 * Root page for CRM-only application that handles authentication.
 * Redirects authenticated users to CRM dashboard.
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

// Force this page to be dynamic (not statically generated)
export const dynamic = 'force-dynamic';

export default async function Home() {
  console.log('🏠 ROOT PAGE: Starting home page render');
  
  try {
    const { userId } = await auth();
    console.log('🔐 ROOT PAGE: Auth check completed', { 
      hasUserId: !!userId, 
      userIdPrefix: userId ? userId.substring(0, 8) + '...' : null 
    });
    
    if (!userId) {
      console.log('❌ ROOT PAGE: No user ID found, redirecting to sign-in');
      redirect('/sign-in');
    }
    
    console.log('✅ ROOT PAGE: User authenticated, redirecting to CRM');
    redirect('/crm');
  } catch (error) {
    console.error('💥 ROOT PAGE: Error in auth check', error);
    redirect('/sign-in');
  }
}

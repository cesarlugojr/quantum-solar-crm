/**
 * CRM Root Page
 * 
 * Root page for CRM-only application that handles client-side authentication check.
 * Uses client-side redirect to avoid server-side routing conflicts.
 */

'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

export default function Home() {
  console.log('🏠 ROOT PAGE: Starting client-side home page render');
  
  const [isClient, setIsClient] = useState(false);
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (!isClient) return;
    
    console.log('🔄 ROOT PAGE: useEffect triggered', { isLoaded, hasUser: !!user });
    
    if (isLoaded) {
      if (!user) {
        console.log('❌ ROOT PAGE: No user found, redirecting to sign-in');
        router.push('/sign-in');
      } else {
        console.log('✅ ROOT PAGE: User authenticated, redirecting to CRM', {
          userEmail: user.emailAddresses[0]?.emailAddress
        });
        router.push('/crm');
      }
    }
  }, [isClient, isLoaded, user, router]);

  console.log('🏠 ROOT PAGE: Rendering loading state');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading Quantum Solar CRM...</p>
        <p className="text-gray-400 text-sm mt-2">Checking authentication status</p>
      </div>
    </div>
  );
}

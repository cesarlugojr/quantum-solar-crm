/**
 * CRM Root Page
 * 
 * Root page for CRM-only application that handles client-side authentication check.
 * Uses client-side redirect to avoid server-side routing conflicts.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

export const dynamic = 'force-dynamic';

// Dynamic import of the auth redirect component to prevent SSR issues
const AuthRedirectHandler = dynamic(() => import('@/components/AuthRedirectHandler'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading Quantum Solar CRM...</p>
        <p className="text-gray-400 text-sm mt-2">Checking authentication status</p>
      </div>
    </div>
  )
});

export default function Home() {
  console.log('🏠 ROOT PAGE: Starting client-side home page render');
  
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  console.log('🏠 ROOT PAGE: Rendering loading state');
  
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Quantum Solar CRM...</p>
          <p className="text-gray-400 text-sm mt-2">Initializing client...</p>
        </div>
      </div>
    );
  }
  
  return <AuthRedirectHandler />;
}

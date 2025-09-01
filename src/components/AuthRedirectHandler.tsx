'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function AuthRedirectHandler() {
  const { user, isLoaded } = useUser();
  
  useEffect(() => {
    console.log('🔄 AUTH HANDLER: useEffect triggered', { isLoaded, hasUser: !!user });
    
    if (isLoaded) {
      const currentPath = window.location.pathname;
      console.log('🔄 AUTH HANDLER: Current path:', currentPath);
      
      if (!user) {
        // Only redirect to sign-in if not already there
        if (currentPath !== '/sign-in') {
          console.log('❌ AUTH HANDLER: No user found, redirecting to sign-in');
          console.log('🔄 AUTH HANDLER: Attempting redirect with window.location');
          window.location.href = '/sign-in';
        } else {
          console.log('ℹ️ AUTH HANDLER: Already on sign-in page, staying here');
        }
      } else {
        // Only redirect to CRM if not already there
        if (!currentPath.startsWith('/crm')) {
          console.log('✅ AUTH HANDLER: User authenticated, redirecting to CRM', {
            userEmail: user.emailAddresses[0]?.emailAddress
          });
          console.log('🔄 AUTH HANDLER: Attempting redirect with window.location');
          window.location.href = '/crm';
        } else {
          console.log('ℹ️ AUTH HANDLER: Already in CRM, staying here');
        }
      }
    }
  }, [isLoaded, user]);

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
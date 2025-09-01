/**
 * CRM Layout
 * 
 * Dedicated layout for the CRM application with its own navigation,
 * user profile controls, and settings. Completely separate from
 * the main website navigation.
 */

"use client";

import { useEffect, useState } from 'react';
import dynamicImport from 'next/dynamic';

export const dynamic = 'force-dynamic';

// Dynamic import of the CRM layout content to prevent SSR issues
const CRMLayoutContent = dynamicImport(() => import('@/components/CRMLayoutContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading CRM...</p>
        <p className="text-gray-400 text-sm mt-2">Initializing dashboard...</p>
      </div>
    </div>
  )
});

interface CRMLayoutProps {
  children: React.ReactNode;
}

export default function CRMLayout({ children }: CRMLayoutProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading CRM...</p>
          <p className="text-gray-400 text-sm mt-2">Initializing client...</p>
        </div>
      </div>
    );
  }

  return <CRMLayoutContent>{children}</CRMLayoutContent>;
}

'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode, useEffect, useState } from 'react';

interface ConditionalClerkProviderProps {
  children: ReactNode;
}

export function ConditionalClerkProvider({ children }: ConditionalClerkProviderProps) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    console.log('🏢 CLERK PROVIDER: ConditionalClerkProvider mounted');
    console.log('🏢 CLERK PROVIDER: Environment check', {
      hasPublicKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      publicKeyPrefix: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 15),
      signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
      fallbackUrl: process.env.NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL,
      windowLocation: typeof window !== 'undefined' ? window.location.href : 'SSR',
      // More detailed environment debugging for production
      allClerkEnvs: {
        publicKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
        signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
        fallbackUrl: process.env.NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL
      }
    });
    setIsClient(true);
  }, []);
  
  // Skip ClerkProvider during build if keys are missing
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    console.log('⚠️ CLERK PROVIDER: Missing publishable key, rendering without ClerkProvider');
    return <>{children}</>;
  }

  if (!isClient) {
    console.log('🔄 CLERK PROVIDER: Still hydrating, showing children without Clerk context');
    return <div suppressHydrationWarning>{children}</div>;
  }

  console.log('✅ CLERK PROVIDER: Rendering with ClerkProvider');
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}
      signInFallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL}
      signUpFallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL}
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
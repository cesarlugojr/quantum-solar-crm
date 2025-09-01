'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

interface ConditionalClerkProviderProps {
  children: ReactNode;
}

export function ConditionalClerkProvider({ children }: ConditionalClerkProviderProps) {
  // Skip ClerkProvider during build if keys are missing
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}
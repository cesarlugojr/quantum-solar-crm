'use client';

import { usePathname } from 'next/navigation';

export function ConditionalNavigation() {
  const pathname = usePathname();

  // CRM routes have their own layout with navigation
  // No need to render navigation here
  const isCRMRoute = pathname?.startsWith('/crm');

  if (isCRMRoute) {
    return null;
  }

  // For non-CRM routes, no navigation needed (sign-in pages, etc.)
  return null;
}

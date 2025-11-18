'use client';

import { usePathname } from 'next/navigation';
import { CRMSidebar } from './CRMSidebar';

export function ConditionalNavigation() {
  const pathname = usePathname();

  // Show sidebar only for CRM routes
  const isCRMRoute = pathname?.startsWith('/crm');

  if (!isCRMRoute) {
    return null;
  }

  return <CRMSidebar />;
}

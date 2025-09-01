/**
 * CRM Root Page
 * 
 * Root page for CRM-only application that handles authentication.
 * Redirects authenticated users to CRM dashboard.
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  redirect('/crm');
}

/**
 * CRM Redirect Page
 * 
 * Redirects users to the CRM dashboard since this is now a CRM-only application.
 * This ensures that any direct access to the root URL is properly handled.
 */

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/crm');
}

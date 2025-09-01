import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define protected routes that require authentication
// Note: Root route (/) handles auth in page component to avoid redirect loops
const isProtectedRoute = createRouteMatcher([
  '/crm(.*)',
  '/api/crm(.*)',
  '/api/integrations(.*)',
]);

// Define admin-only routes (currently unused - for future implementation)
// const isAdminRoute = createRouteMatcher([
//   '/crm/admin(.*)',
//   '/api/integrations(.*)',
// ]);

// Define manager routes (currently unused - for future implementation)  
// const isManagerRoute = createRouteMatcher([
//   '/crm/admin(.*)',
//   '/api/crm/candidates(.*)',
// ]);

export default clerkMiddleware(async (auth, req) => {
  // Skip middleware during build time if Clerk keys are missing
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    return NextResponse.next();
  }

  // Only protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

// Helper function to determine user role based on email (currently unused - for future implementation)
// function getUserRole(email: string): 'admin' | 'manager' | 'sales' | 'installer' | 'user' {
//   if (!email) return 'user';
//   
//   // Admin users
//   if (email === 'cesar@quantumsolar.us' || email.includes('admin@')) return 'admin';
//   
//   // Manager users
//   if (email.includes('manager@') || email.includes('pm@')) return 'manager';
//   
//   // Sales users
//   if (email.includes('sales@')) return 'sales';
//   
//   // Installer users
//   if (email.includes('installer@') || email.includes('tech@')) return 'installer';
//   
//   // For development/testing - default authenticated users to admin
//   return 'admin';
// }

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

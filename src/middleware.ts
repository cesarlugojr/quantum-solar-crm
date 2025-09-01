import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define protected routes that require authentication
// Note: CRM pages will handle auth client-side to avoid redirect conflicts
const isProtectedRoute = createRouteMatcher([
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
  const url = req.url;
  const pathname = req.nextUrl.pathname;
  const method = req.method;
  
  console.log('🛡️ MIDDLEWARE: Request received', {
    method,
    pathname,
    url,
    hasClerkKeys: !!(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY),
    isProtected: isProtectedRoute(req),
    userAgent: req.headers.get('user-agent')?.substring(0, 50)
  });

  // Skip middleware during build time if Clerk keys are missing
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    console.log('⚠️ MIDDLEWARE: Missing Clerk keys, skipping auth');
    return NextResponse.next();
  }

  // Only protect routes that require authentication
  if (isProtectedRoute(req)) {
    console.log('🔒 MIDDLEWARE: Route is protected, checking auth');
    
    try {
      const { userId } = await auth();
      console.log('🔐 MIDDLEWARE: Auth check result', {
        hasUserId: !!userId,
        userIdPrefix: userId ? userId.substring(0, 8) + '...' : null
      });
      
      if (!userId) {
        console.log('❌ MIDDLEWARE: No user found, calling auth.protect()');
      } else {
        console.log('✅ MIDDLEWARE: User authenticated, allowing access');
      }
      
      await auth.protect();
    } catch (error) {
      console.error('💥 MIDDLEWARE: Auth error', error);
      throw error;
    }
  } else {
    console.log('🔓 MIDDLEWARE: Route not protected, allowing through');
  }

  console.log('➡️ MIDDLEWARE: Proceeding with request');
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

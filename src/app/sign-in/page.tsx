'use client';

import { SignIn, useClerk, useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export default function SignInPage() {
  const [isClient, setIsClient] = useState(false);
  const clerk = useClerk();
  const { user, isLoaded } = useUser();
  
  useEffect(() => {
    console.log('🔑 SIGN-IN PAGE: Component mounted');
    console.log('🔑 SIGN-IN PAGE: Initial state', {
      isClient: false,
      windowLocation: typeof window !== 'undefined' ? window.location.href : 'SSR',
      hasClerk: !!clerk,
      clerkLoaded: !!clerk?.loaded,
      userIsLoaded: isLoaded,
      hasUser: !!user,
      userId: user?.id
    });
    
    setIsClient(true);
  }, [clerk, isLoaded, user]);
  
  useEffect(() => {
    if (isClient) {
      const info = {
        isClient,
        windowLocation: window.location.href,
        hasClerk: !!clerk,
        clerkLoaded: !!clerk?.loaded,
        clerkClient: !!clerk?.client,
        userIsLoaded: isLoaded,
        hasUser: !!user,
        userId: user?.id,
        clerkVersion: clerk?.version || 'unknown',
        environment: {
          publicKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
          publicKeyPrefix: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 15),
          signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
          fallbackUrl: process.env.NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL
        }
      };
      
      console.log('🔑 SIGN-IN PAGE: Client state updated', info);
      
      // Log when Clerk is ready
      if (clerk) {
        console.log('🔑 SIGN-IN PAGE: Clerk instance exists', {
          loaded: clerk.loaded,
          user: clerk.user?.id,
          session: clerk.session?.id,
          client: !!clerk.client
        });
      }
    }
  }, [isClient, clerk, isLoaded, user]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (clerk) {
        console.log('🔑 SIGN-IN PAGE: Clerk status check', {
          timestamp: new Date().toISOString(),
          loaded: clerk.loaded,
          user: clerk.user?.id,
          session: clerk.session?.id,
          isSignedIn: !!clerk.user
        });
        
        // Check if Clerk elements are being rendered in DOM
        const clerkElements = document.querySelectorAll('[data-clerk-element]');
        const clerkRoot = document.querySelector('#clerk-root');
        const signInElements = document.querySelectorAll('.cl-sign-in, .cl-card, .cl-form');
        
        console.log('🔑 SIGN-IN PAGE: DOM inspection', {
          clerkElements: clerkElements.length,
          hasClerkRoot: !!clerkRoot,
          signInElements: signInElements.length,
          bodyChildren: document.body.children.length,
          signInContainer: !!document.querySelector('[class*="cl-"]')
        });
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [clerk]);
  
  // Monitor DOM changes
  useEffect(() => {
    if (!isClient) return;
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.className?.includes('cl-') || element.id?.includes('clerk')) {
                console.log('🔑 SIGN-IN PAGE: Clerk DOM element added', {
                  tagName: element.tagName,
                  className: element.className,
                  id: element.id,
                  timestamp: new Date().toISOString()
                });
              }
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id']
    });
    
    return () => observer.disconnect();
  }, [isClient]);
  
  if (!isClient) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading sign-in...</p>
          <p className="text-xs text-gray-500 mt-2">Hydrating client component...</p>
        </div>
      </div>
    );
  }
  
  console.log('🔑 SIGN-IN PAGE: Rendering main component', {
    isClient,
    hasClerk: !!clerk,
    clerkLoaded: !!clerk?.loaded,
    userIsLoaded: isLoaded,
    timestamp: new Date().toISOString()
  });
  
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Quantum Solar CRM</h1>
          <p className="text-gray-300">Sign in to access your dashboard</p>
          
          {/* Debug Information Panel */}
          <div className="mt-4 p-3 bg-gray-800 rounded text-xs text-left">
            <p className="text-yellow-400 font-bold mb-2">🐛 DEBUG INFO:</p>
            <p>Client: {isClient ? '✅' : '❌'}</p>
            <p>Clerk: {clerk ? '✅' : '❌'}</p>
            <p>Clerk Loaded: {clerk?.loaded ? '✅' : '❌'}</p>
            <p>User Loaded: {isLoaded ? '✅' : '❌'}</p>
            <p>Has User: {user ? '✅' : '❌'}</p>
            <p>Env Key: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅' : '❌'}</p>
            <p className="text-xs text-gray-400 mt-1">
              URL: {typeof window !== 'undefined' ? window.location.pathname : 'SSR'}
            </p>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          {!clerk ? (
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-yellow-400">Waiting for Clerk to initialize...</p>
            </div>
          ) : !clerk.loaded ? (
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-blue-400">Clerk loading...</p>
            </div>
          ) : (
            <div>
              <p className="text-green-400 text-sm mb-4">✅ Clerk ready, rendering SignIn component...</p>
              <SignIn 
                fallbackRedirectUrl="/crm"
                appearance={{
                  elements: {
                    card: "bg-transparent shadow-none",
                    headerTitle: "text-white",
                    headerSubtitle: "text-gray-300",
                    formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white",
                    formFieldInput: "bg-gray-800 border-gray-600 text-white",
                    formFieldLabel: "text-gray-300",
                    footerActionText: "text-gray-400",
                    footerActionLink: "text-red-400"
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

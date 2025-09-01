/**
 * Root Layout Component
 * 
 * Provides the foundational structure for all pages in the application.
 * Implements core configuration for fonts, metadata, and layout composition.
 * 
 * Architecture:
 * - Uses App Router pattern for optimal routing and rendering
 * - Implements shared navigation and footer components
 * - Maintains consistent styling and branding across all pages
 * - Provides SEO-optimized metadata configuration
 * 
 * Performance Considerations:
 * - Uses local fonts to prevent layout shifts and external requests
 * - Implements variable fonts for optimal loading and flexibility
 * - Preloads critical assets like favicons
 * - Uses antialiased text rendering for improved readability
 * 
 * Accessibility Features:
 * - Sets proper language attribute
 * - Implements smooth scrolling behavior
 * - Uses semantic HTML structure
 * - Maintains proper heading hierarchy
 * 
 * SEO Strategy:
 * - Comprehensive metadata configuration
 * - Proper favicon and app icon implementation
 * - Mobile-friendly manifest configuration
 * - Keyword-optimized descriptions
 */

import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
import { ConditionalNavigation } from "@/components/ConditionalNavigation";
import { FooterSection } from "@/components/FooterSection";
import { ConditionalClerkProvider } from "@/components/ConditionalClerkProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

/**
 * Font Configuration
 * 
 * Implements Geist font family with variable font support
 * for optimal performance and flexibility.
 * 
 * Benefits:
 * - Single file contains all weights (100-900)
 * - Reduces network requests
 * - Prevents layout shifts
 * - Improves performance metrics
 */
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  preload: true,
  display: 'swap',
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  preload: true,
  display: 'swap',
});

/**
 * Metadata Configuration
 * 
 * Comprehensive SEO and PWA configuration.
 * Implements proper favicon handling for various platforms.
 * 
 * Key Features:
 * - Descriptive title and meta description
 * - Targeted keywords for solar industry
 * - Complete favicon set for all platforms
 * - PWA manifest integration
 */
export const metadata: Metadata = {
  title: "Quantum Solar CRM | Customer Relationship Management System",
  description: "Quantum Solar CRM system for managing leads, projects, and customer relationships in the solar installation business.",
  keywords: "CRM, customer relationship management, solar CRM, lead management, project management",
  openGraph: {
    title: "Quantum Solar CRM | Customer Relationship Management System",
    description: "Quantum Solar CRM system for managing leads, projects, and customer relationships in the solar installation business.",
    type: "website",
    locale: "en_US",
    siteName: "Quantum Solar CRM",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quantum Solar CRM | Customer Relationship Management System",
    description: "Quantum Solar CRM system for managing leads, projects, and customer relationships in the solar installation business.",
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/android-chrome-192x192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/android-chrome-512x512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.json",
};

/**
 * Root Layout Component
 * 
 * Provides the base structure for all pages.
 * Implements consistent navigation and footer.
 * 
 * Features:
 * - Responsive layout structure
 * - Consistent typography
 * - Proper semantic HTML
 * - Flexible content area
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Page content to be rendered
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PJ45HCFT');`}
        </Script>

        {/* 
          Critical Resources
          - Preloads favicon for faster initial render
          - Ensures proper iOS icon handling
        */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Facebook Pixel */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '3001592626687286');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{display: 'none'}}
            src="https://www.facebook.com/tr?id=3001592626687286&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        {/* Google Analytics Event Tracking Helper */}
        <Script id="gtag-event-helper">
          {`
            function gtagSendEvent(url) {
              var callback = function () {
                if (typeof url === 'string') {
                  window.location = url;
                }
              };
              gtag('event', 'conversion_event_submit_lead_form', {
                'event_callback': callback,
                'event_timeout': 2000
              });
              return false;
            }
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-black text-white flex flex-col`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-PJ45HCFT"
            height="0" 
            width="0" 
            style={{display: 'none', visibility: 'hidden'}}
          />
        </noscript>

        {/* Google Analytics Configuration */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NZ7DNLYD0L"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-NZ7DNLYD0L');
          `}
        </Script>

        <ConditionalClerkProvider>
          {/* 
            Layout Structure
            - Navigation fixed at top
            - Main content area flexes to fill space
            - Footer anchored at bottom
          */}
          <ConditionalNavigation />
          <main className="flex-1">
            {children}
          </main>
          <FooterSection />
          <SpeedInsights />
          <Analytics />
        </ConditionalClerkProvider>
      </body>
    </html>
  );
}

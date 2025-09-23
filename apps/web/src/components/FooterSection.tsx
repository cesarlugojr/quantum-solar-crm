/**
 * FooterSection Component
 * 
 * A responsive footer component that provides copyright information and social media links.
 * Serves as the consistent bottom element across all pages of the application.
 * 
 * Design Considerations:
 * - Uses subtle background with border for visual separation
 * - Maintains consistent branding with main content
 * - Social icons use hover effects for better interaction feedback
 * - Ensures proper spacing and alignment across all screen sizes
 * 
 * Accessibility Features:
 * - Social media links include descriptive aria-labels
 * - External links properly marked with rel="noopener noreferrer"
 * - Sufficient color contrast for text visibility
 * - Interactive elements have clear hover states
 * 
 * SEO & Security:
 * - Copyright notice establishes content ownership
 * - Social links use target="_blank" with security attributes
 * - Company name properly displayed for brand consistency
 * 
 * Performance:
 * - Uses Lucide icons for optimized loading
 * - Minimal DOM structure for efficient rendering
 * - CSS transitions for smooth interactions
 */

import { Facebook, Instagram } from "lucide-react";

export function FooterSection() {
  return (
    <footer className="bg-black/90 border-t border-white/10 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4">
          {/* 
            Social Media Links Container
            - Flexbox layout for consistent spacing
            - Gap utility for equal spacing between icons
            - Centered alignment for visual balance
          */}
          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com/quantumsolarus"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors duration-200"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="https://facebook.com/qsolarenergy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors duration-200"
              aria-label="Follow us on Facebook"
            >
              <Facebook className="w-6 h-6" />
            </a>
          </div>

          {/* 
            Copyright Notice
            - Uses semantic HTML for SEO
            - Includes current year and full company name
            - Maintains readability with proper opacity
            - Inline-block for copyright symbol prevents wrapping
          */}
          <p className="text-white/70 text-center text-sm">
            <span className="inline-block">&copy;</span> 2024 Quantum Solar Enterprises, LLC. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

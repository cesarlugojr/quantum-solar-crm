/**
 * RevealOnScroll Component
 * 
 * A reusable component that adds a reveal animation to its children when they enter the viewport.
 * Uses the Intersection Observer API for performance-optimized scroll detection and
 * implements smooth CSS transitions for the reveal effect.
 * 
 * Features:
 * - Performant scroll detection using Intersection Observer
 * - Smooth fade-in and slide-up animations
 * - Automatic cleanup of observers
 * - Support for custom CSS classes
 * - TypeScript type safety
 * 
 * Performance Considerations:
 * - Uses Intersection Observer instead of scroll events for better performance
 * - Removes observer once animation is triggered to reduce memory usage
 * - Implements proper cleanup in useEffect to prevent memory leaks
 * 
 * Accessibility:
 * - Animations respect user's reduced motion preferences via CSS
 * - Non-essential animations that don't impact content understanding
 * - No impact on screen readers or keyboard navigation
 * 
 * Usage Example:
 * ```tsx
 * <RevealOnScroll>
 *   <YourComponent />
 * </RevealOnScroll>
 * ```
 */

"use client";

import React, { useEffect, useRef, ReactNode } from "react";

/**
 * RevealOnScroll Component Props
 * 
 * @property children - React nodes to be revealed on scroll
 * @property className - Optional CSS classes for customizing the animation
 */
interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
}

export function RevealOnScroll({ children, className = "" }: RevealOnScrollProps) {
  // Ref to track the container element
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Store ref value to ensure consistent cleanup
    const currentRef = ref.current;

    // Configure and create the Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When element becomes visible
          if (entry.isIntersecting) {
            // Add animation class
            entry.target.classList.add("animate-reveal");
            // Cleanup observer after animation is triggered
            observer.unobserve(entry.target);
          }
        });
      },
      {
        // Start animation when element is 10% visible
        threshold: 0.1,
        // Add negative margin to trigger animation slightly before element is in view
        rootMargin: "-50px",
      }
    );

    // Start observing the container element
    if (currentRef) {
      observer.observe(currentRef);
    }

    // Cleanup function to remove observer
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []); // Empty dependency array since we're using ref closure

  return (
    <div
      ref={ref}
      className={`
        opacity-0 
        translate-y-10 
        transition-all 
        duration-700 
        ease-out 
        ${className}
        motion-reduce:translate-y-0 
        motion-reduce:opacity-100
      `}
    >
      {children}
    </div>
  );
}

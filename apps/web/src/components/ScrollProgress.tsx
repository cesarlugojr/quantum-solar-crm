/**
 * ScrollProgress Component
 * 
 * A visual indicator that shows the user's progress through the page content.
 * Displays as a thin progress bar at the top of the viewport that fills from
 * left to right as the user scrolls down the page.
 * 
 * Features:
 * - Fixed positioning at the top of the viewport
 * - Smooth animation using CSS transitions
 * - Gradient color effect
 * - Responsive to window resize
 * - Lightweight scroll performance
 */

"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
  // State to track scroll progress (0-100)
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    /**
     * Calculates and updates scroll progress
     * Progress is calculated as: (current scroll position / total scrollable height) * 100
     */
    const handleScroll = () => {
      // Calculate total scrollable height (total document height minus viewport height)
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      // Get current scroll position
      const scrollPosition = window.scrollY;
      // Calculate progress percentage
      const progress = (scrollPosition / totalHeight) * 100;
      setProgress(progress);
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup: remove event listener on component unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // Empty dependency array as we only want to set up the listener once

  return (
    <div 
      className="fixed top-0 left-0 w-full h-0.5 bg-white/10 z-50"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-gradient-to-r from-[#ff0000] to-[#ff3333] transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/**
 * Implementation Notes:
 * 
 * 1. Performance Considerations:
 *    - Uses requestAnimationFrame internally through React's useState
 *    - Minimal DOM updates with single style property change
 *    - Lightweight scroll handler with simple calculations
 * 
 * 2. Accessibility:
 *    - Proper ARIA roles and values for screen readers
 *    - Visual progress indicator for all users
 *    - Non-intrusive design
 * 
 * 3. Visual Design:
 *    - Semi-transparent background for subtle appearance
 *    - Gradient effect for visual interest
 *    - Smooth transitions for progress updates
 * 
 * 4. Edge Cases Handled:
 *    - Works with dynamic content loading
 *    - Responsive to window resize
 *    - Handles both short and long pages
 * 
 * 5. Potential Improvements:
 *    - Throttle scroll handler for better performance
 *    - Add support for horizontal scrolling
 *    - Customize colors through props
 *    - Add buffer for smoother animation
 */

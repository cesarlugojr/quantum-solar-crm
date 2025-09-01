/**
 * Utility Functions
 * 
 * A collection of utility functions for handling common operations
 * across the application, with a focus on class name management.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Class Name Merger
 * 
 * Combines multiple class names or conditional classes while
 * intelligently handling Tailwind CSS conflicts.
 * 
 * Features:
 * - Merges multiple class strings
 * - Resolves Tailwind conflicts
 * - Handles conditional classes
 * - Supports array and object syntax
 * 
 * @param inputs - Array of class values (strings, objects, arrays)
 * @returns Merged class string with conflicts resolved
 * 
 * Usage:
 * ```tsx
 * // Basic usage
 * cn("px-4 py-2", "bg-blue-500")
 * 
 * // With conditions
 * cn("base-class", {
 *   "active-class": isActive,
 *   "disabled-class": isDisabled
 * })
 * 
 * // With Tailwind conflicts
 * cn("px-2 py-1", "p-4") // p-4 wins
 * 
 * // With dynamic values
 * cn(baseStyles, conditionalStyles, className)
 * ```
 * 
 * Implementation Details:
 * - Uses clsx for conditional class merging
 * - Uses tailwind-merge for conflict resolution
 * - Preserves class order precedence
 * - Handles undefined/null values
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

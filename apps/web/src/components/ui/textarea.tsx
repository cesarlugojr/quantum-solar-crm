/**
 * Textarea Component
 * 
 * A reusable textarea component that provides consistent styling and behavior
 * for multi-line text input. Built with accessibility and user experience in mind.
 * 
 * Key Features:
 * - Consistent styling with design system
 * - Flexible height with minimum constraint
 * - Responsive text sizing
 * - Focus state management
 * - Disabled state handling
 * - Placeholder styling
 * - Shadow and border effects
 * 
 * Accessibility:
 * - Proper focus management
 * - Clear visual states
 * - Disabled state handling
 * - Compatible with form labels
 * - Supports aria-attributes
 * 
 * Usage:
 * ```tsx
 * // Basic usage
 * <Textarea placeholder="Enter your message" />
 * 
 * // With custom styling
 * <Textarea className="custom-class" rows={6} />
 * 
 * // With form integration
 * <FormField
 *   control={form.control}
 *   name="message"
 *   render={({ field }) => (
 *     <Textarea {...field} placeholder="Your message" />
 *   )}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Textarea Component
 * 
 * A flexible textarea component that extends the native textarea element
 * with consistent styling and enhanced functionality.
 * 
 * @component
 * @param props - Standard textarea props plus optional className
 * @param ref - Forwarded ref for DOM access
 * 
 * Styling Features:
 * - Minimum height constraint
 * - Full width by default
 * - Rounded corners
 * - Consistent border
 * - Transparent background
 * - Responsive padding
 * - Shadow effects
 * - Focus ring
 * - Disabled state visual feedback
 * - Responsive text sizing
 * 
 * Implementation Details:
 * - Uses forwardRef for proper ref handling
 * - Merges provided className with base styles
 * - Preserves all native textarea attributes
 * - Implements responsive text sizing
 * - Handles disabled and focus states
 */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // Base layout
        "flex min-h-[60px] w-full",
        // Appearance
        "rounded-md border border-input bg-transparent",
        // Spacing
        "px-3 py-2",
        // Typography
        "text-base md:text-sm",
        // Effects
        "shadow-sm",
        // Placeholder
        "placeholder:text-muted-foreground",
        // Focus state
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Custom classes
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

// Display name for React DevTools
Textarea.displayName = "Textarea"

export { Textarea }

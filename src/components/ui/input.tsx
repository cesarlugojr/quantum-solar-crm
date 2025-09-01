/**
 * Input Component
 * 
 * A reusable input component that provides consistent styling and behavior
 * across the application. Built with accessibility and user experience in mind.
 * 
 * Features:
 * - Consistent styling with design system
 * - File input support with custom styling
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
 * // Basic text input
 * <Input type="text" placeholder="Enter text" />
 * 
 * // With custom styling
 * <Input className="custom-class" type="email" />
 * 
 * // File input
 * <Input type="file" accept="image/*" />
 * 
 * // Disabled state
 * <Input disabled placeholder="Cannot edit" />
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Input Component
 * 
 * A flexible input component that extends the native input element with
 * consistent styling and enhanced functionality.
 * 
 * @component
 * @param props - Standard input props plus optional className
 * @param ref - Forwarded ref for DOM access
 * 
 * Styling Features:
 * - Flexible height and width
 * - Rounded corners
 * - Consistent border
 * - Transparent background
 * - Responsive padding
 * - Shadow effects
 * - Smooth transitions
 * - Custom file input styling
 * - Focus ring
 * - Disabled state visual feedback
 * 
 * Implementation Details:
 * - Uses forwardRef for proper ref handling
 * - Merges provided className with base styles
 * - Preserves all native input attributes
 * - Implements responsive text sizing
 * - Handles various input types including file inputs
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-9 w-full rounded-md border border-input bg-transparent",
          // Padding and text
          "px-3 py-1 text-base",
          // Effects
          "shadow-sm transition-colors",
          // File input specific
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          // Placeholder
          "placeholder:text-muted-foreground",
          // Focus state
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Responsive
          "md:text-sm",
          // Custom classes
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

// Display name for React DevTools
Input.displayName = "Input"

export { Input }

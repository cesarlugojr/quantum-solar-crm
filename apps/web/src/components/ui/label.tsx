/**
 * Label Component
 * 
 * An accessible label component built with Radix UI primitives.
 * Provides consistent styling and behavior for form field labels.
 * 
 * Key Features:
 * - Built on Radix UI's label primitive
 * - Automatic association with form controls
 * - Proper cursor handling for disabled states
 * - Consistent typography and spacing
 * - Support for custom styling
 * 
 * Accessibility:
 * - Proper HTML semantics with label element
 * - Automatic for/id association with inputs
 * - Visual feedback for disabled states
 * - Maintains text contrast ratios
 * 
 * Usage:
 * ```tsx
 * // Basic usage
 * <Label htmlFor="email">Email</Label>
 * <Input id="email" type="email" />
 * 
 * // With custom styling
 * <Label className="custom-class">Name</Label>
 * 
 * // With disabled state
 * <Label htmlFor="disabled-input">Disabled Field</Label>
 * <Input id="disabled-input" disabled />
 * ```
 */

"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Label Variants
 * 
 * Defines the base styling for labels using class-variance-authority.
 * Includes styles for:
 * - Typography (size, weight, line height)
 * - Disabled state handling
 * - Peer element interactions
 */
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

/**
 * Label Component
 * 
 * A flexible label component that extends Radix UI's label primitive
 * with consistent styling and enhanced functionality.
 * 
 * @component
 * @param props - Component props including className and standard label attributes
 * @param ref - Forwarded ref for DOM access
 * 
 * Implementation Details:
 * - Uses Radix UI's label primitive for accessibility
 * - Implements class-variance-authority for styling
 * - Supports className prop for custom styling
 * - Handles disabled states through peer classes
 * - Preserves all native label attributes
 * 
 * Styling Features:
 * - Consistent text size and weight
 * - Proper line height for alignment
 * - Visual feedback for disabled states
 * - Support for custom classes
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))

// Display name for React DevTools
Label.displayName = LabelPrimitive.Root.displayName

export { Label }

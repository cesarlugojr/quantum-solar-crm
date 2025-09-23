/**
 * Button Component
 * 
 * A versatile button component built with Radix UI and class-variance-authority.
 * Supports multiple variants, sizes, and can be polymorphic through the asChild prop.
 * 
 * Features:
 * - Multiple visual variants (default, destructive, outline, etc.)
 * - Flexible sizing options
 * - Icon support with automatic sizing
 * - Keyboard focus management
 * - Disabled state handling
 * - Polymorphic rendering via asChild
 * 
 * Accessibility:
 * - Proper focus management with visible focus rings
 * - Disabled state handling with visual indicators
 * - Keyboard navigation support
 * - Maintains native button semantics
 * 
 * Usage:
 * ```tsx
 * // Default button
 * <Button>Click me</Button>
 * 
 * // Variant with size
 * <Button variant="destructive" size="lg">Delete</Button>
 * 
 * // With icon
 * <Button><Icon /> With Icon</Button>
 * 
 * // As child (polymorphic)
 * <Button asChild><Link href="/page">Link Button</Link></Button>
 * ```
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Button Variants Configuration
 * 
 * Defines the available visual styles and sizes for the button component.
 * Uses class-variance-authority for type-safe variant management.
 * 
 * Base Styles:
 * - Flex layout for content alignment
 * - Consistent text styling
 * - Focus state management
 * - Icon handling
 * - Disabled state styling
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary button style
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        // Danger/warning actions
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        // Border with transparent background
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        // Alternative button style
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        // No background until hover
        ghost: "hover:bg-accent hover:text-accent-foreground",
        // Appears as a text link
        link: "text-primary underline-offset-4 hover:underline",
      },
      // Size variations
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * Button Props Interface
 * 
 * Extends native button props with:
 * @property variant - Visual style variant
 * @property size - Button size variant
 * @property asChild - Enable polymorphic rendering
 * @property className - Additional CSS classes
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

/**
 * Button Component
 * 
 * A flexible button component that can render as a button or other elements
 * through the asChild prop. Combines variants with native button functionality.
 * 
 * @component
 * @param props - Component props including variant, size, and asChild
 * @param ref - Forwarded ref for DOM access
 * 
 * Implementation Details:
 * - Uses Radix UI Slot for polymorphic rendering
 * - Merges provided className with variant classes
 * - Forwards refs for DOM manipulation
 * - Preserves all native button attributes
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Determine final component to render
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

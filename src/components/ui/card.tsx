/**
 * Card Components
 * 
 * A set of components for creating consistent card layouts.
 * Implements a compound component pattern for flexible content organization.
 * 
 * Key Features:
 * - Compound component structure
 * - Consistent spacing and padding
 * - Flexible content areas
 * - Semantic structure
 * - Customizable styling
 * - Shadow and border effects
 * 
 * Components:
 * - Card: Main container
 * - CardHeader: Header section with title and description
 * - CardTitle: Card heading
 * - CardDescription: Supporting text
 * - CardContent: Main content area
 * - CardFooter: Action area
 * 
 * Usage:
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card description here.</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     Main content goes here
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Card Component
 * 
 * Main container component that provides the card's structure and styling.
 * 
 * Features:
 * - Rounded corners
 * - Border and shadow
 * - Background color
 * - Consistent text color
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * CardHeader Component
 * 
 * Container for card title and description.
 * Provides consistent spacing and layout.
 * 
 * Features:
 * - Flexbox layout
 * - Consistent padding
 * - Vertical spacing between elements
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * CardTitle Component
 * 
 * Main heading for the card.
 * Provides consistent typography and spacing.
 * 
 * Features:
 * - Bold font weight
 * - Tight line height
 * - Letter spacing adjustment
 */
const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * CardDescription Component
 * 
 * Supporting text that provides additional context.
 * 
 * Features:
 * - Smaller text size
 * - Muted text color
 * - Proper contrast
 */
const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * CardContent Component
 * 
 * Main content area of the card.
 * 
 * Features:
 * - Consistent padding
 * - Removed top padding for header alignment
 * - Flexible content area
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * CardFooter Component
 * 
 * Container for card actions or additional information.
 * 
 * Features:
 * - Flexbox layout for action items
 * - Consistent padding
 * - Removed top padding for content alignment
 * - Center-aligned items
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { 
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent 
}

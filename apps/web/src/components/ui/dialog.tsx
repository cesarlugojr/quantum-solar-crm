/**
 * Dialog Components
 * 
 * A comprehensive modal dialog system built with Radix UI primitives.
 * Provides accessible, animated modal dialogs with a consistent design.
 * 
 * Key Features:
 * - Built on Radix UI's dialog primitives
 * - Fully accessible modal implementation
 * - Smooth enter/exit animations
 * - Backdrop overlay with click-outside handling
 * - Responsive design
 * - Keyboard navigation support
 * - Focus management
 * 
 * Accessibility:
 * - Proper ARIA roles and attributes
 * - Focus trap within dialog
 * - Keyboard navigation (Escape to close)
 * - Screen reader announcements
 * - Focus restoration on close
 * 
 * Usage:
 * ```tsx
 * <Dialog>
 *   <DialogTrigger>Open Dialog</DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Dialog Title</DialogTitle>
 *       <DialogDescription>Dialog description here.</DialogDescription>
 *     </DialogHeader>
 *     <div>Dialog content</div>
 *     <DialogFooter>
 *       <DialogClose>Close</DialogClose>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * ```
 */

"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// Re-export primitive components
const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

/**
 * DialogOverlay Component
 * 
 * Semi-transparent backdrop that appears behind the dialog.
 * Handles click-outside behavior and provides visual focus.
 * 
 * Features:
 * - Animated fade in/out
 * - Semi-transparent background
 * - Covers entire viewport
 * - Blocks interaction with content behind
 */
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

/**
 * DialogContent Component
 * 
 * Main container for dialog content. Handles positioning,
 * animations, and close button functionality.
 * 
 * Features:
 * - Centered positioning
 * - Responsive width
 * - Complex enter/exit animations
 * - Close button
 * - Focus management
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Positioning
        "fixed left-[50%] top-[50%] z-50",
        "translate-x-[-50%] translate-y-[-50%]",
        // Layout
        "grid w-full max-w-lg gap-4",
        // Appearance
        "border bg-background p-6 shadow-lg",
        // Animation states
        "duration-200",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        // Responsive
        "sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close 
        className={cn(
          // Positioning
          "absolute right-4 top-4",
          // Appearance
          "rounded-sm opacity-70",
          // States
          "ring-offset-background",
          "transition-opacity",
          "hover:opacity-100",
          // Focus
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          // Disabled
          "disabled:pointer-events-none",
          // Open state
          "data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        )}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

/**
 * DialogHeader Component
 * 
 * Container for dialog title and description.
 * Provides consistent spacing and alignment.
 */
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

/**
 * DialogFooter Component
 * 
 * Container for dialog actions.
 * Handles responsive button layout.
 */
const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

/**
 * DialogTitle Component
 * 
 * Main heading for the dialog.
 * Provides proper semantic structure and styling.
 */
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

/**
 * DialogDescription Component
 * 
 * Supporting text for the dialog.
 * Provides additional context about the dialog's purpose.
 */
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

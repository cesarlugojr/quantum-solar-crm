/**
 * Form Components
 * 
 * A comprehensive form system built with React Hook Form and Radix UI primitives.
 * Provides type-safe form handling with accessible, reusable components.
 * 
 * Key Features:
 * - Type-safe form handling
 * - Accessible form controls
 * - Error message handling
 * - Form field descriptions
 * - Controlled inputs
 * - Context-based state management
 * 
 * Architecture:
 * - Uses React Context for form state sharing
 * - Implements compound component pattern
 * - Integrates with React Hook Form
 * - Leverages Radix UI primitives
 * 
 * Usage:
 * ```tsx
 * <Form {...form}>
 *   <FormField
 *     control={form.control}
 *     name="email"
 *     render={({ field }) => (
 *       <FormItem>
 *         <FormLabel>Email</FormLabel>
 *         <FormControl>
 *           <Input {...field} />
 *         </FormControl>
 *         <FormDescription>Enter your email address</FormDescription>
 *         <FormMessage />
 *       </FormItem>
 *     )}
 *   />
 * </Form>
 * ```
 */

"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

// Re-export FormProvider as Form for better semantics
const Form = FormProvider

/**
 * Form Field Context
 * 
 * Provides form field state and metadata to child components.
 * Enables type-safe access to field properties.
 */
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

/**
 * FormField Component
 * 
 * Connects form fields to React Hook Form's Controller.
 * Provides context for field state and validation.
 * 
 * @component
 * @template TFieldValues - Form values type
 * @template TName - Field name type
 */
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

/**
 * useFormField Hook
 * 
 * Custom hook for accessing form field context and state.
 * Provides field metadata and validation state.
 * 
 * @returns {Object} Field state and metadata
 * @throws {Error} When used outside FormField context
 */
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

/**
 * Form Item Context
 * 
 * Provides unique identifiers for form items.
 * Enables proper labeling and ARIA attributes.
 */
type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

/**
 * FormItem Component
 * 
 * Container component for form fields.
 * Provides spacing and context for field components.
 */
const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

/**
 * FormLabel Component
 * 
 * Accessible label component for form fields.
 * Integrates with form validation state.
 */
const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

/**
 * FormControl Component
 * 
 * Wrapper for form input elements.
 * Handles accessibility attributes and error states.
 */
const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

/**
 * FormDescription Component
 * 
 * Renders helper text for form fields.
 * Provides additional context or instructions.
 */
const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

/**
 * FormMessage Component
 * 
 * Displays validation errors or custom messages.
 * Integrates with form validation state.
 */
const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-[0.8rem] font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}

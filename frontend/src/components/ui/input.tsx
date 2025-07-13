import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Input wrapper variants
const inputVariants = cva(
  // Base classes for input wrapper
  "relative flex w-full",
  {
    variants: {
      size: {
        sm: "h-8",
        md: "h-10", 
        lg: "h-12",
      }
    },
    defaultVariants: {
      size: "md",
    },
  }
)

// Input field variants
const inputFieldVariants = cva(
  // Base input styling
  "flex w-full rounded-lg border bg-white px-3 py-2 text-sm text-muted-900 placeholder:text-muted-400 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        // Default input styling
        default: 
          "border-muted-300 focus-visible:border-primary-500 focus-visible:ring-primary-500",
        
        // Error state styling
        error: 
          "border-red-400 bg-red-50 focus-visible:border-red-500 focus-visible:ring-red-500",
        
        // Success state styling
        success: 
          "border-secondary-400 bg-secondary-50 focus-visible:border-secondary-500 focus-visible:ring-secondary-500",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

// Input component props
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputFieldVariants> {
  label?: string
  error?: string
  success?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  helperText?: string
  required?: boolean
}

// Main Input component
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    variant,
    size,
    type = "text",
    label,
    error,
    success,
    leftIcon,
    rightIcon,
    helperText,
    required,
    id,
    ...props 
  }, ref) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${React.useId()}`
    
    // Determine variant based on states
    const currentVariant = error ? "error" : success ? "success" : variant

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium dark:text-muted-700 text-muted-900"
            
          >
            {label}
            {required && (
              <span className="ml-1 text-red-400" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Input wrapper */}
        <div className={cn(inputVariants({ size }))}>
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input field */}
          <input
            type={type}
            id={inputId}
            ref={ref}
            className={cn(
              inputFieldVariants({ variant: currentVariant, size }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error ? `${inputId}-error` : 
              helperText ? `${inputId}-helper` : 
              undefined
            }
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p 
            id={`${inputId}-error`}
            className="text-sm text-red-400 flex items-center gap-1"
            role="alert"
          >
            <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        {/* Success message */}
        {success && (
          <p className="text-sm text-secondary-400 flex items-center gap-1">
            <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {success}
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && !success && (
          <p 
            id={`${inputId}-helper`}
            className="text-sm  text-muted-400 dark:text-muted-500"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input, inputVariants, inputFieldVariants }
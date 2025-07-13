import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Define button variants using class-variance-authority
const buttonVariants = cva(
  // Base classes - always applied
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        // Primary button - main CTAs
        primary:
          "bg-primary-600 text-white shadow-medium hover:bg-primary-700 hover:shadow-hard",
        // Secondary button - less emphasis
        secondary:
          "bg-secondary-600 text-white shadow-medium hover:bg-secondary-700 hover:shadow-hard",
        // Outline button - subtle actions
        outline:
          "border-2 border-primary-300 bg-transparent text-primary-700 hover:bg-primary-50 hover:border-primary-400",
        // Ghost button - minimal styling
        ghost:
          "bg-transparent text-muted-700 hover:bg-muted-100 hover:text-muted-900",
        // Destructive button - dangerous actions
        destructive:
          "bg-red-600 text-white shadow-medium hover:bg-red-700 hover:shadow-hard",
        // Success button - positive actions
        success:
          "bg-secondary-600 text-white shadow-medium hover:bg-secondary-700 hover:shadow-hard",
      },
      size: {
        // Different button sizes
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        // Icon-only buttons
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      loading: {
        true: "cursor-not-allowed",
        false: "",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      loading: false,
    },
  }
)

// Loading spinner component
const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg
    className={cn("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

// Button component interface
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

// Main Button component
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className,
    variant,
    size,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, loading, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {/* Left icon */}
        {leftIcon && !loading && (
          <span className="mr-2 -ml-1">
            {leftIcon}
          </span>
        )}
        
        {/* Loading spinner */}
        {loading && (
          <LoadingSpinner className="mr-2 h-4 w-4" />
        )}
        
        {/* Button text */}
        {children}
        
        {/* Right icon */}
        {rightIcon && !loading && (
          <span className="ml-2 -mr-1">
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
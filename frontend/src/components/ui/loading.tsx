import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Loading spinner variants
const loadingVariants = cva(
  "animate-spin",
  {
    variants: {
      size: {
        xs: "h-3 w-3",
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
        "2xl": "h-16 w-16",
      },
      variant: {
        default: "text-muted-600",
        primary: "text-primary-600",
        secondary: "text-secondary-600", 
        white: "text-white",
        muted: "text-muted-400",
      }
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

// Loading container variants
const loadingContainerVariants = cva(
  "flex items-center justify-center",
  {
    variants: {
      fullHeight: {
        true: "min-h-screen",
        false: "",
      },
      padding: {
        none: "",
        sm: "p-2",
        md: "p-4",
        lg: "p-8",
        xl: "p-12",
      }
    },
    defaultVariants: {
      fullHeight: false,
      padding: "md",
    },
  }
)

// Loading component props
export interface LoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants>,
    VariantProps<typeof loadingContainerVariants> {
  text?: string
  description?: string
  showBackground?: boolean
}

// Main Loading component
const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ 
    className,
    size,
    variant,
    fullHeight,
    padding,
    text,
    description,
    showBackground = false,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          loadingContainerVariants({ fullHeight, padding }),
          showBackground && "bg-white/80 backdrop-blur-sm",
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner */}
          <svg
            className={cn(loadingVariants({ size, variant }))}
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

          {/* Text */}
          {text && (
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-muted-700">{text}</p>
              {description && (
                <p className="text-xs text-muted-500">{description}</p>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
)

// Inline loading spinner (for buttons, etc.)
export interface LoadingSpinnerProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof loadingVariants> {}

const LoadingSpinner = React.forwardRef<SVGSVGElement, LoadingSpinnerProps>(
  ({ className, size, variant, ...props }, ref) => (
    <svg
      ref={ref}
      className={cn(loadingVariants({ size, variant }), className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
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
)

// Loading dots animation
export interface LoadingDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "primary" | "secondary" | "white"
}

const LoadingDots = React.forwardRef<HTMLDivElement, LoadingDotsProps>(
  ({ className, size = "md", variant = "default", ...props }, ref) => {
    const dotSizes = {
      sm: "w-1 h-1",
      md: "w-2 h-2", 
      lg: "w-3 h-3",
    }

    const dotColors = {
      default: "bg-muted-600",
      primary: "bg-primary-600",
      secondary: "bg-secondary-600",
      white: "bg-white",
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center space-x-1", className)}
        {...props}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full animate-pulse",
              dotSizes[size],
              dotColors[variant]
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: "1.4s",
            }}
          />
        ))}
      </div>
    )
  }
)

// Loading overlay (for covering content)
export interface LoadingOverlayProps extends LoadingProps {
  isVisible?: boolean
  zIndex?: number
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ 
    className,
    isVisible = true,
    zIndex = 50,
    size = "lg",
    variant = "primary",
    text = "Loading...",
    ...props 
  }, ref) => {
    if (!isVisible) return null

    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center",
          className
        )}
        style={{ zIndex }}
        {...props}
      >
        <Loading
          size={size}
          variant={variant}
          text={text}
          padding="lg"
          {...props}
        />
      </div>
    )
  }
)

// Loading skeleton for content placeholders
export interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number
  height?: string | number
  rounded?: boolean
  lines?: number
}

const LoadingSkeleton = React.forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  ({ 
    className,
    width = "100%",
    height = "1rem",
    rounded = false,
    lines = 1,
    ...props 
  }, ref) => {
    if (lines > 1) {
      return (
        <div ref={ref} className={cn("space-y-2", className)} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "animate-pulse bg-muted-200",
                rounded ? "rounded-full" : "rounded"
              )}
              style={{
                width: i === lines - 1 ? "75%" : width,
                height,
              }}
            />
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse bg-muted-200",
          rounded ? "rounded-full" : "rounded",
          className
        )}
        style={{ width, height }}
        {...props}
      />
    )
  }
)

// Loading progress bar
export interface LoadingProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  progress?: number // 0-100
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "error"
  size?: "sm" | "md" | "lg"
  showPercentage?: boolean
  indeterminate?: boolean
}

const LoadingProgress = React.forwardRef<HTMLDivElement, LoadingProgressProps>(
  ({ 
    className,
    progress = 0,
    variant = "primary",
    size = "md",
    showPercentage = false,
    indeterminate = false,
    ...props 
  }, ref) => {
    const heights = {
      sm: "h-1",
      md: "h-2",
      lg: "h-3",
    }

    const colors = {
      default: "bg-muted-600",
      primary: "bg-primary-600",
      secondary: "bg-secondary-600",
      success: "bg-secondary-600",
      warning: "bg-yellow-500",
      error: "bg-red-600",
    }

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {showPercentage && !indeterminate && (
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-muted-600">Progress</span>
            <span className="text-sm text-muted-600">{Math.round(progress)}%</span>
          </div>
        )}
        
        <div className={cn("w-full bg-muted-200 rounded-full overflow-hidden", heights[size])}>
          <div
            className={cn(
              "h-full transition-all duration-300 ease-out",
              colors[variant],
              indeterminate && "animate-pulse"
            )}
            style={{
              width: indeterminate ? "100%" : `${Math.min(Math.max(progress, 0), 100)}%`,
            }}
          />
        </div>
      </div>
    )
  }
)

// Set display names
Loading.displayName = "Loading"
LoadingSpinner.displayName = "LoadingSpinner"
LoadingDots.displayName = "LoadingDots"
LoadingOverlay.displayName = "LoadingOverlay"
LoadingSkeleton.displayName = "LoadingSkeleton"
LoadingProgress.displayName = "LoadingProgress"

export { 
  Loading, 
  LoadingSpinner, 
  LoadingDots, 
  LoadingOverlay, 
  LoadingSkeleton,
  LoadingProgress,
  loadingVariants 
}
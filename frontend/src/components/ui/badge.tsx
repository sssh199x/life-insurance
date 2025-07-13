import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Badge variants
const badgeVariants = cva(
  // Base badge styling
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Default badge
        default:
          "border-transparent bg-muted-900 text-muted-50 shadow-soft hover:bg-muted-800",
        
        // Primary brand color
        primary:
          "border-transparent bg-primary-600 text-primary-50 shadow-soft hover:bg-primary-700",
        
        // Secondary/success color
        secondary:
          "border-transparent bg-secondary-600 text-secondary-50 shadow-soft hover:bg-secondary-700",
        
        // Success state
        success:
          "border-transparent bg-secondary-600 text-secondary-50 shadow-soft hover:bg-secondary-700",
        
        // Warning state
        warning:
          "border-transparent bg-yellow-500 text-yellow-50 shadow-soft hover:bg-yellow-600",
        
        // Error/danger state
        destructive:
          "border-transparent bg-red-600 text-red-50 shadow-soft hover:bg-red-700",
        
        // Outline variants
        outline:
          "border border-muted-300 bg-transparent text-muted-700 hover:bg-muted-100",
        
        "outline-primary":
          "border border-primary-300 bg-transparent text-primary-700 hover:bg-primary-50",
        
        "outline-secondary":
          "border border-secondary-300 bg-transparent text-secondary-700 hover:bg-secondary-50",
        
        "outline-success":
          "border border-secondary-300 bg-transparent text-secondary-700 hover:bg-secondary-50",
        
        "outline-warning":
          "border border-yellow-300 bg-transparent text-yellow-700 hover:bg-yellow-50",
        
        "outline-destructive":
          "border border-red-300 bg-transparent text-red-700 hover:bg-red-50",
        
        // Ghost variants
        ghost:
          "bg-muted-100 text-muted-700 hover:bg-muted-200",
        
        "ghost-primary":
          "bg-primary-100 text-primary-700 hover:bg-primary-200",
        
        "ghost-secondary":
          "bg-secondary-100 text-secondary-700 hover:bg-secondary-200",
        
        "ghost-success":
          "bg-secondary-100 text-secondary-700 hover:bg-secondary-200",
        
        "ghost-warning":
          "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
        
        "ghost-destructive":
          "bg-red-100 text-red-700 hover:bg-red-200",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs", 
        lg: "px-3 py-1 text-sm",
        xl: "px-4 py-1.5 text-sm",
      },
      shape: {
        default: "rounded-full",
        square: "rounded-md",
        pill: "rounded-full",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      shape: "default",
    },
  }
)

// Badge component props
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  removable?: boolean
  onRemove?: () => void
}

// Main Badge component
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ 
    className, 
    variant, 
    size, 
    shape,
    leftIcon,
    rightIcon,
    removable,
    onRemove,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, shape }), className)}
        {...props}
      >
        {/* Left icon */}
        {leftIcon && (
          <span className="mr-1 -ml-0.5">
            {leftIcon}
          </span>
        )}
        
        {/* Badge content */}
        <span>{children}</span>
        
        {/* Right icon */}
        {rightIcon && !removable && (
          <span className="ml-1 -mr-0.5">
            {rightIcon}
          </span>
        )}
        
        {/* Remove button */}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 -mr-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Remove"
          >
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    )
  }
)

// Confidence Score Badge
export interface ConfidenceBadgeProps extends Omit<BadgeProps, 'children'> {
  score: number // 0.0 to 1.0
  showPercentage?: boolean
}

const ConfidenceBadge = React.forwardRef<HTMLDivElement, ConfidenceBadgeProps>(
  ({ score, showPercentage = true, className, ...props }, ref) => {
    // Determine variant based on confidence score
    const getVariantByScore = (score: number) => {
      if (score >= 0.8) return "success"
      if (score >= 0.6) return "warning" 
      return "destructive"
    }

    // Format score as percentage
    const percentage = Math.round(score * 100)
    const displayText = showPercentage ? `${percentage}%` : percentage.toString()

    return (
      <Badge
        ref={ref}
        variant={getVariantByScore(score)}
        className={cn("font-semibold", className)}
        leftIcon={
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        }
        {...props}
      >
        {displayText} Confidence
      </Badge>
    )
  }
)

// Status Badge (for insurance types, etc)
export interface StatusBadgeProps extends Omit<BadgeProps, 'children'> {
  status: "active" | "inactive" | "pending" | "approved" | "rejected" | "processing"
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, className, ...props }, ref) => {
    const statusConfig = {
      active: { variant: "success" as const, text: "Active", icon: "●" },
      inactive: { variant: "ghost" as const, text: "Inactive", icon: "○" },
      pending: { variant: "warning" as const, text: "Pending", icon: "⏳" },
      approved: { variant: "success" as const, text: "Approved", icon: "✓" },
      rejected: { variant: "destructive" as const, text: "Rejected", icon: "✗" },
      processing: { variant: "primary" as const, text: "Processing", icon: "⟳" },
    }

    const config = statusConfig[status]

    return (
      <Badge
        ref={ref}
        variant={config.variant}
        className={className}
        {...props}
      >
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </Badge>
    )
  }
)

// Insurance Type Badge
export interface InsuranceTypeBadgeProps extends Omit<BadgeProps, 'children'> {
  type: "term_life" | "whole_life" | "universal_life"
}

const InsuranceTypeBadge = React.forwardRef<HTMLDivElement, InsuranceTypeBadgeProps>(
  ({ type, className, ...props }, ref) => {
    const typeConfig = {
      term_life: { 
        variant: "primary" as const, 
        text: "Term Life",
        icon: (
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      },
      whole_life: { 
        variant: "secondary" as const, 
        text: "Whole Life",
        icon: (
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
          </svg>
        )
      },
      universal_life: { 
        variant: "outline-primary" as const, 
        text: "Universal Life",
        icon: (
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        )
      },
    }

    const config = typeConfig[type]

    return (
      <Badge
        ref={ref}
        variant={config.variant}
        className={cn("font-medium", className)}
        leftIcon={config.icon}
        {...props}
      >
        {config.text}
      </Badge>
    )
  }
)

// Set display names
Badge.displayName = "Badge"
ConfidenceBadge.displayName = "ConfidenceBadge"
StatusBadge.displayName = "StatusBadge"
InsuranceTypeBadge.displayName = "InsuranceTypeBadge"

export { 
  Badge, 
  ConfidenceBadge, 
  StatusBadge, 
  InsuranceTypeBadge, 
  badgeVariants 
}
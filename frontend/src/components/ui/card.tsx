import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Card variants
const cardVariants = cva(
  // Base card styling
  "rounded-xl border bg-white text-muted-950 transition-all duration-200",
  {
    variants: {
      variant: {
        // Default card with subtle border
        default: 
          "border-muted-200 shadow-soft",
        
        // Elevated card with more shadow
        elevated: 
          "border-muted-200 shadow-medium hover:shadow-hard",
        
        // Interactive card (clickable/hoverable)
        interactive: 
          "border-muted-200 shadow-soft hover:shadow-medium hover:border-muted-300 cursor-pointer hover:-translate-y-0.5",
        
        // Outline only (no shadow)
        outline: 
          "border-muted-300",
        
        // Ghost card (no border, subtle background)
        ghost: 
          "border-transparent bg-muted-50",
        
        // Success variant
        success: 
          "border-secondary-200 bg-secondary-50 shadow-soft",
        
        // Warning variant
        warning: 
          "border-yellow-200 bg-yellow-50 shadow-soft",
        
        // Error variant  
        error: 
          "border-red-200 bg-red-50 shadow-soft",
      },
      size: {
        sm: "p-4",
        md: "p-6", 
        lg: "p-8",
        xl: "p-10",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

// Card component props
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

// Main Card component
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, size }), className)}
      {...props}
    />
  )
)

// Card Header component
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
))

// Card Title component
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight text-xl", className)}
    {...props}
  >
    {children}
  </h3>
))

// Card Description component
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-500 leading-relaxed", className)}
    {...props}
  />
))

// Card Content component
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("pt-0", className)} 
    {...props} 
  />
))

// Card Footer component
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-6", className)}
    {...props}
  />
))

// Card with Icon component (for special use cases)
export interface CardWithIconProps extends CardProps {
  icon?: React.ReactNode
  iconColor?: "primary" | "secondary" | "success" | "warning" | "error"
}

const CardWithIcon = React.forwardRef<HTMLDivElement, CardWithIconProps>(
  ({ className, variant, size, icon, iconColor = "primary", children, ...props }, ref) => {
    const iconColorClasses = {
      primary: "text-primary-600 bg-primary-100",
      secondary: "text-secondary-600 bg-secondary-100", 
      success: "text-secondary-600 bg-secondary-100",
      warning: "text-yellow-600 bg-yellow-100",
      error: "text-red-600 bg-red-100",
    }

    return (
      <Card 
        ref={ref}
        variant={variant}
        size={size}
        className={cn("relative", className)}
        {...props}
      >
        {icon && (
          <div className={cn(
            "inline-flex h-12 w-12 items-center justify-center rounded-lg mb-4",
            iconColorClasses[iconColor]
          )}>
            {icon}
          </div>
        )}
        {children}
      </Card>
    )
  }
)

// Stats Card component (for metrics display)
export interface StatsCardProps extends Omit<CardProps, 'children'> {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  icon?: React.ReactNode
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ className, variant = "elevated", title, value, description, trend, icon, ...props }, ref) => (
    <Card
      ref={ref}
      variant={variant}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription className="text-xs font-medium uppercase tracking-wide">
          {title}
        </CardDescription>
        {icon && (
          <div className="text-muted-400">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-muted-900">{value}</div>
        {description && (
          <p className="text-xs text-muted-500 mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span className={cn(
              "inline-flex items-center text-xs font-medium",
              trend.isPositive ? "text-secondary-600" : "text-red-600"
            )}>
              {trend.isPositive ? (
                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414 6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {trend.value}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
)

// Set display names
Card.displayName = "Card"
CardHeader.displayName = "CardHeader"
CardFooter.displayName = "CardFooter"
CardTitle.displayName = "CardTitle"
CardDescription.displayName = "CardDescription"
CardContent.displayName = "CardContent"
CardWithIcon.displayName = "CardWithIcon"
StatsCard.displayName = "StatsCard"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardWithIcon,
  StatsCard,
  cardVariants
}
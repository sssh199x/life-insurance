'use client'

import React from 'react'
import { Card, CardContent, Badge } from '@/components/ui'
import { STEPS_DATA, type StepData } from '@/lib/constants/app-data'

// Individual step component props
interface StepCardProps {
  step: StepData
  index: number
  isAnimated?: boolean
  className?: string
}

// Step card component
function StepCard({ step, index, isAnimated = true, className = "" }: StepCardProps) {
  return (
    <Card 
      variant="elevated" 
      className={`text-center group ${isAnimated ? 'hover:scale-105 transition-all duration-300' : ''} ${className}`}
      style={isAnimated ? { animationDelay: `${index * 150}ms` } : undefined}
    >
      <CardContent className="pt-8 pb-6">
        <div className="space-y-4">
          {/* Step Icon */}
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${step.color}-100 text-${step.color}-600 mb-4 group-hover:scale-110 transition-transform duration-300`}>
            {step.icon}
          </div>
          
          {/* Step Number */}
          <div className="text-sm font-bold dark:text-muted-700 text-muted-900 tracking-widest">
            STEP {step.number}
          </div>
          
          {/* Step Title */}
          <h3 className="text-xl font-bold dark:text-muted-700 text-muted-900">
            {step.title}
          </h3>
          
          {/* Step Description */}
          <p 
            className="dark:text-muted-700 text-muted-900 leading-relaxed text-sm md:text-base" 
            style={{ opacity: 0.7 }}
          >
            {step.description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Section component props
interface HowItWorksSectionProps {
  /**
   * Custom steps data (falls back to default if not provided)
   */
  steps?: StepData[]
  
  /**
   * Section title
   * @default "Three Simple Steps to Protection"
   */
  title?: string
  
  /**
   * Section description
   * @default Default description
   */
  description?: string
  
  /**
   * Badge text above the title
   * @default "How It Works"
   */
  badgeText?: string
  
  /**
   * Whether to show step animations
   * @default true
   */
  showAnimations?: boolean
  
  /**
   * Custom class name for the section
   */
  className?: string
  
  /**
   * Custom background styling
   * @default "py-24 bg-muted-50 dark:bg-muted-950"
   */
  backgroundClassName?: string
  
  /**
   * Grid layout configuration
   * @default "grid-cols-1 md:grid-cols-3"
   */
  gridClassName?: string
}

/**
 * How It Works section component showing the process steps
 */
export function HowItWorksSection({
  steps = STEPS_DATA,
  title = "Three Simple Steps to Protection",
  description = "Our streamlined process makes getting life insurance as easy as ordering coffee. No lengthy applications or confusing jargon.",
  badgeText = "How It Works",
  showAnimations = true,
  className = "",
  backgroundClassName = "py-24 bg-muted-50 dark:bg-muted-950",
  gridClassName = "grid-cols-1 md:grid-cols-3"
}: HowItWorksSectionProps) {
  
  return (
    <section className={`${backgroundClassName} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="border-primary-200 text-primary-700">
            {badgeText}
          </Badge>
          
          <h2 className="text-4xl font-bold" style={{ color: 'var(--foreground)' }}>
            {title}
          </h2>
          
          <p 
            className="text-lg max-w-2xl mx-auto leading-relaxed" 
            style={{ color: 'var(--foreground)', opacity: 0.7 }}
          >
            {description}
          </p>
        </div>

        {/* Steps Grid */}
        <div className={`grid ${gridClassName} gap-8`}>
          {steps.map((step, index) => (
            <StepCard
              key={step.number}
              step={step}
              index={index}
              isAnimated={showAnimations}
            />
          ))}
        </div>
        
        {/* Optional connecting lines between steps (for desktop) */}
        {showAnimations && steps.length > 1 && (
          <div className="hidden md:block relative -mt-32 mb-16 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex space-x-32">
                {steps.slice(0, -1).map((_, index) => (
                  <div 
                    key={index}
                    className="w-16 h-0.5 bg-gradient-to-r from-primary-200 to-primary-300 opacity-30"
                    style={{ 
                      animationDelay: `${(index + 1) * 300}ms`,
                      animation: showAnimations ? 'fadeIn 0.6s ease-in-out forwards' : undefined 
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * Compact version of How It Works section
 */
export function CompactHowItWorksSection({
  steps = STEPS_DATA,
  title = "How It Works",
  className = ""
}: Pick<HowItWorksSectionProps, 'steps' | 'title' | 'className'>) {
  return (
    <HowItWorksSection
      steps={steps}
      title={title}
      description="" // No description in compact version
      backgroundClassName="py-16 bg-white dark:bg-black"
      gridClassName="grid-cols-1 sm:grid-cols-3"
      showAnimations={false}
      className={className}
    />
  )
}

/**
 * Horizontal layout version for wide screens
 */
export function HorizontalHowItWorksSection({
  steps = STEPS_DATA,
  className = ""
}: Pick<HowItWorksSectionProps, 'steps' | 'className'>) {
  return (
    <HowItWorksSection
      steps={steps}
      backgroundClassName="py-32 bg-gradient-to-br from-muted-50 to-primary-50 dark:from-muted-950 dark:to-muted-900"
      gridClassName="grid-cols-1 lg:grid-cols-3"
      showAnimations={true}
      className={className}
    />
  )
}

/**
 * Minimal version without cards - just icons and text
 */
export function MinimalHowItWorksSection({
  steps = STEPS_DATA,
  className = ""
}: Pick<HowItWorksSectionProps, 'steps' | 'className'>) {
  return (
    <div className={`py-8 ${className}`}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={step.number} className="text-center space-y-2">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-${step.color}-100 text-${step.color}-600`}>
                {step.icon}
              </div>
              <h4 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                {step.title}
              </h4>
              <p 
                className="text-xs leading-relaxed" 
                style={{ color: 'var(--foreground)', opacity: 0.6 }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Custom hook for managing step animations
export function useStepAnimations(stepCount: number, enabled: boolean = true) {
  const [visibleSteps, setVisibleSteps] = React.useState<number[]>([])
  
  React.useEffect(() => {
    if (!enabled) {
      setVisibleSteps(Array.from({ length: stepCount }, (_, i) => i))
      return
    }
    
    // Animate steps in sequence
    const timeouts: NodeJS.Timeout[] = []
    
    for (let i = 0; i < stepCount; i++) {
      const timeout = setTimeout(() => {
        setVisibleSteps(prev => [...prev, i])
      }, i * 200)
      timeouts.push(timeout)
    }
    
    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [stepCount, enabled])
  
  return visibleSteps
}

// Default export
export default HowItWorksSection
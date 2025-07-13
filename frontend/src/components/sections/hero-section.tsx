'use client'

import React from 'react'
import { ArrowRight, Zap, Lock, Heart } from 'lucide-react'
import { Button, Badge, LoadingDots } from '@/components/ui'
import { useSimpleApiStatus } from '@/hooks/use-api-status'

// Component props interface
interface HeroSectionProps {
  /**
   * Callback when "Get Started" button is clicked
   */
  onGetStartedClick: () => void
  
  /**
   * Optional custom delay for API status check
   * @default 500
   */
  apiCheckDelay?: number
  
  /**
   * Whether to show API status indicator
   * @default true
   */
  showApiStatus?: boolean
  
  /**
   * Custom class name for the section
   */
  className?: string
}

/**
 * Hero section component with API status indicator and call-to-action
 */
export function HeroSection({ 
  onGetStartedClick, 
  apiCheckDelay = 500,
  showApiStatus = true,
  className = ""
}: HeroSectionProps) {
  // Use custom hook for API status
  const { status, statusMessage, statusColor } = useSimpleApiStatus(apiCheckDelay)

  // Key benefits data
  const keyBenefits = [
    {
      icon: <Zap className="w-4 h-4 mr-2" />,
      text: "3-minute quotes",
      color: "border-primary-200 text-primary-700"
    },
    {
      icon: <Lock className="w-4 h-4 mr-2" />,
      text: "Bank-level security", 
      color: "border-secondary-200 text-secondary-700"
    },
    {
      icon: <Heart className="w-4 h-4 mr-2" />,
      text: "No medical exam needed",
      color: "border-primary-200 text-primary-700"
    }
  ]

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-muted-950 dark:via-black dark:to-muted-900 ${className}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-muted-200/20 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center space-y-8">
          
          {/* API Status Indicator */}
          {showApiStatus && (
            <div className="flex justify-center">
              <div className="flex items-center space-x-2 bg-white/80 dark:bg-muted-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-muted-200 dark:border-muted-700">
                {status === 'checking' ? (
                  <LoadingDots size="md" variant="primary" />
                ) : (
                  <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                )}
                <span 
                  className="text-sm font-medium" 
                  style={{ color: 'var(--foreground)', opacity: 0.8 }}
                >
                  {statusMessage}
                </span>
              </div>
            </div>
          )}

          {/* Main headline */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
              Life Insurance
              <span className="block text-primary-600">Made Simple</span>
            </h1>
            <p 
              className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed" 
              style={{ color: 'var(--foreground)', opacity: 0.7 }}
            >
              Get personalized recommendations in minutes with our AI-powered platform. 
              No complicated forms, no sales pressure, just smart coverage for your life.
            </p>
          </div>

          {/* Key benefits */}
          <div className="flex flex-wrap justify-center gap-4">
            {keyBenefits.map((benefit, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className={`px-4 py-2 ${benefit.color}`}
              >
                {benefit.icon}
                {benefit.text}
              </Badge>
            ))}
          </div>

          {/* Call-to-Action */}
          <div className="pt-4">
            <Button 
              size="xl" 
              className="px-8 py-4 text-lg group hover:scale-105 transition-transform duration-200"
              onClick={onGetStartedClick}
              aria-label="Get personalized life insurance quote"
            >
              Get My Free Quote
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
            <p 
              className="text-sm mt-2" 
              style={{ color: 'var(--foreground)', opacity: 0.6 }}
            >
              No email required • Results in 3 minutes • Always free
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Simplified hero section without API status indicator
 * Useful for landing pages or when API status is not relevant
 */
export function SimpleHeroSection({ 
  onGetStartedClick,
  className = ""
}: Pick<HeroSectionProps, 'onGetStartedClick' | 'className'>) {
  return (
    <HeroSection 
      onGetStartedClick={onGetStartedClick}
      showApiStatus={false}
      className={className}
    />
  )
}

/**
 * Hero section with custom API check delay
 * Useful when you want to control the timing of status checks
 */
export function DelayedHeroSection({
  onGetStartedClick,
  delay = 1000,
  className = ""
}: Pick<HeroSectionProps, 'onGetStartedClick' | 'className'> & { delay?: number }) {
  return (
    <HeroSection 
      onGetStartedClick={onGetStartedClick}
      apiCheckDelay={delay}
      className={className}
    />
  )
}

// Default export
export default HeroSection
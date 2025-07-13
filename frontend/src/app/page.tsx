'use client'

import React, { useState, useEffect } from 'react'
import { Shield, TrendingUp } from 'lucide-react'

// Extracted Section Components
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HeroSection } from '@/components/sections/hero-section'
import { HowItWorksSection } from '@/components/sections/how-it-works-section'
import {StatsSection} from '@/components/sections/stats-section'
import { DemoSection } from '@/components/sections/demo-section'

// Core Feature Components
import { InsuranceForm } from '@/components/insurance-form'
import { RecommendationCard } from '@/components/recommendation-card'

// UI Components
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Button,
  Badge
} from '@/components/ui'

// Custom Hooks
import { useLocalStorage } from '@/hooks/use-local-storage'
import { usePageScroll } from '@/hooks/use-smooth-scroll'

// Types
import type { ProcessedRecommendation } from '@/lib/types'

/**
 * Main InsureWise application page
 */
export default function InsureWisePage() {
  // State for recommendation flow
  const [currentRecommendation, setCurrentRecommendation] = useState<ProcessedRecommendation | null>(null)
  const [showRecommendation, setShowRecommendation] = useState(false)
  
  // Custom hooks for functionality
  const { 
    lastRecommendation, 
    saveRecommendation, 
    hasStoredData, 
    isLoaded,
    sessionId 
  } = useLocalStorage()
  
  const { scrollToForm, scrollToResults } = usePageScroll()

  // Load previous recommendation on mount
  useEffect(() => {
    if (isLoaded && lastRecommendation && !currentRecommendation) {
      setCurrentRecommendation(lastRecommendation)
      setShowRecommendation(true)
    }
  }, [isLoaded, lastRecommendation, currentRecommendation])

  // Handle new recommendation received
  const handleRecommendationReceived = (recommendation: ProcessedRecommendation) => {
    setCurrentRecommendation(recommendation)
    setShowRecommendation(true)
    saveRecommendation(recommendation)
    
    // Smooth scroll to results with delay
    setTimeout(() => scrollToResults(), 100)
  }

// Handle request for new recommendation
const handleNewRecommendation = () => {
  // Scroll first, THEN hide content
  scrollToForm()
  
  // Wait for scroll to start, then hide content
  setTimeout(() => {
    setShowRecommendation(false)
    setCurrentRecommendation(null)
  }, 300) // Wait for scroll animation to get underway
}

  // Render waiting state for results
  const renderWaitingState = () => (
    <Card variant="ghost" className="text-center py-12">
      <CardContent>
        <div className="space-y-4">
          <div className="w-24 h-24 bg-muted-100 dark:bg-muted-800 rounded-full flex items-center justify-center mx-auto">
            <TrendingUp className="w-12 h-12 text-muted-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold dark:text-muted-700 text-muted-900">
              Waiting for Your Information
            </h3>
            <p className="dark:text-muted-700 text-muted-900" style={{ opacity: 0.7 }}>
              Complete the form to see your personalized life insurance recommendation
            </p>
          </div>
          {hasStoredData && (
            <div className="pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (lastRecommendation) {
                    setCurrentRecommendation(lastRecommendation)
                    setShowRecommendation(true)
                  }
                }}
              >
                View Last Recommendation
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  // Render results section 
  const renderResultsSection = () => (
    <div id="recommendation-results" className="space-y-6">
      {showRecommendation && currentRecommendation ? (
        <RecommendationCard 
          recommendation={currentRecommendation}
          onNewRecommendation={handleNewRecommendation}
        />
      ) : (
        renderWaitingState()
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Navigation */}
      <Header />

      {/* Hero Section with API Status */}
      <HeroSection onGetStartedClick={scrollToForm} />

      {/* How It Works Process */}
      <HowItWorksSection />

      {/* Trust & Statistics */}
      <StatsSection />

      {/* Main Application Section */}
      <section className="py-24 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center space-y-4 mb-16">
            <Badge variant="primary">AI-Powered Recommendations</Badge>
            <h2 className="text-4xl font-bold" style={{ color: 'var(--foreground)' }}>
              Get Your Personalized Quote
            </h2>
            <p className="text-lg text-muted-500 max-w-2xl mx-auto" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
              Our advanced AI analyzes your unique situation to recommend the perfect life insurance coverage. 
              Complete the form below to get started.
            </p>
            
            {/* Session Information */}
            {isLoaded && (
              <div className="flex justify-center">
                <div className="bg-muted-50 dark:bg-muted-900 px-4 py-2 rounded-lg border border-muted-200 dark:border-muted-700">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span style={{ color: 'var(--foreground)', opacity: 0.8 }}>
                      Session active {hasStoredData && '• Data saved'}
                    </span>
                    <code className="bg-muted-200 dark:bg-muted-800 px-1 rounded text-xs">
                      {sessionId.slice(-8)}
                    </code>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form and Results Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
            
            {/* Insurance Form Section */}
            <div id="insurance-form" className="space-y-6">
              <div className="sticky top-8">
                <Card variant="elevated" className="shadow-medium">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Shield className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <CardTitle className="dark:text-muted-700 text-muted-900">
                          Life Insurance Calculator
                        </CardTitle>
                        <p className="text-sm dark:text-muted-700 text-muted-900" style={{ opacity: 0.7 }}>
                          Powered by AI • Secure & Private • Instant Results
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <InsuranceForm onRecommendationReceived={handleRecommendationReceived} />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Results Section */}
            {renderResultsSection()}
          </div>
        </div>
      </section>

      {/* Component Demonstrations */}
      <DemoSection />

      {/* Footer */}
      <Footer />
    </div>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import { Shield, ArrowRight, CheckCircle, Users, DollarSign, Clock, Award, Star, TrendingUp, Zap, Lock, Heart } from 'lucide-react'

// Components
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { InsuranceForm } from '@/components/insurance-form'
import { RecommendationCard } from '@/components/recommendation-card'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Button,
  Badge,
  ConfidenceBadge,
  StatusBadge,
  InsuranceTypeBadge,
  StatsCard,
  LoadingDots
} from '@/components/ui'

// Hooks and utilities
import { useLocalStorage } from '@/hooks/use-local-storage'
import {testApiConnection } from '@/lib/api'
import type { ProcessedRecommendation } from '@/lib/types'

// Page sections component
function HeroSection() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  // Check API connectivity on mount
  useEffect(() => {
    const checkApi = async () => {
      try {
        const isConnected = await testApiConnection()
        setApiStatus(isConnected ? 'online' : 'offline')
      } catch (error) {
        // Silently handle the error and set to offline
        if (process.env.NODE_ENV === 'development') {
          console.log('API connectivity check failed:', error)
        }
        setApiStatus('offline')
      }
    }
    
    // Add a small delay to prevent immediate error flash
    const timeoutId = setTimeout(checkApi, 500)
    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-muted-950 dark:via-black dark:to-muted-900">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-muted-200/20 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center space-y-8">
          
          {/* API Status Indicator */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-2 bg-white/80 dark:bg-muted-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-muted-200 dark:border-muted-700">
              {apiStatus === 'checking' ? (
                <LoadingDots size="md" variant="primary" />
              ) : (
                <div className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-green-400' : 'bg-orange-400'}`} />
              )}
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)', opacity: 0.8 }}>
                {apiStatus === 'checking' ? 'Connecting to AI engine...' : 
                 apiStatus === 'online' ? 'AI recommendation engine online' : 
                 'Demo mode - Limited functionality'}
              </span>
            </div>
          </div>

          {/* Main headline */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
              Life Insurance
              <span className="block text-primary-600">Made Simple</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-400 max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
              Get personalized recommendations in minutes with our AI-powered platform. 
              No complicated forms, no sales pressure, just smart coverage for your life.
            </p>
          </div>

          {/* Key benefits */}
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="outline" className="px-4 py-2 border-primary-200 text-primary-700">
              <Zap className="w-4 h-4 mr-2" />
              3-minute quotes
            </Badge>
            <Badge variant="outline" className="px-4 py-2 border-secondary-200 text-secondary-700">
              <Lock className="w-4 h-4 mr-2" />
              Bank-level security
            </Badge>
            <Badge variant="outline" className="px-4 py-2 border-primary-200 text-primary-700">
              <Heart className="w-4 h-4 mr-2" />
              No medical exam needed
            </Badge>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <Button 
              size="xl" 
              className="px-8 py-4 text-lg"
              onClick={() => {
                const formElement = document.getElementById('insurance-form')
                if (formElement) {
                  formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
            >
              Get My Free Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-sm text-muted-500 mt-2" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
              No email required • Results in 3 minutes • Always free
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Tell Us About You",
      description: "Answer a few quick questions about your age, income, and family situation.",
      icon: <Users className="w-6 h-6" />,
      color: "primary"
    },
    {
      number: "02", 
      title: "AI Analyzes Your Needs",
      description: "Our smart algorithm calculates the perfect coverage amount and type for your unique situation.",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "secondary"
    },
    {
      number: "03",
      title: "Get Instant Recommendation",
      description: "Receive a personalized recommendation with clear explanations and confidence scoring.",
      icon: <Award className="w-6 h-6" />,
      color: "accent"
    }
  ]

  return (
    <section className="py-24 bg-muted-50 dark:bg-muted-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="border-primary-200 text-primary-700">How It Works</Badge>
          <h2 className="text-4xl font-bold" style={{ color: 'var(--foreground)' }}>
            Three Simple Steps to Protection
          </h2>
          <p className="text-lg text-muted-500 max-w-2xl mx-auto" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
            Our streamlined process makes getting life insurance as easy as ordering coffee. 
            No lengthy applications or confusing jargon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={step.number} variant="elevated" className="text-center group hover:scale-105 transition-all duration-300">
              <CardContent className="pt-8 pb-6">
                <div className="space-y-4">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${step.color}-100 text-${step.color}-600 mb-4`}>
                    {step.icon}
                  </div>
                  <div className="text-sm font-bold dark:text-muted-700 text-muted-900 tracking-widest">
                    STEP {step.number}
                  </div>
                  <h3 className="text-xl font-bold dark:text-muted-700 text-muted-900" >
                    {step.title}
                  </h3>
                  <p className="dark:text-muted-700 text-muted-900 leading-relaxed" style={{ opacity: 0.7 }}>
                    {step.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const stats = [
    { label: "Customers Protected", value: "10,000+", icon: <Shield className="w-5 h-5" /> },
    { label: "Average Savings", value: "40%", icon: <DollarSign className="w-5 h-5" /> },
    { label: "Application Time", value: "3 min", icon: <Clock className="w-5 h-5" /> },
    { label: "Satisfaction Rate", value: "98%", icon: <Star className="w-5 h-5" /> }
  ]

  return (
    <section className="py-16 bg-primary-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center text-white">
              <div className="flex justify-center mb-2">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-1">
                {stat.value}
              </div>
              <div className="text-primary-100 text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DemoSection() {
  return (
    <section className="py-16 bg-muted-50 dark:bg-muted-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <Badge variant="outline" className="border-secondary-200 text-secondary-700">Live Demo</Badge>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            See Our Components in Action
          </h2>
          <p className="text-lg text-muted-500 max-w-2xl mx-auto" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
            Experience our complete design system with Tailwind v4, custom shadows, and dark mode support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Badge Showcase */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className='dark:text-muted-700 text-muted-900'>Smart Badges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <ConfidenceBadge score={0.92} />
                <StatusBadge status="active" />
                <InsuranceTypeBadge type="term_life" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="success">Approved</Badge>
                <Badge variant="warning">Pending</Badge>
                <Badge variant="outline" className="border-primary-200 text-primary-700">Featured</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Stats Showcase */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className='dark:text-muted-700 text-muted-900'>Analytics Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsCard
                title="Coverage Ratio"
                value="12.5x"
                description="Times annual income"
                trend={{ value: 15, isPositive: true }}
                icon={<TrendingUp className="w-4 h-4" />}
              />
            </CardContent>
          </Card>

          {/* Shadow Showcase */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className='dark:text-muted-700 text-muted-900'>InsureWise Shadows</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white dark:bg-muted-800 p-3 rounded shadow-soft border">
                <div className="text-sm font-medium dark:text-muted-100 text-muted-900">shadow-soft</div>
                <div className="text-xs text-muted-500">Subtle elevation</div>
              </div>
              <div className="bg-white dark:bg-muted-800 p-3 rounded shadow-medium border">
                <div className="text-sm font-medium dark:text-muted-100 text-muted-900">shadow-medium</div>
                <div className="text-xs text-muted-500">Standard depth</div>
              </div>
              <div className="bg-white dark:bg-muted-800 p-3 rounded shadow-hard border">
                <div className="text-sm font-medium dark:text-muted-100 text-muted-900">shadow-hard</div>
                <div className="text-xs text-muted-500">Maximum impact</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

// Main page component
export default function InsureWisePage() {
  const [currentRecommendation, setCurrentRecommendation] = useState<ProcessedRecommendation | null>(null)
  const [showRecommendation, setShowRecommendation] = useState(false)
  
  // Local storage and session management
  const { 
    lastRecommendation, 
    saveRecommendation, 
    hasStoredData, 
    isLoaded,
    sessionId 
  } = useLocalStorage()

  // Load last recommendation on mount if available
  useEffect(() => {
    if (isLoaded && lastRecommendation && !currentRecommendation) {
      setCurrentRecommendation(lastRecommendation)
      setShowRecommendation(true)
    }
  }, [isLoaded, lastRecommendation, currentRecommendation])

  // Handle new recommendation
  const handleRecommendationReceived = (recommendation: ProcessedRecommendation) => {
    setCurrentRecommendation(recommendation)
    setShowRecommendation(true)
    saveRecommendation(recommendation)
    
    // Smooth scroll to results
    setTimeout(() => {
      const resultsElement = document.getElementById('recommendation-results')
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  // Handle new recommendation request
  const handleNewRecommendation = () => {
    setShowRecommendation(false)
    setCurrentRecommendation(null)
    
    // Scroll back to form
    setTimeout(() => {
      const formElement = document.getElementById('insurance-form')
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Stats */}
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
            
            {/* Session Info */}
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
            
            {/* Insurance Form */}
            <div id="insurance-form" className="space-y-6">
              <div className="sticky top-8">
                <Card variant="elevated" className="shadow-medium">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Shield className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <CardTitle className= "dark:text-muted-700 text-muted-900">
                          Life Insurance Calculator
                        </CardTitle>
                        <p className="text-sm  dark:text-muted-700 text-muted-900" style={{ opacity: 0.7 }}>
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
            <div id="recommendation-results" className="space-y-6">
              {showRecommendation && currentRecommendation ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <Badge variant="success" className="mb-4">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Recommendation Ready
                    </Badge>
                    <h3 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                      Your Personalized Recommendation
                    </h3>
                    <p className="text-muted-500 mt-2" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
                      Based on your profile and financial situation
                    </p>
                  </div>
                  
                  <RecommendationCard 
                    recommendation={currentRecommendation}
                    onNewRecommendation={handleNewRecommendation}
                  />
                </div>
              ) : (
                <Card variant="ghost" className="text-center py-12">
                  <CardContent>
                    <div className="space-y-4">
                      <div className="w-24 h-24 bg-muted-100 dark:bg-muted-800 rounded-full flex items-center justify-center mx-auto">
                        <TrendingUp className="w-12 h-12 text-muted-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold dark:text-muted-700 text-muted-900" >
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
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Components Section */}
      <DemoSection />

      {/* Footer */}
      <Footer />
    </div>
  )
}
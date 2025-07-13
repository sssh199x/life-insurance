'use client'

import React from 'react'
import { Shield, Info } from 'lucide-react'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  ConfidenceBadge,
  InsuranceTypeBadge 
} from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import type { ProcessedRecommendation } from '@/lib/types'

// Component props
interface RecommendationDisplayProps {
  recommendation: ProcessedRecommendation
  className?: string
}

/**
 * Core recommendation display component
 * Shows the main recommendation with coverage, premium, and explanation
 */
export function RecommendationDisplay({ 
  recommendation, 
  className = "" 
}: RecommendationDisplayProps) {
  // Calculate annual premium for display
  const annualPremium = recommendation.premiumEstimate * 12

  return (
    <Card variant="elevated" className={`border-l-4 border-l-primary-500 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Shield className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <CardTitle 
                className="text-xl dark:text-muted-700 text-muted-900" 
              >
                Your Recommendation
              </CardTitle>
              <p 
                className="text-sm dark:text-muted-700 text-muted-900"
                style={{ opacity: 0.8 }}
              >
                Personalized for your needs
              </p>
            </div>
          </div>
          <ConfidenceBadge score={recommendation.confidenceScore} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Core Recommendation Display */}
        <div className="text-center space-y-4">
          <div className="space-y-2 mt-1">
            <InsuranceTypeBadge type={recommendation.insuranceType} size="lg" />
            <h2 
              className="text-3xl font-bold dark:text-muted-700 text-muted-900"
            >
              {recommendation.coverageDisplay}
            </h2>
            <p 
              className="text-lg dark:text-muted-700 text-muted-900"
              style={{ opacity: 0.8 }}
            >
              {recommendation.termDisplay ? `${recommendation.termDisplay} term` : 'Permanent coverage'}
            </p>
          </div>

          <div className="bg-muted-50 rounded-lg p-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-600">Estimated Monthly Premium</p>
              <p className="text-4xl font-bold text-primary-600">
                {recommendation.premiumDisplay}
              </p>
              <p className="text-sm text-muted-500">
                {formatCurrency(annualPremium)} annually
              </p>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-white border border-muted-200 rounded-lg p-4">
          <h3 
            className="font-medium dark:text-muted-700 text-muted-900 mb-2 flex items-center"
          >
            <Info className="h-4 w-4 mr-2" />
            Why This Recommendation?
          </h3>
          <p 
            className="text-sm dark:text-muted-700 text-muted-900 leading-relaxed"
            style={{ opacity: 0.8 }}
          >
            {recommendation.explanation}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Compact version of recommendation display
 */
export function CompactRecommendationDisplay({ 
  recommendation, 
  className = "" 
}: RecommendationDisplayProps) {
  return (
    <Card variant="outline" className={`p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <InsuranceTypeBadge type={recommendation.insuranceType} size="sm" />
          <div>
            <h3 className="font-semibold dark:text-muted-700 text-muted-900">
              {recommendation.coverageDisplay}
            </h3>
            <p className="text-sm text-muted-500">
              {recommendation.premiumDisplay}
            </p>
          </div>
        </div>
        <ConfidenceBadge score={recommendation.confidenceScore} />
      </div>
    </Card>
  )
}

/**
 * Premium focus display variant
 */
export function PremiumFocusDisplay({ 
  recommendation, 
  className = "" 
}: RecommendationDisplayProps) {
  const annualPremium = recommendation.premiumEstimate * 12

  return (
    <div className={`text-center space-y-3 ${className}`}>
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6 rounded-lg">
        <p className="text-sm opacity-90">Your Monthly Premium</p>
        <p className="text-3xl font-bold">
          {recommendation.premiumDisplay}
        </p>
        <p className="text-sm opacity-75">
          {formatCurrency(annualPremium)} per year
        </p>
      </div>
      
      <div className="flex items-center justify-center space-x-4 text-sm text-muted-600">
        <span>{recommendation.coverageDisplay} coverage</span>
        <span>•</span>
        <span>{recommendation.insuranceTypeDisplay}</span>
      </div>
    </div>
  )
}
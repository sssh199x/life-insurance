'use client'

import React, { useState } from 'react'
import { 
  Shield, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Info, 
  Download, 
  Share2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  Target
} from 'lucide-react'

import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Badge,
  ConfidenceBadge,
  InsuranceTypeBadge,
  StatsCard 
} from '@/components/ui'
import { useRecommendationInsights } from '@/hooks/use-recommendation'
import { formatCurrency, capitalize } from '@/lib/utils'
import type { ProcessedRecommendation } from '@/lib/types'

// Component props
interface RecommendationCardProps {
  recommendation: ProcessedRecommendation
  onNewRecommendation?: () => void
  className?: string
}

// Insight component for displaying recommendation insights
function InsightCard({ 
  insight 
}: { 
  insight: { type: 'positive' | 'neutral' | 'warning'; title: string; message: string } 
}) {
  const iconMap = {
    positive: <CheckCircle className="h-5 w-5 text-green-600" />,
    neutral: <Info className="h-5 w-5 text-blue-600" />,
    warning: <AlertCircle className="h-5 w-5 text-orange-600" />
  }

  const colorMap = {
    positive: 'border-green-200 bg-green-50',
    neutral: 'border-blue-200 bg-blue-50',
    warning: 'border-orange-200 bg-orange-50'
  }

  return (
    <div className={`p-4 rounded-lg border ${colorMap[insight.type]}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {iconMap[insight.type]}
        </div>
        <div className="flex-1">
          <h4 
            className="font-medium dark:text-muted-700 text-muted-900" 
            
          >
            {insight.title}
          </h4>
          <p 
            className="text-sm dark:text-muted-700 text-muted-900 mt-1"
            style={{ opacity: 0.8 }}
          >
            {insight.message}
          </p>
        </div>
      </div>
    </div>
  )
}

// Main Recommendation Card Component
export function RecommendationCard({ 
  recommendation, 
  onNewRecommendation, 
  className 
}: RecommendationCardProps) {
  // State for expanded sections
  const [showDetails, setShowDetails] = useState(false)
  const [showInsights, setShowInsights] = useState(false)

  // Get recommendation insights
  const { insights } = useRecommendationInsights(recommendation)

  // Calculate annual premium for display
  const annualPremium = recommendation.premiumEstimate * 12

  // Handle sharing (placeholder for now)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Life Insurance Recommendation',
          text: `I received a recommendation for ${recommendation.insuranceTypeDisplay} with ${recommendation.coverageDisplay} coverage.`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled or failed')
      }
    } else {
      // Fallback: copy to clipboard
      const text = `Life Insurance Recommendation:\n${recommendation.insuranceTypeDisplay}\nCoverage: ${recommendation.coverageDisplay}\nPremium: ${recommendation.premiumDisplay}`
      navigator.clipboard.writeText(text)
      // You could show a toast notification here
    }
  }

  // Handle download
  const handleDownload = () => {
    // Generate a PDF report
    console.log('Download recommendation report')
    // For now, creating a simple text file
    const content = `
Life Insurance Recommendation Report
=====================================

Recommendation Details:
- Insurance Type: ${recommendation.insuranceTypeDisplay}
- Coverage Amount: ${recommendation.coverageDisplay}
- Term Length: ${recommendation.termDisplay || 'Permanent'}
- Monthly Premium: ${recommendation.premiumDisplay}
- Annual Premium: ${formatCurrency(annualPremium)}
- Confidence Score: ${recommendation.confidenceDisplay}

Your Profile:
- Age: ${recommendation.userAge}
- Annual Income: ${formatCurrency(recommendation.userIncome)}
- Dependents: ${recommendation.userDependents}
- Risk Tolerance: ${capitalize(recommendation.userRiskTolerance)}

Explanation:
${recommendation.explanation}

Generated: ${new Date().toLocaleDateString()}
Session: ${recommendation.recommendationId}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `life-insurance-recommendation-${recommendation.recommendationId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Main Recommendation Card */}
      <Card variant="elevated" className="border-l-4 border-l-primary-500">
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
            <ConfidenceBadge score={recommendation.confidenceScore} 
            />
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="flex-1">
              Get Quote
            </Button>
            <Button variant="outline" size="lg" onClick={handleShare} leftIcon={<Share2 className="h-4 w-4" />}>
              Share
            </Button>
            <Button variant="outline" size="lg" onClick={handleDownload} leftIcon={<Download className="h-4 w-4" />}>
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Coverage Ratio"
          value={`${(recommendation.coverageAmount / recommendation.userIncome).toFixed(1)}x`}
          description="Times your annual income"
          icon={<Target className="h-4 w-4" />}
        />
        <StatsCard
          title="Premium Cost"
          value={`${((annualPremium / recommendation.userIncome) * 100).toFixed(1)}%`}
          description="Of your annual income"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatsCard
          title="Protection Period"
          value={recommendation.termDisplay || "Lifetime"}
          description={recommendation.termDisplay ? "Years of coverage" : "Permanent protection"}
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      {/* Details Section */}
      <Card>
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto font-medium dark:text-muted-700 text-muted-900"
            onClick={() => setShowDetails(!showDetails)}
            
          >
            <span>Recommendation Details</span>
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardHeader>

        {showDetails && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Your Profile */}
              <div className="space-y-3">
                <h4 
                  className="font-medium dark:text-muted-700 text-muted-900 flex items-center"
                  
                >
                  <User className="h-4 w-4 mr-2" />
                  Your Profile
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span 
                      className="dark:text-muted-700 text-muted-900"
                      style={{ opacity: 0.7 }}
                    >
                      Age:
                    </span>
                    <span 
                      className="font-medium dark:text-muted-700 text-muted-900"
                    >
                      {recommendation.userAge} years
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span 
                      className="dark:text-muted-700 text-muted-900"
                      style={{  opacity: 0.7 }}
                    >
                      Annual Income:
                    </span>
                    <span 
                      className="font-medium dark:text-muted-700 text-muted-900"
                      
                    >
                      {formatCurrency(recommendation.userIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span 
                      className="dark:text-muted-700 text-muted-900"
                      style={{ opacity: 0.7 }}
                    >
                      Dependents:
                    </span>
                    <span 
                      className="font-medium dark:text-muted-700 text-muted-900"
                    >
                      {recommendation.userDependents}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span 
                      className="dark:text-muted-700 text-muted-9000"
                      style={{ opacity: 0.7 }}
                    >
                      Risk Tolerance:
                    </span>
                    <Badge variant="outline">{capitalize(recommendation.userRiskTolerance)}</Badge>
                  </div>
                </div>
              </div>

              {/* Coverage Details */}
              <div className="space-y-3">
                <h4 
                  className="font-medium dark:text-muted-700 text-muted-900 flex items-center"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Coverage Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span 
                      className="dark:text-muted-700 text-muted-900"
                      style={{ opacity: 0.7 }}
                    >
                      Insurance Type:
                    </span>
                    <span 
                      className="font-medium dark:text-muted-700 text-muted-900"
                    >
                      {recommendation.insuranceTypeDisplay}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span 
                      className="dark:text-muted-700 text-muted-900"
                      style={{ opacity: 0.7 }}
                    >
                      Coverage Amount:
                    </span>
                    <span 
                      className="font-medium dark:text-muted-700 text-muted-900"
                    >
                      {recommendation.coverageDisplay}
                    </span>
                  </div>
                  {recommendation.termDisplay && (
                    <div className="flex justify-between">
                      <span 
                        className="dark:text-muted-700 text-muted-900"
                        style={{ opacity: 0.7 }}
                      >
                        Term Length:
                      </span>
                      <span 
                        className="font-medium dark:text-muted-700 text-muted-900"
                      >
                        {recommendation.termDisplay}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span 
                      className="dark:text-muted-700 text-muted-900"
                      style={{ opacity: 0.7 }}
                    >
                      Monthly Premium:
                    </span>
                    <span className="font-medium text-primary-600">{recommendation.premiumDisplay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span 
                      className="dark:text-muted-700 text-muted-900"
                      style={{  opacity: 0.7 }}
                    >
                      Confidence:
                    </span>
                    <span 
                      className="font-medium dark:text-muted-700 text-muted-900"
                    >
                      {recommendation.confidenceDisplay}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Insights Section */}
      {insights && insights.length > 0 && (
        <Card>
          <CardHeader>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto font-medium dark:text-muted-700 text-muted-900"
              onClick={() => setShowInsights(!showInsights)}
              
            >
              <span className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Insights & Analysis ({insights.length})
              </span>
              {showInsights ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CardHeader>

          {showInsights && (
            <CardContent>
              <div className="space-y-4 mt-2">
                {insights.map((insight, index) => (
                  <InsightCard key={index} insight={insight} />
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Start Over Button */}
      <div className="text-center pt-6 border-t border-muted-200">
        <Button
          variant="outline"
          onClick={onNewRecommendation}
          className="min-w-48"
        >
          Get New Recommendation
        </Button>
        <p 
          className="text-xs text-muted-400 mt-2"
          style={{ color: 'var(--foreground)', opacity: 0.6 }}
        >
          Want to try different parameters? Start over with new information.
        </p>
      </div>
    </div>
  )
}
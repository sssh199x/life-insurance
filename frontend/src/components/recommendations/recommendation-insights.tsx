'use client'

import React, { useState } from 'react'
import { 
  TrendingUp, 
  ChevronDown, 
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb,
  Star,
  AlertTriangle
} from 'lucide-react'
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Button, 
  Badge 
} from '@/components/ui'
import { useRecommendationInsights } from '@/hooks/use-recommendation'
import type { ProcessedRecommendation } from '@/lib/types'

// Insight types from the hook
type InsightType = 'positive' | 'neutral' | 'warning'

interface Insight {
  type: InsightType
  title: string
  message: string
}

// Component props
interface RecommendationInsightsProps {
  recommendation: ProcessedRecommendation
  className?: string
  defaultExpanded?: boolean
  showToggle?: boolean
  maxInsights?: number
}

/**
 * Individual Insight Card Component
 */
export function InsightCard({ 
  insight,
  className = ""
}: { 
  insight: Insight
  className?: string 
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

  const badgeColorMap = {
    positive: 'success' as const,
    neutral: 'outline' as const,
    warning: 'warning' as const
  }

  return (
    <div className={`p-4 rounded-lg border ${colorMap[insight.type]} ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {iconMap[insight.type]}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 
              className="font-medium dark:text-muted-700 text-muted-900" 
            >
              {insight.title}
            </h4>
            <Badge 
              variant={badgeColorMap[insight.type]}
              size="sm"
            >
              {insight.type}
            </Badge>
          </div>
          <p 
            className="text-sm dark:text-muted-700 text-muted-900 leading-relaxed"
            style={{ opacity: 0.8 }}
          >
            {insight.message}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Insight Summary Component
 */
export function InsightSummary({ 
  insights,
  className = ""
}: { 
  insights: Insight[]
  className?: string 
}) {
  const positiveCount = insights.filter(i => i.type === 'positive').length
  const warningCount = insights.filter(i => i.type === 'warning').length
  const neutralCount = insights.filter(i => i.type === 'neutral').length

  const getOverallScore = () => {
    const score = (positiveCount * 2 + neutralCount * 1 - warningCount * 0.5) / insights.length
    if (score >= 1.5) return { text: 'Excellent Match', color: 'text-green-600', icon: <Star className="h-4 w-4" /> }
    if (score >= 1) return { text: 'Good Fit', color: 'text-blue-600', icon: <CheckCircle className="h-4 w-4" /> }
    if (score >= 0.5) return { text: 'Consider Options', color: 'text-orange-600', icon: <AlertTriangle className="h-4 w-4" /> }
    return { text: 'Needs Review', color: 'text-red-600', icon: <AlertCircle className="h-4 w-4" /> }
  }

  const overallScore = getOverallScore()

  return (
    <div className={`bg-muted-50 border border-muted-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium dark:text-muted-700 text-muted-900">
          Analysis Summary
        </h4>
        <div className={`flex items-center space-x-1 ${overallScore.color}`}>
          {overallScore.icon}
          <span className="text-sm font-medium">{overallScore.text}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-bold text-green-600">{positiveCount}</div>
          <div className="text-xs text-muted-500">Positive</div>
        </div>
        <div>
          <div className="text-lg font-bold text-blue-600">{neutralCount}</div>
          <div className="text-xs text-muted-500">Neutral</div>
        </div>
        <div>
          <div className="text-lg font-bold text-orange-600">{warningCount}</div>
          <div className="text-xs text-muted-500">Considerations</div>
        </div>
      </div>
    </div>
  )
}

/**
 * Categorized Insights Component
 */
export function CategorizedInsights({ 
  insights,
  className = ""
}: { 
  insights: Insight[]
  className?: string 
}) {
  const positiveInsights = insights.filter(i => i.type === 'positive')
  const neutralInsights = insights.filter(i => i.type === 'neutral')
  const warningInsights = insights.filter(i => i.type === 'warning')

  const InsightCategory = ({ 
    title, 
    insights, 
    icon, 
    emptyMessage 
  }: {
    title: string
    insights: Insight[]
    icon: React.ReactNode
    emptyMessage: string
  }) => (
    <div className="space-y-3">
      <h5 className="font-medium dark:text-muted-700 text-muted-900 flex items-center">
        {icon}
        <span className="ml-2">{title} ({insights.length})</span>
      </h5>
      {insights.length > 0 ? (
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-500 italic">{emptyMessage}</p>
      )}
    </div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      <InsightCategory
        title="Strengths"
        insights={positiveInsights}
        icon={<CheckCircle className="h-4 w-4 text-green-600" />}
        emptyMessage="No specific strengths identified."
      />
      
      <InsightCategory
        title="Information"
        insights={neutralInsights}
        icon={<Info className="h-4 w-4 text-blue-600" />}
        emptyMessage="No additional information available."
      />
      
      <InsightCategory
        title="Considerations"
        insights={warningInsights}
        icon={<AlertTriangle className="h-4 w-4 text-orange-600" />}
        emptyMessage="No concerns identified with this recommendation."
      />
    </div>
  )
}

/**
 * Quick Insights Component (compact view)
 */
export function QuickInsights({ 
  insights,
  maxItems = 3,
  className = ""
}: { 
  insights: Insight[]
  maxItems?: number
  className?: string 
}) {
  const prioritizedInsights = [
    ...insights.filter(i => i.type === 'warning'),
    ...insights.filter(i => i.type === 'positive'),
    ...insights.filter(i => i.type === 'neutral')
  ].slice(0, maxItems)

  return (
    <div className={`space-y-2 ${className}`}>
      {prioritizedInsights.map((insight, index) => (
        <div key={index} className="flex items-start space-x-2 p-2 rounded border border-muted-200">
          <div className="flex-shrink-0 mt-0.5">
            {insight.type === 'positive' && <CheckCircle className="h-4 w-4 text-green-600" />}
            {insight.type === 'neutral' && <Info className="h-4 w-4 text-blue-600" />}
            {insight.type === 'warning' && <AlertCircle className="h-4 w-4 text-orange-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <h6 className="text-sm font-medium dark:text-muted-700 text-muted-900">
              {insight.title}
            </h6>
            <p className="text-xs text-muted-500 mt-0.5 line-clamp-2">
              {insight.message}
            </p>
          </div>
        </div>
      ))}
      
      {insights.length > maxItems && (
        <p className="text-xs text-muted-500 text-center">
          +{insights.length - maxItems} more insights available
        </p>
      )}
    </div>
  )
}

/**
 * Actionable Insights Component
 */
export function ActionableInsights({ 
  recommendation,
  className = ""
}: { 
  recommendation: ProcessedRecommendation
  insights: Insight[]
  className?: string 
}) {
  // Generate actionable suggestions based on insights and recommendation data
  const getActionableAdvice = (): Insight[] => {
    const advice: Insight[] = []
    const coverageRatio = recommendation.coverageAmount / recommendation.userIncome
    const annualPremium = recommendation.premiumEstimate * 12
    const premiumRatio = annualPremium / recommendation.userIncome

    // Coverage advice
    if (coverageRatio < 7) {
      advice.push({
        type: 'warning',
        title: 'Consider Increasing Coverage',
        message: 'Financial experts typically recommend 7-10x your annual income in life insurance coverage. You might want to explore higher coverage options.'
      })
    }

    // Premium advice
    if (premiumRatio > 0.05) {
      advice.push({
        type: 'warning',
        title: 'Explore Cost-Saving Options',
        message: 'Your premiums exceed 5% of income. Consider term life insurance or adjusting coverage amount to reduce costs.'
      })
    }

    // Age-based advice
    if (recommendation.userAge < 30) {
      advice.push({
        type: 'positive',
        title: 'Lock in Low Rates',
        message: 'Starting life insurance at your age provides significant long-term savings. Consider locking in these rates with a longer term policy.'
      })
    }

    // Dependents advice
    if (recommendation.userDependents === 0 && coverageRatio > 5) {
      advice.push({
        type: 'neutral',
        title: 'Review Coverage Need',
        message: 'With no dependents, you might consider if this level of coverage aligns with your estate planning goals.'
      })
    }

    return advice
  }

  const actionableAdvice = getActionableAdvice()

  return (
    <div className={`space-y-4 ${className}`}>
      <h5 className="font-medium dark:text-muted-700 text-muted-900 flex items-center">
        <Lightbulb className="h-4 w-4 text-yellow-600 mr-2" />
        Actionable Recommendations
      </h5>
      
      {actionableAdvice.length > 0 ? (
        <div className="space-y-3">
          {actionableAdvice.map((advice, index) => (
            <InsightCard key={index} insight={advice} />
          ))}
        </div>
      ) : (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Your recommendation looks well-balanced. No immediate adjustments needed.
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Main Recommendation Insights Component
 */
export function RecommendationInsights({ 
  recommendation, 
  className = "",
  defaultExpanded = false,
  showToggle = true,
  maxInsights = 10
}: RecommendationInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const { insights } = useRecommendationInsights(recommendation)

  // If no insights generated, don't render
  if (!insights || insights.length === 0) {
    return null
  }

  const displayInsights = insights.slice(0, maxInsights)

  if (!showToggle) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <RecommendationInsightsContent 
            recommendation={recommendation}
            insights={displayInsights} 
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <Button
          variant="ghost"
          className="w-full justify-between p-0 h-auto font-medium dark:text-muted-700 text-muted-900"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Insights & Analysis ({displayInsights.length})
          </span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <RecommendationInsightsContent 
            recommendation={recommendation}
            insights={displayInsights} 
          />
        </CardContent>
      )}
    </Card>
  )
}

/**
 * Insights Content Component (without card wrapper)
 */
function RecommendationInsightsContent({ 
  recommendation,
  insights
}: { 
  recommendation: ProcessedRecommendation
  insights: Insight[]
}) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <InsightSummary insights={insights} />
      
      {/* Categorized Insights */}
      <CategorizedInsights insights={insights} />
      
      {/* Actionable Advice */}
      <ActionableInsights 
        recommendation={recommendation}
        insights={insights} 
      />
    </div>
  )
}

/**
 * Compact Insights for smaller displays
 */
export function CompactRecommendationInsights({ 
  recommendation, 
  className = ""
}: { 
  recommendation: ProcessedRecommendation
  className?: string 
}) {
  const { insights } = useRecommendationInsights(recommendation)

  if (!insights || insights.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium dark:text-muted-700 text-muted-900">
          Quick Insights
        </h4>
        <Badge variant="outline" size="sm">
          {insights.length} found
        </Badge>
      </div>
      
      <QuickInsights insights={insights} maxItems={2} />
    </div>
  )
}

/**
 * Insights with custom filtering
 */
export function FilteredInsights({
  recommendation,
  filterType,
  className = ""
}: {
  recommendation: ProcessedRecommendation
  filterType?: InsightType | 'all'
  className?: string
}) {
  const { insights } = useRecommendationInsights(recommendation)

  if (!insights || insights.length === 0) {
    return null
  }

  const filteredInsights = filterType && filterType !== 'all' 
    ? insights.filter(insight => insight.type === filterType)
    : insights

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-3">
        {filteredInsights.map((insight, index) => (
          <InsightCard key={index} insight={insight} />
        ))}
      </div>
      
      {filteredInsights.length === 0 && (
        <p className="text-sm text-muted-500 text-center italic">
          No {filterType} insights found.
        </p>
      )}
    </div>
  )
}
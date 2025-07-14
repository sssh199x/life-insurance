'use client'

import React from 'react'
import { 
  Target, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Shield, 
  Users,
  Percent,
  Clock
} from 'lucide-react'
import { StatsCard } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import type { ProcessedRecommendation } from '@/lib/types'

// Component props
interface RecommendationStatsProps {
  recommendation: ProcessedRecommendation
  className?: string
  layout?: 'grid' | 'horizontal' | 'vertical'
  showTrends?: boolean
}

// Individual stat calculation functions
interface StatsCalculations {
  coverageRatio: number
  premiumRatio: number
  affordabilityScore: 'excellent' | 'good' | 'fair' | 'high'
  protectionYears: number | null
  monthsToBreakeven: number
}

/**
 * Calculate all statistics for the recommendation
 */
function calculateRecommendationStats(recommendation: ProcessedRecommendation): StatsCalculations {
  const {
    coverageAmount,
    userIncome,
    premiumEstimate,
    termLength  } = recommendation

  // Coverage ratio (coverage amount vs annual income)
  const coverageRatio = coverageAmount / userIncome

  // Annual premium and premium ratio
  const annualPremium = premiumEstimate * 12
  const premiumRatio = annualPremium / userIncome

  // Affordability assessment
  const getAffordabilityScore = (ratio: number): 'excellent' | 'good' | 'fair' | 'high' => {
    if (ratio <= 0.02) return 'excellent' // ≤2%
    if (ratio <= 0.05) return 'good'      // ≤5%
    if (ratio <= 0.10) return 'fair'      // ≤10%
    return 'high'                         // >10%
  }

  const affordabilityScore = getAffordabilityScore(premiumRatio)

  // Protection period calculation
  const protectionYears = termLength || null

  // Simple breakeven calculation (months until premiums equal 1 year of income protection)
  const monthsToBreakeven = Math.round(userIncome / (premiumEstimate * 12))

  return {
    coverageRatio,
    premiumRatio,
    affordabilityScore,
    protectionYears,
    monthsToBreakeven
  }
}

/**
 * Coverage Ratio stat component
 */
export function CoverageRatioStat({ 
  recommendation, 
  showTrend = false,
  className = ""
}: { 
  recommendation: ProcessedRecommendation
  showTrend?: boolean
  className?: string 
}) {
  const { coverageRatio } = calculateRecommendationStats(recommendation)
  
  // Determine if ratio is good/bad for trend indication
  const isGoodRatio = coverageRatio >= 7
  const trend = showTrend ? {
    value: Math.round((coverageRatio - 10) * 5), // Arbitrary trend calculation
    isPositive: isGoodRatio
  } : undefined

  return (
    <StatsCard
      title="Coverage Ratio"
      value={`${coverageRatio.toFixed(1)}x`}
      description="Times your annual income"
      trend={trend}
      icon={<Target className="h-4 w-4" />}
      className={className}
    />
  )
}

/**
 * Premium Cost stat component
 */
export function PremiumCostStat({ 
  recommendation, 
  showTrend = false,
  className = ""
}: { 
  recommendation: ProcessedRecommendation
  showTrend?: boolean
  className?: string 
}) {
  const { premiumRatio, affordabilityScore } = calculateRecommendationStats(recommendation)
  
  // Trend based on affordability
  const trend = showTrend ? {
    value: Math.round((0.05 - premiumRatio) * 1000), // Compared to 5% benchmark
    isPositive: affordabilityScore === 'excellent' || affordabilityScore === 'good'
  } : undefined

  return (
    <StatsCard
      title="Premium Cost"
      value={`${(premiumRatio * 100).toFixed(1)}%`}
      description="Of your annual income"
      trend={trend}
      icon={<DollarSign className="h-4 w-4" />}
      className={className}
    />
  )
}

/**
 * Protection Period stat component
 */
export function ProtectionPeriodStat({ 
  recommendation, 
  showTrend = false,
  className = ""
}: { 
  recommendation: ProcessedRecommendation
  showTrend?: boolean
  className?: string 
}) {
  const { protectionYears } = calculateRecommendationStats(recommendation)
  
  const trend = showTrend && protectionYears ? {
    value: protectionYears > 20 ? 15 : protectionYears > 10 ? 8 : -5,
    isPositive: protectionYears > 15
  } : undefined

  return (
    <StatsCard
      title="Protection Period"
      value={recommendation.termDisplay || "Lifetime"}
      description={recommendation.termDisplay ? "Years of coverage" : "Permanent protection"}
      trend={trend}
      icon={<Calendar className="h-4 w-4" />}
      className={className}
    />
  )
}

/**
 * Affordability Score stat component
 */
export function AffordabilityStat({ 
  recommendation, 
  className = ""
}: { 
  recommendation: ProcessedRecommendation
  className?: string 
}) {
  const { affordabilityScore } = calculateRecommendationStats(recommendation)
  
  const scoreConfig = {
    excellent: { 
      value: "Excellent", 
      description: "Very affordable", 
      color: "text-secondary-600" 
    },
    good: { 
      value: "Good", 
      description: "Affordable", 
      color: "text-primary-600" 
    },
    fair: { 
      value: "Fair", 
      description: "Manageable", 
      color: "text-yellow-600" 
    },
    high: { 
      value: "High", 
      description: "Consider alternatives", 
      color: "text-red-600" 
    }
  }

  const config = scoreConfig[affordabilityScore]

  return (
    <StatsCard
      title="Affordability"
      value={config.value}
      description={config.description}
      icon={<Percent className="h-4 w-4" />}
      className={className}
    />
  )
}

/**
 * Confidence Score stat component
 */
export function ConfidenceStat({ 
  recommendation, 
  className = ""
}: { 
  recommendation: ProcessedRecommendation
  className?: string 
}) {
  const confidencePercent = Math.round(recommendation.confidenceScore * 100)
  
  return (
    <StatsCard
      title="Recommendation Confidence"
      value={`${confidencePercent}%`}
      description="AI confidence level"
      icon={<TrendingUp className="h-4 w-4" />}
      className={className}
    />
  )
}

/**
 * Additional stats for comprehensive view
 */
export function AdditionalStats({ 
  recommendation, 
  className = ""
}: { 
  recommendation: ProcessedRecommendation
  className?: string 
}) {
  const annualPremium = recommendation.premiumEstimate * 12
  const { monthsToBreakeven } = calculateRecommendationStats(recommendation)

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <StatsCard
        title="Annual Premium"
        value={formatCurrency(annualPremium)}
        description="Total yearly cost"
        icon={<Calendar className="h-4 w-4" />}
      />
      
      <StatsCard
        title="Dependents Protected"
        value={recommendation.userDependents.toString()}
        description="People covered"
        icon={<Users className="h-4 w-4" />}
      />
      
      <StatsCard
        title="Value Ratio"
        value={`${Math.round(recommendation.coverageAmount / annualPremium)}:1`}
        description="Coverage per premium dollar"
        icon={<Shield className="h-4 w-4" />}
      />
      
      <StatsCard
        title="Breakeven Period"
        value={`${monthsToBreakeven} mo`}
        description="Until premiums = 1yr income"
        icon={<Clock className="h-4 w-4" />}
      />
    </div>
  )
}

/**
 * Main recommendation stats component
 */
export function RecommendationStats({ 
  recommendation, 
  className = "",
  layout = 'grid',
  showTrends = false
}: RecommendationStatsProps) {
  const gridClass = layout === 'grid' 
    ? "grid grid-cols-1 md:grid-cols-3 gap-4" 
    : layout === 'horizontal'
    ? "flex flex-wrap gap-4"
    : "flex flex-col space-y-4"

  return (
    <div className={`${gridClass} ${className}`}>
      <CoverageRatioStat 
        recommendation={recommendation} 
        showTrend={showTrends}
      />
      <PremiumCostStat 
        recommendation={recommendation} 
        showTrend={showTrends}
      />
      <ProtectionPeriodStat 
        recommendation={recommendation} 
        showTrend={showTrends}
      />
    </div>
  )
}

/**
 * Compact stats for smaller displays
 */
export function CompactRecommendationStats({ 
  recommendation, 
  className = ""
}: { 
  recommendation: ProcessedRecommendation
  className?: string 
}) {
  const { coverageRatio, premiumRatio } = calculateRecommendationStats(recommendation)

  return (
    <div className={`flex justify-between text-sm ${className}`}>
      <div className="text-center">
        <div className="font-semibold dark:text-muted-700 text-muted-900">
          {coverageRatio.toFixed(1)}x
        </div>
        <div className="text-muted-500 text-xs">Coverage</div>
      </div>
      
      <div className="text-center">
        <div className="font-semibold dark:text-muted-700 text-muted-900">
          {(premiumRatio * 100).toFixed(1)}%
        </div>
        <div className="text-muted-500 text-xs">Of Income</div>
      </div>
      
      <div className="text-center">
        <div className="font-semibold dark:text-muted-700 text-muted-900">
          {recommendation.termDisplay || "Life"}
        </div>
        <div className="text-muted-500 text-xs">Term</div>
      </div>
    </div>
  )
}

/**
 * Enhanced stats with detailed breakdown
 */
export function DetailedRecommendationStats({ 
  recommendation, 
  className = ""
}: { 
  recommendation: ProcessedRecommendation
  className?: string 
}) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Primary Stats */}
      <RecommendationStats 
        recommendation={recommendation} 
        showTrends={true}
      />
      
      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AffordabilityStat recommendation={recommendation} />
        <ConfidenceStat recommendation={recommendation} />
      </div>
      
      {/* Additional Stats */}
      <AdditionalStats recommendation={recommendation} />
    </div>
  )
}

/**
 * Stats with custom metrics selection
 */
export function CustomRecommendationStats({
  recommendation,
  metrics = ['coverage', 'premium', 'protection'],
  layout = 'grid',
  className = ""
}: {
  recommendation: ProcessedRecommendation
  metrics?: Array<'coverage' | 'premium' | 'protection' | 'affordability' | 'confidence'>
  layout?: 'grid' | 'horizontal' | 'vertical'
  className?: string
}) {
  const gridClass = layout === 'grid' 
    ? `grid grid-cols-1 md:grid-cols-${metrics.length} gap-4`
    : layout === 'horizontal'
    ? "flex flex-wrap gap-4"
    : "flex flex-col space-y-4"

  return (
    <div className={`${gridClass} ${className}`}>
      {metrics.includes('coverage') && (
        <CoverageRatioStat recommendation={recommendation} />
      )}
      {metrics.includes('premium') && (
        <PremiumCostStat recommendation={recommendation} />
      )}
      {metrics.includes('protection') && (
        <ProtectionPeriodStat recommendation={recommendation} />
      )}
      {metrics.includes('affordability') && (
        <AffordabilityStat recommendation={recommendation} />
      )}
      {metrics.includes('confidence') && (
        <ConfidenceStat recommendation={recommendation} />
      )}
    </div>
  )
}
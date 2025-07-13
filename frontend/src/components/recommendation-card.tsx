'use client'

import React from 'react'
import { Badge } from '@/components/ui'
import { CheckCircle } from 'lucide-react'

// Extracted recommendation components
import {
  RecommendationDisplay,
  RecommendationActions,
  RecommendationStats,
  RecommendationDetails,
  RecommendationInsights,
  type ProcessedRecommendation
} from '@/components/recommendations'

// Component props
interface RecommendationCardProps {
  recommendation: ProcessedRecommendation
  onNewRecommendation?: () => void
  className?: string
}

/**
 * Main Recommendation Card Component
 */
export function RecommendationCard({ 
  recommendation, 
  onNewRecommendation, 
  className = ""
}: RecommendationCardProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Badge */}
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

      {/* Main Recommendation Display */}
      <RecommendationDisplay recommendation={recommendation} />

      {/* Action Buttons */}
      <RecommendationActions 
        recommendation={recommendation}
        onNewRecommendation={onNewRecommendation}
      />

      {/* Stats Overview */}
      <RecommendationStats recommendation={recommendation} />

      {/* Expandable Details Section */}
      <RecommendationDetails 
        recommendation={recommendation}
        defaultExpanded={false}
      />

      {/* Expandable Insights Section */}
      <RecommendationInsights 
        recommendation={recommendation}
        defaultExpanded={false}
      />

      {/* Start Over Section */}
      <div className="text-center pt-6 border-t border-muted-200">
        <button
          onClick={onNewRecommendation}
          className="min-w-48 px-4 py-2 border border-muted-300 rounded-lg text-sm font-medium text-muted-700 hover:bg-muted-50 transition-colors"
        >
          Get New Recommendation
        </button>
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

/**
 * Compact Recommendation Card for lists or smaller spaces
 */
export function CompactRecommendationCard({ 
  recommendation, 
  onNewRecommendation, 
  className = ""
}: RecommendationCardProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Compact Display */}
      <RecommendationDisplay recommendation={recommendation} />

      {/* Compact Actions */}
      <RecommendationActions 
        recommendation={recommendation}
        onNewRecommendation={onNewRecommendation}
      />

      {/* Compact Stats */}
      <RecommendationStats 
        recommendation={recommendation}
        layout="horizontal"
      />
    </div>
  )
}

/**
 * Mobile-Optimized Recommendation Card
 */
export function MobileRecommendationCard({ 
  recommendation, 
  onNewRecommendation, 
  className = ""
}: RecommendationCardProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <Badge variant="success" size="sm" className="mb-3">
          <CheckCircle className="w-3 h-3 mr-1" />
          Ready
        </Badge>
        <h3 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
          Your Recommendation
        </h3>
      </div>

      {/* Mobile-optimized display */}
      <RecommendationDisplay recommendation={recommendation} />

      {/* Compact actions for mobile */}
      <RecommendationActions 
        recommendation={recommendation}
        onNewRecommendation={onNewRecommendation}
      />

      {/* Mobile stats */}
      <RecommendationStats 
        recommendation={recommendation}
        layout="vertical"
      />

      {/* Compact details for mobile */}
      <RecommendationDetails 
        recommendation={recommendation}
        defaultExpanded={false}
      />

      {/* Quick insights for mobile */}
      <RecommendationInsights 
        recommendation={recommendation}
        defaultExpanded={false}
        maxInsights={3}
      />
    </div>
  )
}

/**
 * Detailed Recommendation Card with all features expanded
 */
export function DetailedRecommendationCard({ 
  recommendation, 
  onNewRecommendation, 
  className = ""
}: RecommendationCardProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Enhanced Header */}
      <div className="text-center space-y-4">
        <Badge variant="success" className="mb-4">
          <CheckCircle className="w-4 h-4 mr-2" />
          Detailed Analysis Complete
        </Badge>
        <h2 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          Your Comprehensive Recommendation
        </h2>
        <p className="text-lg text-muted-500 max-w-2xl mx-auto" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
          AI-powered analysis based on your unique profile and financial goals
        </p>
      </div>

      {/* Main Display */}
      <RecommendationDisplay recommendation={recommendation} />

      {/* Comprehensive Actions */}
      <RecommendationActions 
        recommendation={recommendation}
        onNewRecommendation={onNewRecommendation}
      />

      {/* Detailed Stats */}
      <RecommendationStats 
        recommendation={recommendation}
        showTrends={true}
      />

      {/* Expanded Details */}
      <RecommendationDetails 
        recommendation={recommendation}
        defaultExpanded={true}
        showToggle={false}
      />

      {/* Expanded Insights */}
      <RecommendationInsights 
        recommendation={recommendation}
        defaultExpanded={true}
        showToggle={false}
      />

      {/* Enhanced Footer */}
      <div className="text-center pt-8 border-t border-muted-200 space-y-4">
        <button
          onClick={onNewRecommendation}
          className="min-w-64 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Explore Different Options
        </button>
        <p 
          className="text-sm text-muted-500 max-w-md mx-auto"
          style={{ color: 'var(--foreground)', opacity: 0.7 }}
        >
          This recommendation is personalized for your current situation. 
          Life changes? Get a new recommendation anytime.
        </p>
      </div>
    </div>
  )
}

/**
 * Custom Recommendation Card with configurable sections
 */
export function CustomRecommendationCard({
  recommendation,
  onNewRecommendation,
  sections = {
    display: true,
    actions: true,
    stats: true,
    details: true,
    insights: true
  },
  layout = 'default',
  className = ""
}: RecommendationCardProps & {
  sections?: {
    display?: boolean
    actions?: boolean
    stats?: boolean
    details?: boolean
    insights?: boolean
  }
  layout?: 'default' | 'compact' | 'detailed' | 'minimal'
}) {
  const spacing = layout === 'compact' ? 'space-y-4' : layout === 'detailed' ? 'space-y-8' : 'space-y-6'

  return (
    <div className={`${spacing} ${className}`}>
      {/* Conditional Header */}
      {layout !== 'minimal' && (
        <div className="text-center">
          <Badge variant="success" className="mb-4">
            <CheckCircle className="w-4 h-4 mr-2" />
            Recommendation Ready
          </Badge>
          <h3 className={`font-bold ${layout === 'detailed' ? 'text-3xl' : 'text-2xl'}`} style={{ color: 'var(--foreground)' }}>
            Your Personalized Recommendation
          </h3>
          {layout === 'detailed' && (
            <p className="text-lg text-muted-500 mt-2" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
              AI-powered analysis tailored to your needs
            </p>
          )}
        </div>
      )}

      {/* Conditional Sections */}
      {sections.display && (
        <RecommendationDisplay recommendation={recommendation} />
      )}

      {sections.actions && (
        <RecommendationActions 
          recommendation={recommendation}
          onNewRecommendation={onNewRecommendation}
        />
      )}

      {sections.stats && (
        <RecommendationStats 
          recommendation={recommendation}
          layout={layout === 'compact' ? 'horizontal' : 'grid'}
          showTrends={layout === 'detailed'}
        />
      )}

      {sections.details && (
        <RecommendationDetails 
          recommendation={recommendation}
          defaultExpanded={layout === 'detailed'}
          showToggle={layout !== 'detailed'}
        />
      )}

      {sections.insights && (
        <RecommendationInsights 
          recommendation={recommendation}
          defaultExpanded={layout === 'detailed'}
          showToggle={layout !== 'detailed'}
          maxInsights={layout === 'compact' ? 3 : 10}
        />
      )}

      {/* Footer */}
      {layout !== 'minimal' && onNewRecommendation && (
        <div className="text-center pt-6 border-t border-muted-200">
          <button
            onClick={onNewRecommendation}
            className="min-w-48 px-4 py-2 border border-muted-300 rounded-lg text-sm font-medium text-muted-700 hover:bg-muted-50 transition-colors"
          >
            Get New Recommendation
          </button>
          <p 
            className="text-xs text-muted-400 mt-2"
            style={{ color: 'var(--foreground)', opacity: 0.6 }}
          >
            Want to try different parameters? Start over with new information.
          </p>
        </div>
      )}
    </div>
  )
}

// Default export is the main component
export default RecommendationCard
'use client'

import React from 'react'
import { 
  Share2, 
  Download, 
  ExternalLink,
  RefreshCw,
  Mail,
  Phone,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import type { ProcessedRecommendation } from '@/lib/types'

// Component props
interface RecommendationActionsProps {
  recommendation: ProcessedRecommendation
  onNewRecommendation?: () => void
  className?: string
}

// Individual action button props
interface ActionButtonProps {
  recommendation: ProcessedRecommendation
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Share button component with native sharing or clipboard fallback
 */
export function ShareButton({ 
  recommendation, 
  variant = 'outline', 
  size = 'lg',
  className = ""
}: ActionButtonProps) {
  const handleShare = async () => {
    const shareText = `I received a life insurance recommendation:\n${recommendation.insuranceTypeDisplay}\nCoverage: ${recommendation.coverageDisplay}\nPremium: ${recommendation.premiumDisplay}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Life Insurance Recommendation',
          text: shareText,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled sharing
        console.log('Share cancelled')
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText)
        // Could trigger a toast notification here
        console.log('Recommendation copied to clipboard')
      } catch (err) {
        console.error('Failed to copy to clipboard:', err)
      }
    }
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleShare} 
      leftIcon={<Share2 className="h-4 w-4" />}
      className={className}
    >
      Share
    </Button>
  )
}

/**
 * Download button component for generating recommendation reports
 */
export function DownloadButton({ 
  recommendation, 
  variant = 'outline', 
  size = 'lg',
  className = ""
}: ActionButtonProps) {
  const handleDownload = () => {
    const annualPremium = recommendation.premiumEstimate * 12
    
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
- Risk Tolerance: ${recommendation.userRiskTolerance.charAt(0).toUpperCase() + recommendation.userRiskTolerance.slice(1)}

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
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleDownload} 
      leftIcon={<Download className="h-4 w-4" />}
      className={className}
    >
      Download
    </Button>
  )
}

/**
 * Get Quote button component (primary CTA)
 */
export function GetQuoteButton({ 
  recommendation, 
  variant = 'primary', 
  size = 'lg',
  className = ""
}: ActionButtonProps) {
  const handleGetQuote = () => {
    // This would typically navigate to a quote form or external provider
    // For now, we'll log the action
    console.log('Get Quote clicked for:', {
      type: recommendation.insuranceType,
      coverage: recommendation.coverageAmount,
      premium: recommendation.premiumEstimate
    })
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleGetQuote}
      leftIcon={<ExternalLink className="h-4 w-4" />}
      className={className}
    >
      Get Quote
    </Button>
  )
}

/**
 * New Recommendation button component
 */
export function NewRecommendationButton({ 
  onNewRecommendation,
  variant = 'outline', 
  size = 'md',
  className = ""
}: { 
  onNewRecommendation?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success'
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onNewRecommendation}
      leftIcon={<RefreshCw className="h-4 w-4" />}
      className={className}
    >
      Get New Recommendation
    </Button>
  )
}

/**
 * Contact actions for follow-up (email, phone, schedule)
 */
export function ContactActions({ 
  recommendation,
  className = ""
}: {
  recommendation: ProcessedRecommendation
  className?: string
}) {
  const handleEmailContact = () => {
    const subject = encodeURIComponent('Life Insurance Recommendation Follow-up')
    const body = encodeURIComponent(`Hi, I received a recommendation for ${recommendation.insuranceTypeDisplay} with ${recommendation.coverageDisplay} coverage. I'd like to learn more about next steps.`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const handlePhoneContact = () => {
    console.log('Phone contact requested')
  }

  const handleScheduleCall = () => {
    console.log('Schedule call requested')
  }

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <h4 className="text-sm font-medium text-muted-700 dark:text-muted-300">
        Need Help?
      </h4>
      <div className="flex flex-col space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEmailContact}
          leftIcon={<Mail className="h-3 w-3" />}
          className="justify-start text-xs"
        >
          Email an advisor
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePhoneContact}
          leftIcon={<Phone className="h-3 w-3" />}
          className="justify-start text-xs"
        >
          Request callback
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleScheduleCall}
          leftIcon={<Calendar className="h-3 w-3" />}
          className="justify-start text-xs"
        >
          Schedule consultation
        </Button>
      </div>
    </div>
  )
}

/**
 * Main recommendation actions component
 * Combines all action buttons in a responsive layout
 */
export function RecommendationActions({ 
  recommendation, 
  onNewRecommendation, 
  className = "" 
}: RecommendationActionsProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Primary Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <GetQuoteButton 
          recommendation={recommendation} 
          className="flex-1" 
        />
        <ShareButton 
          recommendation={recommendation} 
        />
        <DownloadButton 
          recommendation={recommendation} 
        />
      </div>

      {/* Secondary Actions */}
      <div className="pt-4 border-t border-muted-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <NewRecommendationButton 
            onNewRecommendation={onNewRecommendation}
            size="sm"
          />
          
          <ContactActions 
            recommendation={recommendation}
            className="w-full sm:w-auto"
          />
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="text-center pt-2">
        <p 
          className="text-xs text-muted-400"
          style={{ color: 'var(--foreground)', opacity: 0.6 }}
        >
          This is an estimate. Final rates may vary based on underwriting and health assessment.
        </p>
      </div>
    </div>
  )
}

/**
 * Compact actions for smaller displays or list views
 */
export function CompactRecommendationActions({ 
  recommendation, 
  onNewRecommendation, 
  className = "" 
}: RecommendationActionsProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex space-x-2">
        <GetQuoteButton 
          recommendation={recommendation} 
          size="sm"
        />
        <ShareButton 
          recommendation={recommendation} 
          size="sm"
        />
      </div>
      
      <NewRecommendationButton 
        onNewRecommendation={onNewRecommendation}
        variant="ghost"
        size="sm"
      />
    </div>
  )
}

/**
 * Actions with custom layout for specific use cases
 */
export function CustomRecommendationActions({
  recommendation,
  onNewRecommendation,
  layout = 'primary',
  showContact = true,
  showDownload = true,
  className = ""
}: RecommendationActionsProps & {
  layout?: 'primary' | 'horizontal' | 'vertical' | 'minimal'
  showContact?: boolean
  showDownload?: boolean
}) {
  if (layout === 'minimal') {
    return (
      <div className={`flex space-x-2 ${className}`}>
        <GetQuoteButton recommendation={recommendation} size="sm" />
        <ShareButton recommendation={recommendation} size="sm" />
      </div>
    )
  }

  if (layout === 'horizontal') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        <GetQuoteButton recommendation={recommendation} size="sm" />
        <ShareButton recommendation={recommendation} size="sm" />
        {showDownload && <DownloadButton recommendation={recommendation} size="sm" />}
        <NewRecommendationButton onNewRecommendation={onNewRecommendation} size="sm" />
      </div>
    )
  }

  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col space-y-2 ${className}`}>
        <GetQuoteButton recommendation={recommendation} />
        <div className="flex space-x-2">
          <ShareButton recommendation={recommendation} />
          {showDownload && <DownloadButton recommendation={recommendation} />}
        </div>
        <NewRecommendationButton onNewRecommendation={onNewRecommendation} />
        {showContact && <ContactActions recommendation={recommendation} />}
      </div>
    )
  }

  // Default layout
  return (
    <RecommendationActions
      recommendation={recommendation}
      onNewRecommendation={onNewRecommendation}
      className={className}
    />
  )
}
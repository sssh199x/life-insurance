import { useState, useCallback, useMemo } from 'react'
import { getRecommendation } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type {
  RecommendationRequest,
  RecommendationResponse,
  ProcessedRecommendation,
  InsuranceType,
} from '@/lib/types'

// Hook state interface
interface UseRecommendationState {
  isLoading: boolean
  error: string | null
  recommendation: ProcessedRecommendation | null
  isSubmitted: boolean
  lastRequestTime: Date | null
  retryCount: number
}

// Hook return interface
interface UseRecommendationReturn extends UseRecommendationState {
  submitRecommendation: (data: RecommendationRequest) => Promise<ProcessedRecommendation | null>
  clearRecommendation: () => void
  clearError: () => void
  retry: () => Promise<ProcessedRecommendation | null>
  canRetry: boolean
}

/**
 * Transform backend response to frontend-friendly format
 */
function transformRecommendationResponse(response: RecommendationResponse): ProcessedRecommendation {
  const { user, recommendation } = response.data
  
  const insuranceType = recommendation.insuranceType
  const coverageAmount = recommendation.coverageAmount  
  const termLengthYears = recommendation.termLengthYears
  const premiumEstimate = recommendation.premiumEstimate
  const explanation = recommendation.explanation
  const confidenceScore = recommendation.confidenceScore
  
  // Extract user data
  const userAge = user.age
  const userIncome = user.annualIncome
  const userDependents = user.numberOfDependents
  const userRiskTolerance = user.riskTolerance
  
  // Generate recommendation ID
  const recommendationId = recommendation.id || Date.now()
  
  // Additional debug logging
  console.log('🔍 Extracted values:', {
    userAge,
    userIncome, 
    userDependents,
    userRiskTolerance,
    insuranceType,
    coverageAmount,
    premiumEstimate
  })

  // Transform insurance type to display format
  const getInsuranceTypeDisplay = (type: InsuranceType): string => {
    switch (type) {
      case 'term_life':
        return 'Term Life Insurance'
      case 'whole_life':
        return 'Whole Life Insurance'
      case 'universal_life':
        return 'Universal Life Insurance'
    }
  }

  // Format term length
  const getTermDisplay = (termLength: number | null): string | null => {
    if (!termLength || termLength <= 0) return null
    return `${termLength} year${termLength !== 1 ? 's' : ''}`
  }

  // Validate required fields
  if (!insuranceType || coverageAmount === undefined || premiumEstimate === undefined) {
    console.error('❌ Missing required fields in backend response:', {
      insuranceType,
      coverageAmount,
      premiumEstimate
    })
    throw new Error('Invalid recommendation data received from server')
  }

  if (userAge === undefined || userIncome === undefined || userDependents === undefined) {
    console.error('❌ Missing required user fields in backend response:', {
      userAge,
      userIncome,
      userDependents,
      userRiskTolerance
    })
    throw new Error('Invalid user data received from server')
  }

  return {
    // Core recommendation data
    insuranceType: insuranceType,
    insuranceTypeDisplay: getInsuranceTypeDisplay(insuranceType),
    coverageAmount: coverageAmount,
    coverageDisplay: formatCurrency(coverageAmount),
    termLength: termLengthYears,
    termDisplay: getTermDisplay(termLengthYears),
    premiumEstimate: premiumEstimate,
    premiumDisplay: `${formatCurrency(premiumEstimate)}/month`,
    explanation: explanation,
    confidenceScore: confidenceScore,
    confidenceDisplay: `${Math.round(confidenceScore * 100)}%`,

    // User context
    userAge: userAge,
    userIncome: userIncome,
    userDependents: userDependents,
    userRiskTolerance: userRiskTolerance,

    // Metadata
    createdAt: new Date().toISOString(),
    recommendationId: recommendationId,
  }
}

/**
 * Main recommendation hook
 */
export function useRecommendation(): UseRecommendationReturn {
  const [state, setState] = useState<UseRecommendationState>({
    isLoading: false,
    error: null,
    recommendation: null,
    isSubmitted: false,
    lastRequestTime: null,
    retryCount: 0,
  })

  // Store last request data for retry functionality
  const [lastRequestData, setLastRequestData] = useState<RecommendationRequest | null>(null)

  // Submit recommendation request
  const submitRecommendation = useCallback(async (data: RecommendationRequest): Promise<ProcessedRecommendation | null> => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      lastRequestTime: new Date(),
    }))
    setLastRequestData(data)

    try {
      console.log('🚀 Submitting recommendation request:', data)
      const response = await getRecommendation(data)
      console.log('✅ Received response:', response)
      
      const processedRecommendation = transformRecommendationResponse(response)
      console.log('🔄 Processed recommendation:', processedRecommendation)

      setState(prev => ({
        ...prev,
        isLoading: false,
        recommendation: processedRecommendation,
        isSubmitted: true,
        retryCount: 0,
      }))

      return processedRecommendation
    } catch (error) {
      console.error('❌ Recommendation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to get recommendation'
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        retryCount: prev.retryCount + 1,
      }))
      
      return null
    }
  }, [])

  // Retry last request
  const retry = useCallback(async (): Promise<ProcessedRecommendation | null> => {
    if (!lastRequestData) {
      setState(prev => ({ ...prev, error: 'No previous request to retry' }))
      return null
    }
    return submitRecommendation(lastRequestData)
  }, [lastRequestData, submitRecommendation])

  // Clear recommendation
  const clearRecommendation = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      recommendation: null,
      isSubmitted: false,
      lastRequestTime: null,
      retryCount: 0,
    })
    setLastRequestData(null)
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Can retry logic
  const canRetry = useMemo(() => {
    return Boolean(lastRequestData && state.error && state.retryCount < 3)
  }, [lastRequestData, state.error, state.retryCount])

  return {
    ...state,
    submitRecommendation,
    clearRecommendation,
    clearError,
    retry,
    canRetry,
  }
}

/**
 * Hook for recommendation validation before submission
 */
export function useRecommendationValidation() {
  const validateRecommendationData = useCallback((data: Partial<RecommendationRequest>): {
    isValid: boolean
    errors: Record<string, string>
  } => {
    const errors: Record<string, string> = {}

    // Age validation
    if (!data.age) {
      errors.age = 'Age is required'
    } else if (data.age < 18 || data.age > 100) {
      errors.age = 'Age must be between 18 and 100'
    }

    // Income validation
    if (data.annualIncome === undefined || data.annualIncome === null) {
      errors.annualIncome = 'Annual income is required'
    } else if (data.annualIncome < 0) {
      errors.annualIncome = 'Annual income cannot be negative'
    }

    // Dependents validation
    if (data.numberOfDependents === undefined || data.numberOfDependents === null) {
      errors.numberOfDependents = 'Number of dependents is required'
    } else if (data.numberOfDependents < 0 || data.numberOfDependents > 20) {
      errors.numberOfDependents = 'Number of dependents must be between 0 and 20'
    }

    // Risk tolerance validation
    if (!data.riskTolerance) {
      errors.riskTolerance = 'Risk tolerance is required'
    } else if (!['low', 'medium', 'high'].includes(data.riskTolerance)) {
      errors.riskTolerance = 'Please select a valid risk tolerance'
    }

    // Cross-field validation
    if (data.age && data.numberOfDependents) {
      if (data.age < 25 && data.numberOfDependents > 3) {
        errors.numberOfDependents = 'Large number of dependents for this age range'
      }
    }

    if (data.annualIncome && data.numberOfDependents && data.numberOfDependents > 0) {
      const incomePerDependent = data.annualIncome / data.numberOfDependents
      if (incomePerDependent < 10000) {
        errors.annualIncome = 'Income may be low for the number of dependents'
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }, [])

  return { validateRecommendationData }
}

/**
 * Hook for recommendation analytics/insights
 */
export function useRecommendationInsights(recommendation: ProcessedRecommendation | null) {
  const insights = useMemo(() => {
    if (!recommendation) return null

    const {
      coverageAmount,
      userIncome,
      userAge,
      userDependents,
      premiumEstimate,
      confidenceScore,
      insuranceType,
    } = recommendation

    // Calculate coverage ratio
    const coverageRatio = coverageAmount / userIncome

    // Calculate premium as percentage of income
    const annualPremium = premiumEstimate * 12
    const premiumRatio = annualPremium / userIncome

    // Generate insights
    const insights = []

    // Coverage ratio insights
    if (coverageRatio >= 10) {
      insights.push({
        type: 'positive' as const,
        title: 'Excellent Coverage',
        message: `Your coverage is ${coverageRatio.toFixed(1)}x your annual income, providing strong financial protection.`
      })
    } else if (coverageRatio >= 7) {
      insights.push({
        type: 'neutral' as const,
        title: 'Good Coverage',
        message: `Your coverage is ${coverageRatio.toFixed(1)}x your annual income, which meets industry standards.`
      })
    } else {
      insights.push({
        type: 'warning' as const,
        title: 'Consider Higher Coverage',
        message: `Your coverage is ${coverageRatio.toFixed(1)}x your annual income. Consider increasing for better protection.`
      })
    }

    // Premium affordability
    if (premiumRatio <= 0.02) { // 2% of income
      insights.push({
        type: 'positive' as const,
        title: 'Affordable Premium',
        message: `Premiums are only ${(premiumRatio * 100).toFixed(1)}% of your income, very manageable.`
      })
    } else if (premiumRatio <= 0.05) { // 5% of income
      insights.push({
        type: 'neutral' as const,
        title: 'Reasonable Premium',
        message: `Premiums are ${(premiumRatio * 100).toFixed(1)}% of your income, within acceptable range.`
      })
    } else {
      insights.push({
        type: 'warning' as const,
        title: 'High Premium Cost',
        message: `Premiums are ${(premiumRatio * 100).toFixed(1)}% of your income. Consider term life for lower costs.`
      })
    }

    // Age-based insights
    if (userAge < 30) {
      insights.push({
        type: 'positive' as const,
        title: 'Great Time to Start',
        message: 'Starting life insurance at your age locks in low premiums for years to come.'
      })
    } else if (userAge > 50 && insuranceType === 'term_life') {
      insights.push({
        type: 'neutral' as const,
        title: 'Consider Permanent Insurance',
        message: 'At your age, whole or universal life insurance might provide better long-term value.'
      })
    }

    // Dependents insights
    if (userDependents === 0 && coverageAmount > userIncome * 5) {
      insights.push({
        type: 'neutral' as const,
        title: 'High Coverage for No Dependents',
        message: 'Consider if this much coverage is necessary without dependents to protect.'
      })
    }

    // Confidence insights
    if (confidenceScore >= 0.9) {
      insights.push({
        type: 'positive' as const,
        title: 'High Confidence Recommendation',
        message: 'This recommendation is well-suited to your profile and needs.'
      })
    } else if (confidenceScore < 0.7) {
      insights.push({
        type: 'warning' as const,
        title: 'Consider Professional Consultation',
        message: 'Your situation may benefit from speaking with a licensed insurance advisor.'
      })
    }

    return insights
  }, [recommendation])

  return { insights }
}

/**
 * Hook for comparing multiple recommendations
 */
export function useRecommendationComparison(recommendations: ProcessedRecommendation[]) {
  const comparison = useMemo(() => {
    if (recommendations.length < 2) return null

    const sorted = [...recommendations].sort((a, b) => b.confidenceScore - a.confidenceScore)
    const best = sorted[0]
    const alternatives = sorted.slice(1)

    return {
      best,
      alternatives,
      totalOptions: recommendations.length,
    }
  }, [recommendations])

  return { comparison }
}
'use client'

import React from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TrendingUp } from 'lucide-react'

// Extracted form components
import { 
  ComprehensiveFormFields,
  FormValidationDisplay,
  FormStateManager,
} from '@/components/forms'

// UI Components
import { Button, Card, CardHeader, CardTitle, CardContent, LoadingSpinner } from '@/components/ui'

// Hooks and utilities
import { useRecommendation, useRecommendationValidation } from '@/hooks/use-recommendation'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { formDataSchema } from '@/lib/validations'
import { parseCurrencyInput } from '@/lib/utils'
import { DEFAULT_FORM_VALUES } from '@/lib/constants/form-options'

// Types
import type { 
  FormData, 
  RecommendationRequest, 
  ProcessedRecommendation 
} from '@/lib/types'

// Component props
interface InsuranceFormProps {
  onRecommendationReceived?: (recommendation: ProcessedRecommendation) => void
  className?: string
}

/**
 * Main Insurance Form Component
 */
export function InsuranceForm({ onRecommendationReceived, className }: InsuranceFormProps) {
  // Hooks for functionality
  const { 
    submitRecommendation, 
    isLoading, 
    error, 
    clearError,
    retry,
    canRetry 
  } = useRecommendation()
  
  const { validateRecommendationData } = useRecommendationValidation()
  const { sessionId, isLoaded: storageLoaded } = useLocalStorage()

  // Form setup with React Hook Form + Zod
  const form = useForm<FormData>({
    resolver: zodResolver(formDataSchema) as any,
    defaultValues: DEFAULT_FORM_VALUES,
    mode: 'onChange'
  })

  const { control, handleSubmit, watch, setValue, setError, formState: { errors, isValid, isDirty } } = form

  // Form submission handler
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      // Transform data (handle Zod transformation manually)
      const transformedData = {
        age: typeof data.age === 'string' ? parseInt(data.age, 10) : data.age,
        annualIncome: typeof data.annualIncome === 'string' ? parseCurrencyInput(data.annualIncome) : data.annualIncome,
        numberOfDependents: data.numberOfDependents,
        riskTolerance: data.riskTolerance,
      }

      const requestData: RecommendationRequest = {
        ...transformedData,
        sessionId: sessionId,
      }

      // Validate request
      const validation = validateRecommendationData(requestData)
      if (!validation.isValid) {
        Object.entries(validation.errors).forEach(([field, message]) => {
          setError(field as keyof FormData, { message })
        })
        return
      }

      // Submit to API
      const recommendation = await submitRecommendation(requestData)
      
      if (recommendation && onRecommendationReceived) {
        onRecommendationReceived(recommendation)
      }
    } catch (err) {
      console.error('Form submission error:', err)
    }
  }

  // Loading state while storage initializes
  if (!storageLoaded) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-full max-w-2xl mx-auto my-2 ${className || ''}`}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center dark:text-muted-700 text-muted-900">
          Get Your Life Insurance Recommendation
        </CardTitle>
        <p className="text-center dark:text-muted-700 text-muted-900 mt-2" style={{ opacity: 0.8 }}>
          Answer a few questions to receive a personalized insurance recommendation
        </p>
      </CardHeader>

      <CardContent>
        <FormStateManager
          watch={watch}
          setValue={setValue}
          isDirty={isDirty}
          isValid={isValid}
          isSubmitting={isLoading}
          clearError={clearError}
        >
          {() => (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Form Fields */}
              <ComprehensiveFormFields control={control} errors={errors} />

              {/* Validation and Status Display */}
              <FormValidationDisplay
                validationState={{
                  errors: {},
                  touched: {},
                  isValid,
                  isDirty,
                  isSubmitting: isLoading
                }}
                apiError={error}
                canRetry={canRetry}
                onRetry={retry}
                sessionId={sessionId}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={isLoading}
                disabled={!isValid}
                leftIcon={!isLoading ? <TrendingUp className="h-4 w-4" /> : undefined}
              >
                {isLoading ? 'Getting Your Recommendation...' : 'Get My Recommendation'}
              </Button>
            </form>
          )}
        </FormStateManager>
      </CardContent>
    </Card>
  )
}
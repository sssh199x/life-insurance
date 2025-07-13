'use client'

import React, { useEffect } from 'react'
import { useForm, Controller, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, DollarSign, TrendingUp } from 'lucide-react'

import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent, LoadingSpinner } from '@/components/ui'
import { useRecommendation, useRecommendationValidation } from '@/hooks/use-recommendation'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { formDataSchema } from '@/lib/validations'
import { formatCurrencyInput, parseCurrencyInput, debounce } from '@/lib/utils'
import type { 
  FormData, 
  SelectOption, 
  RecommendationRequest, 
  RiskTolerance,
  ProcessedRecommendation 
} from '@/lib/types'

// Risk tolerance options for the select dropdown
const riskToleranceOptions: SelectOption[] = [
  {
    value: 'low',
    label: 'Low Risk',
    description: 'Conservative approach, prioritize safety and guaranteed returns',
    icon: <TrendingUp className="h-4 w-4 text-blue-500" />
  },
  {
    value: 'medium', 
    label: 'Medium Risk',
    description: 'Balanced approach, moderate growth with acceptable risk',
    icon: <TrendingUp className="h-4 w-4 text-green-500" />
  },
  {
    value: 'high',
    label: 'High Risk',
    description: 'Aggressive approach, maximum growth potential with higher risk',
    icon: <TrendingUp className="h-4 w-4 text-orange-500" />
  }
]

// Dependents options for easy selection
const dependentsOptions: SelectOption[] = [
  { value: '0', label: '0 - No dependents' },
  { value: '1', label: '1 dependent' },
  { value: '2', label: '2 dependents' },
  { value: '3', label: '3 dependents' },
  { value: '4', label: '4 dependents' },
  { value: '5', label: '5+ dependents' },
]

// Component props
interface InsuranceFormProps {
  onRecommendationReceived?: (recommendation: ProcessedRecommendation) => void
  className?: string
}

// Main Insurance Form Component
export function InsuranceForm({ onRecommendationReceived, className }: InsuranceFormProps) {
  // Hooks
  const { 
    submitRecommendation, 
    isLoading, 
    error, 
    clearError,
    retry,
    canRetry 
  } = useRecommendation()
  
  const { validateRecommendationData } = useRecommendationValidation()
  const { formData, saveFormData, sessionId, isLoaded: storageLoaded } = useLocalStorage()

  // Form setup with React Hook Form + Zod
  // Note: Zod will transform string inputs to numbers, but we handle this in onSubmit
  const form = useForm<FormData>({
    resolver: zodResolver(formDataSchema) as any, // Type assertion to handle Zod transformation
    defaultValues: {
      age: '',
      annualIncome: '',
      numberOfDependents: 0,
      riskTolerance: 'medium' as RiskTolerance,
    },
    mode: 'onChange', // Validate on change for real-time feedback
  })

  const { control, handleSubmit, watch, setValue, formState: { errors, isValid, isDirty } } = form

  // Watch all form values for auto-save
  const watchedValues = watch()

  // Load saved form data when storage is ready
  useEffect(() => {
    if (storageLoaded && formData) {
      if (formData.age) setValue('age', formData.age)
      if (formData.annualIncome) setValue('annualIncome', formData.annualIncome)
      if (formData.numberOfDependents !== undefined) setValue('numberOfDependents', formData.numberOfDependents)
      if (formData.riskTolerance) setValue('riskTolerance', formData.riskTolerance)
    }
  }, [storageLoaded, formData, setValue])

  // Auto-save form data (debounced)
  const debouncedSave = React.useMemo(
    () => debounce((data: Partial<FormData>) => {
      if (isDirty) {
        saveFormData(data)
      }
    }, 1000),
    [saveFormData, isDirty]
  )

  // Save form data when values change
  useEffect(() => {
    debouncedSave(watchedValues)
  }, [watchedValues, debouncedSave])

  // Clear API errors when form changes
  useEffect(() => {
    if (error && isDirty) {
      clearError()
    }
  }, [watchedValues, error, isDirty, clearError])

  // Format currency input
  const handleIncomeChange = (value: string) => {
    // Remove non-numeric characters except commas
    const cleaned = value.replace(/[^0-9,]/g, '')
    
    // Parse to number and reformat
    const number = parseCurrencyInput(cleaned)
    const formatted = number > 0 ? formatCurrencyInput(number) : ''
    
    return formatted
  }

  // Form submission handler - handle Zod transformation manually
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      // Manually transform the data since Zod transformation doesn't work well with RHF types
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

      // Additional validation
      const validation = validateRecommendationData(requestData)
      if (!validation.isValid) {
        // Set form errors
        Object.entries(validation.errors).forEach(([field, message]) => {
          form.setError(field as keyof FormData, { message })
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

  // Loading state
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
        <CardTitle 
          className="text-2xl font-bold text-center dark:text-muted-700 text-muted-900"
        >
          Get Your Life Insurance Recommendation
        </CardTitle>
        <p 
          className="text-center dark:text-muted-700 text-muted-900 mt-2"
          style={{  opacity: 0.8 }}
        >
          Answer a few questions to receive a personalized insurance recommendation
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Age Input */}
          <div>
            <Controller
              control={control}
              name="age"
              render={({ field }) => (
                <Input
                  {...field}
                  label="Age"
                  placeholder="Enter your age"
                  type="number"
                  min="18"
                  max="100"
                  leftIcon={<User className="h-4 w-4" />}
                  error={errors.age?.message}
                  helperText="Must be between 18 and 100 years old"
                  required
                />
              )}
            />
          </div>

          {/* Annual Income Input */}
          <div>
            <Controller
              control={control}
              name="annualIncome"
              render={({ field }) => (
                <Input
                  {...field}
                  label="Annual Income"
                  placeholder="Enter your annual income"
                  leftIcon={<DollarSign className="h-4 w-4" />}
                  error={errors.annualIncome?.message}
                  helperText="Your gross annual income before taxes"
                  onChange={(e) => {
                    const formatted = handleIncomeChange(e.target.value)
                    field.onChange(formatted)
                  }}
                  required
                />
              )}
            />
          </div>

          {/* Number of Dependents Select */}
          <div>
            <Controller
              control={control}
              name="numberOfDependents"
              render={({ field }) => (
                <div className="space-y-2">
                  <label 
                    className="text-sm font-medium text-muted-900 dark:text-muted-700"
                  >
                    Number of Dependents
                    <span className="ml-1 text-red-400" aria-label="required">*</span>
                  </label>
                  
                  <Select
                    options={dependentsOptions}
                    value={field.value.toString()}
                    onChange={(value) => field.onChange(parseInt(value, 10))}
                    placeholder="Select number of dependents"
                    error={errors.numberOfDependents?.message}
                    helperText="Include spouse, children, and anyone financially dependent on you"
                  />
                </div>
              )}
            />
          </div>

          {/* Risk Tolerance Select */}
          <div>
            <Controller
              control={control}
              name="riskTolerance"
              render={({ field }) => (
                <div className="space-y-2">
                  <label 
                    className="text-sm font-medium text-muted-900 dark:text-muted-700"
                  >
                    Risk Tolerance
                    <span className="ml-1 text-red-400" aria-label="required">*</span>
                  </label>
                  
                  <Select
                    options={riskToleranceOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select your risk tolerance"
                    error={errors.riskTolerance?.message}
                    helperText="How comfortable are you with investment risk?"
                  />
                </div>
              )}
            />
          </div>

          {/* API Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    Unable to get recommendation
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    {error}
                  </p>
                </div>
              </div>
              
              {canRetry && (
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={retry}
                    loading={isLoading}
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Form Status */}
          <div className="flex items-center justify-between text-sm text-muted-400">
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${isDirty ? 'bg-orange-400' : 'bg-green-400'}`} />
              <span>{isDirty ? 'Changes not saved' : 'Form auto-saved'}</span>
            </div>
            <div>
              {isValid ? (
                <span className="text-green-400">✓ Ready to submit</span>
              ) : (
                <span>Please complete all fields</span>
              )}
            </div>
          </div>

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

          {/* Form Footer */}
          <div className="text-center text-xs text-muted-400 pt-4 border-t border-muted-200">
            <p>
              Your information is secure and will only be used to generate your recommendation.
              <br />
              Session ID: <code className="bg-muted-100 px-1 rounded">{sessionId.slice(-8)}</code>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
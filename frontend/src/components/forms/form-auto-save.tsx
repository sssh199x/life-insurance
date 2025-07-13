'use client'

import React, { useEffect, useMemo } from 'react'
import { UseFormWatch, UseFormSetValue } from 'react-hook-form'
import { debounce } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { DEFAULT_FORM_VALUES, FORM_CONFIG } from '@/lib/constants/form-options'
import type { FormData } from '@/lib/types'

// Props for auto-save hook
interface UseFormAutoSaveProps {
  watch: UseFormWatch<FormData>
  setValue: UseFormSetValue<FormData>
  isDirty: boolean
  clearError?: () => void
}

/**
 * Custom hook for form auto-save functionality
 */
export function useFormAutoSave({ 
  watch, 
  setValue, 
  isDirty, 
  clearError 
}: UseFormAutoSaveProps) {
  const { formData, saveFormData, isLoaded: storageLoaded } = useLocalStorage()
  
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
  const debouncedSave = useMemo(
    () => debounce((data: Partial<FormData>) => {
      if (isDirty) {
        saveFormData(data)
      }
    }, FORM_CONFIG.AUTO_SAVE_DELAY),
    [saveFormData, isDirty]
  )

  // Save form data when values change
  useEffect(() => {
    debouncedSave(watchedValues)
  }, [watchedValues, debouncedSave])

  // Clear API errors when form changes
  useEffect(() => {
    if (clearError && isDirty) {
      clearError()
    }
  }, [watchedValues, clearError, isDirty])

  return {
    isStorageLoaded: storageLoaded,
    hasStoredData: Boolean(formData)
  }
}

// Props for form state manager
interface FormStateManagerProps {
  children: (state: FormStateManagerState) => React.ReactNode
  watch: UseFormWatch<FormData>
  setValue: UseFormSetValue<FormData>
  isDirty: boolean
  isValid: boolean
  isSubmitting: boolean
  clearError?: () => void
}

interface FormStateManagerState {
  isStorageLoaded: boolean
  hasStoredData: boolean
  canSubmit: boolean
  autoSaveStatus: 'saving' | 'saved' | 'idle'
}

/**
 * Form State Manager Component
 * Manages auto-save and provides state to children
 */
export function FormStateManager({
  children,
  watch,
  setValue,
  isDirty,
  isValid,
  isSubmitting,
  clearError
}: FormStateManagerProps) {
  const { isStorageLoaded, hasStoredData } = useFormAutoSave({
    watch,
    setValue,
    isDirty,
    clearError
  })

  const state: FormStateManagerState = {
    isStorageLoaded,
    hasStoredData,
    canSubmit: isValid && !isSubmitting,
    autoSaveStatus: isDirty ? 'saving' : 'saved'
  }

  return <>{children(state)}</>
}

// Props for auto-save indicator
interface AutoSaveIndicatorProps {
  isDirty: boolean
  isSubmitting: boolean
  lastSavedTime?: Date
}

/**
 * Auto-Save Status Indicator
 * Shows current save status to user
 */
export function AutoSaveIndicator({ 
  isDirty, 
  isSubmitting, 
  lastSavedTime 
}: AutoSaveIndicatorProps) {
  const getStatus = () => {
    if (isSubmitting) return { text: 'Submitting...', color: 'text-blue-500', dot: 'bg-blue-400' }
    if (isDirty) return { text: 'Saving changes...', color: 'text-orange-500', dot: 'bg-orange-400' }
    return { text: 'All changes saved', color: 'text-green-500', dot: 'bg-green-400' }
  }

  const status = getStatus()

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${status.dot}`} />
      <span className={status.color}>{status.text}</span>
      {lastSavedTime && !isDirty && !isSubmitting && (
        <span className="text-muted-400">
          • {lastSavedTime.toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}

// Props for form progress
interface FormProgressProps {
  currentStep: number
  totalSteps: number
  completedFields: string[]
  requiredFields: string[]
}

/**
 * Form Progress Indicator
 * Shows how much of the form is completed
 */
export function FormProgress({ 
  currentStep, 
  totalSteps, 
  completedFields, 
  requiredFields 
}: FormProgressProps) {
  const progress = (completedFields.length / requiredFields.length) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-600">Progress</span>
        <span className="text-muted-600">
          {completedFields.length} of {requiredFields.length} fields
        </span>
      </div>
      <div className="w-full bg-muted-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-500">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
    </div>
  )
}

// Props for form session manager
interface FormSessionManagerProps {
  sessionId: string
  onSessionExpired?: () => void
  children: React.ReactNode
}

/**
 * Form Session Manager
 * Handles session timeout and warnings
 */
export function FormSessionManager({ 
  sessionId, 
  onSessionExpired, 
  children 
}: FormSessionManagerProps) {
  const [timeLeft, setTimeLeft] = React.useState<number>(30 * 60) // 30 minutes

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onSessionExpired?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [onSessionExpired])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div>
      {children}
      {timeLeft < 300 && timeLeft > 0 && ( // Show warning in last 5 minutes
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="h-4 w-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-yellow-800">
              Session expires in {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Form Recovery Manager
 * Handles form data recovery and restoration
 */
export function useFormRecovery() {
  const { formData, clearFormData } = useLocalStorage()

  const hasRecoverableData = Boolean(formData && Object.keys(formData).length > 0)

  const recoverFormData = React.useCallback(() => {
    return formData || DEFAULT_FORM_VALUES
  }, [formData])

  const clearRecoveryData = React.useCallback(() => {
    clearFormData()
  }, [clearFormData])

  return {
    hasRecoverableData,
    recoverFormData,
    clearRecoveryData
  }
}
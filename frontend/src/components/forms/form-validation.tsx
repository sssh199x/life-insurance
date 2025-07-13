'use client'

import React from 'react'
import { Button } from '@/components/ui'

// Props for error display component
interface FormErrorDisplayProps {
  error: string | null
  canRetry?: boolean
  isLoading?: boolean
  onRetry?: () => void
}

/**
 * API Error Display Component
 * Shows API errors with retry functionality
 */
export function FormErrorDisplay({ 
  error, 
  canRetry = false, 
  isLoading = false, 
  onRetry 
}: FormErrorDisplayProps) {
  if (!error) return null

  return (
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
      
      {canRetry && onRetry && (
        <div className="mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            loading={isLoading}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}

// Props for form status component
interface FormStatusProps {
  isValid: boolean
  isDirty: boolean
  sessionId: string
}

/**
 * Form Status Component
 * Shows form validation and save status
 */
export function FormStatus({ isValid, isDirty, sessionId }: FormStatusProps) {
  return (
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
  )
}

// Props for form footer component
interface FormFooterProps {
  sessionId: string
}

/**
 * Form Footer Component
 * Shows security notice and session info
 */
export function FormFooter({ sessionId }: FormFooterProps) {
  return (
    <div className="text-center text-xs text-muted-400 pt-4 border-t border-muted-200">
      <p>
        Your information is secure and will only be used to generate your recommendation.
        <br />
        Session ID: <code className="bg-muted-100 px-1 rounded">{sessionId.slice(-8)}</code>
      </p>
    </div>
  )
}

// Props for validation summary
interface ValidationSummaryProps {
  errors: Record<string, string>
  touched?: Record<string, boolean>
}

/**
 * Validation Summary Component
 * Shows all form validation errors in one place
 */
export function ValidationSummary({ errors, touched }: ValidationSummaryProps) {
  const errorEntries = Object.entries(errors)
  
  if (errorEntries.length === 0) return null

  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
      <h4 className="text-sm font-medium text-red-800 mb-2">
        Please fix the following errors:
      </h4>
      <ul className="text-sm text-red-700 space-y-1">
        {errorEntries.map(([field, message]) => (
          <li key={field} className="flex items-center space-x-1">
            <span>•</span>
            <span className="capitalize">{field.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
            <span>{message}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Props for success message
interface SuccessMessageProps {
  message: string
  onDismiss?: () => void
}

/**
 * Success Message Component
 */
export function SuccessMessage({ message, onDismiss }: SuccessMessageProps) {
  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center space-x-2">
        <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">
            Success!
          </p>
          <p className="text-sm text-green-700 mt-1">
            {message}
          </p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-green-400 hover:text-green-600"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

// Props for form validation context
interface FormValidationState {
  errors: Record<string, string>
  touched: Record<string, boolean>
  isValid: boolean
  isDirty: boolean
  isSubmitting: boolean
}

/**
 * Complete Form Validation Display
 * Combines all validation components
 */
export function FormValidationDisplay({
  validationState,
  apiError,
  canRetry,
  onRetry,
  sessionId
}: {
  validationState: FormValidationState
  apiError: string | null
  canRetry: boolean
  onRetry: () => void
  sessionId: string
}) {
  return (
    <div className="space-y-4">
      {/* Validation Summary */}
      <ValidationSummary 
        errors={validationState.errors} 
        touched={validationState.touched} 
      />
      
      {/* API Error Display */}
      <FormErrorDisplay
        error={apiError}
        canRetry={canRetry}
        isLoading={validationState.isSubmitting}
        onRetry={onRetry}
      />
      
      {/* Form Status */}
      <FormStatus
        isValid={validationState.isValid}
        isDirty={validationState.isDirty}
        sessionId={sessionId}
      />
      
      {/* Form Footer */}
      <FormFooter sessionId={sessionId} />
    </div>
  )
}
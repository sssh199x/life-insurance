'use client'

import React from 'react'
import { User, DollarSign } from 'lucide-react'
import { Controller, Control, FieldErrors } from 'react-hook-form'
import { Input, Select } from '@/components/ui'
import { 
  RISK_TOLERANCE_OPTIONS, 
  DEPENDENTS_OPTIONS,
  AGE_FIELD_CONFIG,
  INCOME_FIELD_CONFIG,
  DEPENDENTS_FIELD_CONFIG,
  RISK_TOLERANCE_FIELD_CONFIG,
} from '@/lib/constants/form-options'
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/utils'
import type { FormData } from '@/lib/types'

// Common props for all form fields
interface BaseFieldProps {
  control: Control<FormData>
  errors: FieldErrors<FormData>
}

/**
 * Age input field component
 */
export function AgeField({ control, errors }: BaseFieldProps) {
  return (
    <div>
      <Controller
        control={control}
        name="age"
        render={({ field }) => (
          <Input
            {...field}
            label={AGE_FIELD_CONFIG.label}
            placeholder={AGE_FIELD_CONFIG.placeholder}
            type="number"
            min={AGE_FIELD_CONFIG.validation?.min}
            max={AGE_FIELD_CONFIG.validation?.max}
            leftIcon={<User className="h-4 w-4" />}
            error={errors.age?.message}
            helperText={AGE_FIELD_CONFIG.helperText}
            required={AGE_FIELD_CONFIG.required}
          />
        )}
      />
    </div>
  )
}

/**
 * Annual income input field component with currency formatting
 */
export function IncomeField({ control, errors }: BaseFieldProps) {
  // Format currency input handler
  const handleIncomeChange = (value: string) => {
    // Remove non-numeric characters except commas
    const cleaned = value.replace(/[^0-9,]/g, '')
    
    // Parse to number and reformat
    const number = parseCurrencyInput(cleaned)
    const formatted = number > 0 ? formatCurrencyInput(number) : ''
    
    return formatted
  }

  return (
    <div>
      <Controller
        control={control}
        name="annualIncome"
        render={({ field }) => (
          <Input
            {...field}
            label={INCOME_FIELD_CONFIG.label}
            placeholder={INCOME_FIELD_CONFIG.placeholder}
            leftIcon={<DollarSign className="h-4 w-4" />}
            error={errors.annualIncome?.message}
            helperText={INCOME_FIELD_CONFIG.helperText}
            onChange={(e) => {
              const formatted = handleIncomeChange(e.target.value)
              field.onChange(formatted)
            }}
            required={INCOME_FIELD_CONFIG.required}
          />
        )}
      />
    </div>
  )
}

/**
 * Number of dependents select field component
 */
export function DependentsField({ control, errors }: BaseFieldProps) {
  return (
    <div>
      <Controller
        control={control}
        name="numberOfDependents"
        render={({ field }) => (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-900 dark:text-muted-700">
              {DEPENDENTS_FIELD_CONFIG.label}
              {DEPENDENTS_FIELD_CONFIG.required && (
                <span className="ml-1 text-red-400" aria-label="required">*</span>
              )}
            </label>
            
            <Select
              options={DEPENDENTS_OPTIONS}
              value={field.value.toString()}
              onChange={(value) => field.onChange(parseInt(value, 10))}
              placeholder={DEPENDENTS_FIELD_CONFIG.placeholder}
              error={errors.numberOfDependents?.message}
              helperText={DEPENDENTS_FIELD_CONFIG.helperText}
            />
          </div>
        )}
      />
    </div>
  )
}

/**
 * Risk tolerance select field component
 */
export function RiskToleranceField({ control, errors }: BaseFieldProps) {
  return (
    <div>
      <Controller
        control={control}
        name="riskTolerance"
        render={({ field }) => (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-900 dark:text-muted-700">
              {RISK_TOLERANCE_FIELD_CONFIG.label}
              {RISK_TOLERANCE_FIELD_CONFIG.required && (
                <span className="ml-1 text-red-400" aria-label="required">*</span>
              )}
            </label>
            
            <Select
              options={RISK_TOLERANCE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              placeholder={RISK_TOLERANCE_FIELD_CONFIG.placeholder}
              error={errors.riskTolerance?.message}
              helperText={RISK_TOLERANCE_FIELD_CONFIG.helperText}
            />
          </div>
        )}
      />
    </div>
  )
}

/**
 * Combined form fields component for easy usage
 */
interface FormFieldsProps extends BaseFieldProps {
  /**
   * Which fields to render (all by default)
   */
  fields?: {
    age?: boolean
    income?: boolean
    dependents?: boolean
    riskTolerance?: boolean
  }
}

export function FormFields({ 
  control, 
  errors, 
  fields = { age: true, income: true, dependents: true, riskTolerance: true } 
}: FormFieldsProps) {
  return (
    <div className="space-y-6">
      {fields.age && <AgeField control={control} errors={errors} />}
      {fields.income && <IncomeField control={control} errors={errors} />}
      {fields.dependents && <DependentsField control={control} errors={errors} />}
      {fields.riskTolerance && <RiskToleranceField control={control} errors={errors} />}
    </div>
  )
}

/**
 * Quick form fields for simple use cases
 */
export function BasicFormFields({ control, errors }: BaseFieldProps) {
  return (
    <FormFields 
      control={control} 
      errors={errors}
      fields={{ age: true, income: true, dependents: false, riskTolerance: true }}
    />
  )
}

/**
 * Comprehensive form fields with all options
 */
export function ComprehensiveFormFields({ control, errors }: BaseFieldProps) {
  return (
    <FormFields 
      control={control} 
      errors={errors}
      fields={{ age: true, income: true, dependents: true, riskTolerance: true }}
    />
  )
}
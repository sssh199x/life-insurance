import React from 'react'
import { TrendingUp } from 'lucide-react'
import type { SelectOption, RiskTolerance } from '@/lib/types'

// Age validation constraints
export const AGE_LIMITS = {
  MIN: 18,
  MAX: 100
} as const

// Income validation constraints
export const INCOME_LIMITS = {
  MIN: 0,
  MAX: 10000000 // $10M max for practical purposes
} as const

// Dependents validation constraints
export const DEPENDENTS_LIMITS = {
  MIN: 0,
  MAX: 20
} as const

// Risk tolerance options for select dropdown
export const RISK_TOLERANCE_OPTIONS: SelectOption[] = [
  {
    value: 'low',
    label: 'Low Risk',
    description: 'Conservative approach, prioritize safety and guaranteed returns',
    icon: React.createElement(TrendingUp, { 
      className: "h-4 w-4 text-blue-500" 
    })
  },
  {
    value: 'medium', 
    label: 'Medium Risk',
    description: 'Balanced approach, moderate growth with acceptable risk',
    icon: React.createElement(TrendingUp, { 
      className: "h-4 w-4 text-green-500" 
    })
  },
  {
    value: 'high',
    label: 'High Risk',
    description: 'Aggressive approach, maximum growth potential with higher risk',
    icon: React.createElement(TrendingUp, { 
      className: "h-4 w-4 text-orange-500" 
    })
  }
]

// Dependents options for easy selection
export const DEPENDENTS_OPTIONS: SelectOption[] = [
  { value: '0', label: '0 - No dependents' },
  { value: '1', label: '1 dependent' },
  { value: '2', label: '2 dependents' },
  { value: '3', label: '3 dependents' },
  { value: '4', label: '4 dependents' },
  { value: '5', label: '5+ dependents' },
]

// Form field configuration for consistent validation
export interface FormFieldConfig {
  name: string
  label: string
  placeholder: string
  required: boolean
  helperText?: string
  validation?: {
    min?: number
    max?: number
    pattern?: RegExp
    message?: string
  }
}

// Age field configuration
export const AGE_FIELD_CONFIG: FormFieldConfig = {
  name: 'age',
  label: 'Age',
  placeholder: 'Enter your age',
  required: true,
  helperText: `Must be between ${AGE_LIMITS.MIN} and ${AGE_LIMITS.MAX} years old`,
  validation: {
    min: AGE_LIMITS.MIN,
    max: AGE_LIMITS.MAX,
    message: `Age must be between ${AGE_LIMITS.MIN} and ${AGE_LIMITS.MAX}`
  }
}

// Annual income field configuration
export const INCOME_FIELD_CONFIG: FormFieldConfig = {
  name: 'annualIncome',
  label: 'Annual Income',
  placeholder: 'Enter your annual income',
  required: true,
  helperText: 'Your gross annual income before taxes',
  validation: {
    min: INCOME_LIMITS.MIN,
    max: INCOME_LIMITS.MAX,
    message: 'Please enter a valid annual income'
  }
}

// Number of dependents field configuration
export const DEPENDENTS_FIELD_CONFIG: FormFieldConfig = {
  name: 'numberOfDependents',
  label: 'Number of Dependents',
  placeholder: 'Select number of dependents',
  required: true,
  helperText: 'Include spouse, children, and anyone financially dependent on you',
  validation: {
    min: DEPENDENTS_LIMITS.MIN,
    max: DEPENDENTS_LIMITS.MAX,
    message: `Number of dependents must be between ${DEPENDENTS_LIMITS.MIN} and ${DEPENDENTS_LIMITS.MAX}`
  }
}

// Risk tolerance field configuration
export const RISK_TOLERANCE_FIELD_CONFIG: FormFieldConfig = {
  name: 'riskTolerance',
  label: 'Risk Tolerance',
  placeholder: 'Select your risk tolerance',
  required: true,
  helperText: 'How comfortable are you with investment risk?'
}

// All form fields configuration array
export const FORM_FIELD_CONFIGS: FormFieldConfig[] = [
  AGE_FIELD_CONFIG,
  INCOME_FIELD_CONFIG,
  DEPENDENTS_FIELD_CONFIG,
  RISK_TOLERANCE_FIELD_CONFIG
]

// Validation error messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_AGE: `Age must be between ${AGE_LIMITS.MIN} and ${AGE_LIMITS.MAX}`,
  INVALID_INCOME: 'Please enter a valid income amount',
  INVALID_DEPENDENTS: `Number of dependents must be between ${DEPENDENTS_LIMITS.MIN} and ${DEPENDENTS_LIMITS.MAX}`,
  INVALID_RISK_TOLERANCE: 'Please select a valid risk tolerance',
  
  // Cross-field validation messages
  HIGH_DEPENDENTS_YOUNG_AGE: 'Large number of dependents for this age range',
  LOW_INCOME_HIGH_DEPENDENTS: 'Income may be low for the number of dependents',
  
  // Format validation messages
  INVALID_NUMBER: 'Please enter a valid number',
  NEGATIVE_VALUE: 'Value cannot be negative',
  VALUE_TOO_LARGE: 'Value is too large'
} as const

// Form validation thresholds for cross-field validation
export const VALIDATION_THRESHOLDS = {
  YOUNG_AGE_THRESHOLD: 25,
  MAX_DEPENDENTS_FOR_YOUNG: 3,
  MIN_INCOME_PER_DEPENDENT: 10000
} as const

// Risk tolerance mapping for better type safety
export const RISK_TOLERANCE_MAP: Record<RiskTolerance, { 
  label: string
  description: string
  color: string
}> = {
  low: {
    label: 'Low Risk',
    description: 'Conservative approach, prioritize safety',
    color: 'text-blue-500'
  },
  medium: {
    label: 'Medium Risk', 
    description: 'Balanced approach, moderate growth',
    color: 'text-green-500'
  },
  high: {
    label: 'High Risk',
    description: 'Aggressive approach, maximum growth',
    color: 'text-orange-500'
  }
}

// Default form values
export const DEFAULT_FORM_VALUES = {
  age: '',
  annualIncome: '',
  numberOfDependents: 0,
  riskTolerance: 'medium' as RiskTolerance
} as const

// Form submission configuration
export const FORM_CONFIG = {
  AUTO_SAVE_DELAY: 1000, // 1 second debounce for auto-save
  VALIDATION_MODE: 'onChange' as const, // Real-time validation
  SUBMIT_TIMEOUT: 30000, // 30 second timeout for form submission
  MAX_RETRY_ATTEMPTS: 3
} as const

// Helper functions for form validation
export const FORM_HELPERS = {
  /**
   * Check if age is in valid range
   */
  isValidAge: (age: number): boolean => {
    return age >= AGE_LIMITS.MIN && age <= AGE_LIMITS.MAX
  },

  /**
   * Check if income is valid
   */
  isValidIncome: (income: number): boolean => {
    return income >= INCOME_LIMITS.MIN && income <= INCOME_LIMITS.MAX
  },

  /**
   * Check if dependents count is valid
   */
  isValidDependents: (dependents: number): boolean => {
    return dependents >= DEPENDENTS_LIMITS.MIN && dependents <= DEPENDENTS_LIMITS.MAX
  },

  /**
   * Check if risk tolerance is valid
   */
  isValidRiskTolerance: (riskTolerance: string): riskTolerance is RiskTolerance => {
    return ['low', 'medium', 'high'].includes(riskTolerance)
  },

  /**
   * Cross-field validation: check if dependents count is reasonable for age
   */
  isReasonableDependentsForAge: (age: number, dependents: number): boolean => {
    if (age < VALIDATION_THRESHOLDS.YOUNG_AGE_THRESHOLD && 
        dependents > VALIDATION_THRESHOLDS.MAX_DEPENDENTS_FOR_YOUNG) {
      return false
    }
    return true
  },

  /**
   * Cross-field validation: check if income is sufficient for dependents
   */
  isSufficientIncomeForDependents: (income: number, dependents: number): boolean => {
    if (dependents === 0) return true
    const incomePerDependent = income / dependents
    return incomePerDependent >= VALIDATION_THRESHOLDS.MIN_INCOME_PER_DEPENDENT
  },

  /**
   * Get risk tolerance color class
   */
  getRiskToleranceColor: (riskTolerance: RiskTolerance): string => {
    return RISK_TOLERANCE_MAP[riskTolerance]?.color || 'text-gray-500'
  }
} as const

// Export type for form field names for type safety
export type FormFieldName = typeof FORM_FIELD_CONFIGS[number]['name']
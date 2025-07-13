import { z } from 'zod'
import type { RiskTolerance } from './types'

// Validation Schemas

/**
 * Risk tolerance enum validation
 */
export const riskToleranceSchema = z.enum(['low', 'medium', 'high'], {
  message: 'Please select your risk tolerance preference'
})

/**
 * Age validation
 */
export const ageSchema = z.number({
  message: 'Age must be a valid number'
})
.min(18, 'You must be at least 18 years old')
.max(100, 'Age must be 100 or less')
.int('Age must be a whole number')

/**
 * Annual income validation
 */
export const annualIncomeSchema = z.number({
  message: 'Income must be a valid number'
})
.min(0, 'Annual income cannot be negative')
.max(100000000, 'Income amount seems unusually high') // $100M cap for sanity

/**
 * Number of dependents validation
 */
export const numberOfDependentsSchema = z.number({
  message: 'Number of dependents must be a valid number'
})
.min(0, 'Number of dependents cannot be negative')
.max(20, 'Number of dependents cannot exceed 20')
.int('Number of dependents must be a whole number')

/**
 * Session ID validation
 */
export const sessionIdSchema = z.string().optional()

/**
 * Complete recommendation request schema
 */
export const recommendationRequestSchema = z.object({
  age: ageSchema,
  annualIncome: annualIncomeSchema,
  numberOfDependents: numberOfDependentsSchema,
  riskTolerance: riskToleranceSchema,
  sessionId: sessionIdSchema,
})

/**
 * Frontend form schema - for React Hook Form
 * Uses strings for inputs, then transforms to numbers
 */
export const formDataSchema = z.object({
  age: z.string()
    .min(1, 'Age is required')
    .regex(/^\d+$/, 'Age must be a valid number')
    .transform(val => parseInt(val, 10))
    .pipe(ageSchema),
    
  annualIncome: z.string()
    .min(1, 'Annual income is required')
    .regex(/^[\d,]+$/, 'Income must be a valid number')
    .transform(val => {
      // Remove commas and convert to number
      const cleaned = val.replace(/,/g, '')
      return parseInt(cleaned, 10)
    })
    .pipe(annualIncomeSchema),
    
  numberOfDependents: z.number({
    message: 'Number of dependents is required'
  }).pipe(numberOfDependentsSchema),
  
  riskTolerance: riskToleranceSchema,
})

// Custom Validation Functions

/**
 * Validate email format (for future auth features)
 */
export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')

/**
 * Validate phone number (US format)
 */
export const phoneSchema = z.string()
  .regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Please enter a valid phone number: (123) 456-7890')
  .optional()

/**
 * Validate that age makes sense with dependents
 */
export function validateAgeWithDependents(age: number, dependents: number): string | null {
  if (age < 25 && dependents > 3) {
    return 'Large number of dependents for this age range'
  }
  if (age > 65 && dependents > 5) {
    return 'Please verify the number of dependents'
  }
  return null
}

/**
 * Validate income makes sense with dependents
 */
export function validateIncomeWithDependents(income: number, dependents: number): string | null {
  const incomePerDependent = dependents > 0 ? income / dependents : income
  
  if (dependents > 0 && incomePerDependent < 10000) {
    return 'Income may be low for the number of dependents'
  }
  
  return null
}

/**
 * Cross-field validation for the entire form
 */
export function validateFormCrossFields(data: {
  age: number
  annualIncome: number
  numberOfDependents: number
  riskTolerance: RiskTolerance
}): Record<string, string> {
  const errors: Record<string, string> = {}
  
  // Age vs dependents validation
  const ageError = validateAgeWithDependents(data.age, data.numberOfDependents)
  if (ageError) {
    errors.numberOfDependents = ageError
  }
  
  // Income vs dependents validation
  const incomeError = validateIncomeWithDependents(data.annualIncome, data.numberOfDependents)
  if (incomeError) {
    errors.annualIncome = incomeError
  }
  
  // Risk tolerance vs age guidance
  if (data.age < 30 && data.riskTolerance === 'low') {
    // This is just a warning, not an error
    console.warn('Young age with low risk tolerance - consider medium risk for better growth')
  }
  
  return errors
}

// Error Message Helpers

/**
 * Get user-friendly error messages for validation errors
 */
export function getValidationErrorMessage(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  
  error.issues.forEach((err: z.ZodIssue) => {
    const field = err.path.join('.')
    errors[field] = err.message
  })
  
  return errors
}

/**
 * Format API validation errors for display
 */
export function formatApiErrors(apiError: {
  details?: Array<{ field: string; message: string }>
}): Record<string, string> {
  const errors: Record<string, string> = {}
  
  if (apiError.details) {
    apiError.details.forEach(detail => {
      errors[detail.field] = detail.message
    })
  }
  
  return errors
}

// Type Exports

export type RecommendationRequestInput = z.infer<typeof recommendationRequestSchema>
export type FormDataInput = z.input<typeof formDataSchema>
export type FormDataOutput = z.output<typeof formDataSchema>

// For convenience, export the transformed form data type
export type FormDataTransformed = FormDataOutput
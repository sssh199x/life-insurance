export type RiskTolerance = 'low' | 'medium' | 'high'
export type InsuranceType = 'term_life' | 'whole_life' | 'universal_life'

/**
 * Form data structure
 */
export interface RecommendationRequest {
  age: number                    // 18-100
  annualIncome: number          // >= 0
  numberOfDependents: number    // 0-20
  riskTolerance: RiskTolerance  // 'low' | 'medium' | 'high'
  sessionId?: string            // Optional tracking ID
}

/**
 * Backend response structure - complete API response
 */
export interface RecommendationResponse {
  success: boolean
  data: {
    user: {
      id: number
      age: number
      annualIncome: number
      numberOfDependents: number
      riskTolerance: RiskTolerance
      sessionId?: string | null
      createdAt?: string 
      updatedAt?: string
    }
    recommendation: {
      id?: number
      userId?: number
      insuranceType: InsuranceType
      coverageAmount: number
      termLengthYears: number | null
      premiumEstimate: number
      explanation: string
      confidenceScore: number       
      createdAt?: string
    }
  }
}

/**
 * Insurance product from backend
 */
export interface InsuranceProduct {
  id: number
  productName: string
  productType: InsuranceType
  description: string
  minCoverage: number
  maxCoverage: number
  minTermYears: number | null
  maxTermYears: number | null
  targetRiskTolerance: RiskTolerance 
  isActive: boolean 
  createdAt: string
}

/**
 * API Error response structure
 */
export interface ApiError {
  success: false
  error: {
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

// Frontend-Specific Types

/**
 * Form state for React Hook Form (input types)
 */
export interface FormData {
  age: string          // String for input handling, converted to number by Zod
  annualIncome: string // String for currency formatting, converted to number by Zod
  numberOfDependents: number
  riskTolerance: RiskTolerance
}

/**
 * Form data after Zod transformation (output types)
 */
export interface FormDataTransformed {
  age: number          // After Zod transformation
  annualIncome: number // After Zod transformation  
  numberOfDependents: number
  riskTolerance: RiskTolerance
}

/**
 * Processed recommendation for display
 */
export interface ProcessedRecommendation {
  // Core recommendation data
  insuranceType: InsuranceType
  insuranceTypeDisplay: string
  coverageAmount: number
  coverageDisplay: string 
  termLength: number | null
  termDisplay: string | null
  premiumEstimate: number
  premiumDisplay: string        
  explanation: string
  confidenceScore: number
  confidenceDisplay: string     
  
  // User context
  userAge: number
  userIncome: number
  userDependents: number
  userRiskTolerance: RiskTolerance
  
  // Metadata
  createdAt: string
  recommendationId: number
}

/**
 * Component state for form management
 */
export interface FormState {
  isSubmitting: boolean
  hasSubmitted: boolean
  lastSubmissionTime: Date | null
  errors: Record<string, string>
  isDirty: boolean
}

/**
 * API request state
 */
export interface ApiState {
  isLoading: boolean
  error: string | null
  lastRequestTime: Date | null
  retryCount: number
}

/**
 * Local storage structure
 */
export interface StoredData {
  formData: Partial<FormData> | null
  lastRecommendation: ProcessedRecommendation | null
  sessionId: string
  lastUpdated: string
  version: string  // For migration compatibility
}

/**
 * App configuration
 */
export interface AppConfig {
  apiUrl: string
  appName: string
  environment: string
  version: string
}

// Helper type for strict environment checking when needed
export type Environment = 'development' | 'production' | 'staging'

// Utility Types

/**
 * Risk tolerance options for UI
 */
export interface RiskToleranceOption {
  value: RiskTolerance
  label: string
  description: string
  icon: string  // Lucide icon name
}

/**
 * Form field configuration
 */
export interface FormFieldConfig {
  name: keyof FormData
  label: string
  placeholder: string
  type: 'text' | 'number' | 'select' | 'radio'
  required: boolean
  validation?: {
    min?: number
    max?: number
    pattern?: RegExp
    message: string
  }
}

/**
 * Select option interface for dropdown components
 */
export interface SelectOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
  icon?: React.ReactNode
}

/**
 * API endpoint configuration
 */
export interface ApiEndpoint {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  timeout?: number
  retries?: number
}

// Type Guards

/**
 * Check if response is an error
 */
export function isApiError(response: any): response is ApiError {
  return response && response.success === false && response.error
}

/**
 * Check if response is successful
 */
export function isSuccessResponse(response: any): response is RecommendationResponse {
  return response && response.success === true && response.data
}

/**
 * Validate risk tolerance value
 */
export function isValidRiskTolerance(value: string): value is RiskTolerance {
  return ['low', 'medium', 'high'].includes(value)
}

/**
 * Validate insurance type
 */
export function isValidInsuranceType(value: string): value is InsuranceType {
  return ['term_life', 'whole_life', 'universal_life'].includes(value)
}
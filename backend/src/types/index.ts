import { z } from 'zod'

// Zod validation schemas
export const RecommendationRequestSchema = z.object({
  age: z.number().min(18).max(100),
  annualIncome: z.number().min(0),
  numberOfDependents: z.number().min(0).max(20),
  riskTolerance: z.enum(['low', 'medium', 'high']),
  sessionId: z.string().optional(),
})

export const UserCreateSchema = RecommendationRequestSchema

// TypeScript types derived from Zod schemas
export type RecommendationRequest = z.infer<typeof RecommendationRequestSchema>
export type UserCreate = z.infer<typeof UserCreateSchema>

// API Response types
export interface RecommendationResponse {
  success: boolean
  data?: {
    recommendation: {
      insuranceType: string
      coverageAmount: number
      termLengthYears?: number
      premiumEstimate?: number
      explanation: string
      confidenceScore?: number
    }
    user: {
      id: number
      age: number
      annualIncome: number
      numberOfDependents: number
      riskTolerance: string
    }
  }
  error?: string
}

export interface ApiError {
  success: false
  error: string
  details?: any
}

// Recommendation calculation types
export interface RecommendationCalculation {
  insuranceType: 'term_life' | 'whole_life' | 'universal_life'
  coverageAmount: number
  termLengthYears?: number
  premiumEstimate: number
  explanation: string
  confidenceScore: number
}

// Risk tolerance enum
export type RiskTolerance = 'low' | 'medium' | 'high'

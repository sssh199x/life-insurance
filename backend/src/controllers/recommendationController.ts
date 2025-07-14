import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { RecommendationResponse, ApiError } from '../types'
import { RecommendationService } from '../services/recommendationService'
import { v4 as uuidv4 } from 'uuid'
import { logInfo, logError, logWarn, logDatabaseQuery, logPerformance } from '../utils/logger'
import { handleDatabaseError, asyncErrorWrapper } from '../middleware/errorHandler'

const prisma = new PrismaClient()

export class RecommendationController {
  /**
   * POST /api/recommendation
   * Generate insurance recommendation for user
   * Note: Request validation is handled by middleware
   */
  static getRecommendation = asyncErrorWrapper(async (req: Request, res: Response) => {
    const startTime = Date.now()
    
    try {
      // req.body is already validated by middleware
      const requestData = req.body

      logInfo('Processing Recommendation Request', {
        correlation_id: req.correlationId,
        user_profile: {
          age: requestData.age,
          annual_income: requestData.annualIncome,
          dependents: requestData.numberOfDependents,
          risk_tolerance: requestData.riskTolerance
        },
        type: 'recommendation_start'
      })

      // Generate session ID if not provided
      const sessionId = requestData.sessionId || uuidv4()

      // Calculate recommendation
      const calculationStartTime = Date.now()
      const recommendation = RecommendationService.calculateRecommendation(requestData)
      logPerformance('Recommendation Calculation', calculationStartTime, {
        correlation_id: req.correlationId,
        insurance_type: recommendation.insuranceType,
        coverage_amount: recommendation.coverageAmount
      })

      // Save user data to database
      const dbStartTime = Date.now()
      const user = await prisma.user.create({
        data: {
          age: requestData.age,
          annualIncome: requestData.annualIncome,
          numberOfDependents: requestData.numberOfDependents,
          riskTolerance: requestData.riskTolerance,
          sessionId: sessionId,
        }
      })
      
      logDatabaseQuery('User Creation', Date.now() - dbStartTime, {
        correlation_id: req.correlationId,
        user_id: user.id,
        session_id: sessionId
      })

      // Save recommendation to database
      const recDbStartTime = Date.now()
      const savedRecommendation = await prisma.recommendation.create({
        data: {
          userId: user.id,
          insuranceType: recommendation.insuranceType,
          coverageAmount: recommendation.coverageAmount,
          termLengthYears: recommendation.termLengthYears,
          premiumEstimate: recommendation.premiumEstimate,
          explanation: recommendation.explanation,
          confidenceScore: recommendation.confidenceScore,
        }
      })

      logDatabaseQuery('Recommendation Creation', Date.now() - recDbStartTime, {
        correlation_id: req.correlationId,
        recommendation_id: savedRecommendation.id,
        user_id: user.id
      })

      // Prepare response
      const response: RecommendationResponse = {
        success: true,
        data: {
          recommendation: {
            insuranceType: savedRecommendation.insuranceType,
            coverageAmount: Number(savedRecommendation.coverageAmount),
            termLengthYears: savedRecommendation.termLengthYears ?? undefined,
            premiumEstimate: savedRecommendation.premiumEstimate ? Number(savedRecommendation.premiumEstimate) : undefined,
            explanation: savedRecommendation.explanation,
            confidenceScore: savedRecommendation.confidenceScore ? Number(savedRecommendation.confidenceScore) : undefined,
          },
          user: {
            id: user.id,
            age: user.age,
            annualIncome: Number(user.annualIncome),
            numberOfDependents: user.numberOfDependents,
            riskTolerance: user.riskTolerance,
          }
        }
      }

      // Log successful recommendation
      logInfo('Recommendation Generated Successfully', {
        correlation_id: req.correlationId,
        user_id: user.id,
        recommendation_id: savedRecommendation.id,
        insurance_type: recommendation.insuranceType,
        coverage_amount: recommendation.coverageAmount,
        confidence_score: recommendation.confidenceScore,
        total_processing_time_ms: Date.now() - startTime,
        type: 'recommendation_success'
      })

      res.status(200).json(response)

    } catch (error) {
      const errorContext = `Recommendation Generation - ${req.method} ${req.originalUrl}`
      
      // Handle database errors specifically
      if ((error as any).code && (error as any).code.startsWith('P')) {
        const dbError = handleDatabaseError(error, errorContext)
        const response: ApiError = {
          success: false,
          error: dbError.message
        }
        return res.status(dbError.statusCode).json(response)
      }

      logError('Recommendation Generation Failed', {
        correlation_id: req.correlationId,
        error_message: (error as Error).message,
        error_stack: (error as Error).stack,
        processing_time_ms: Date.now() - startTime,
        request_data: req.body,
        type: 'recommendation_error'
      })
      
      const response: ApiError = {
        success: false,
        error: 'Failed to generate recommendation'
      }
      
      res.status(500).json(response)
    }
  })

  /**
   * GET /api/recommendations/:userId
   * Get recommendation history for a user
   */
  static getRecommendationHistory = asyncErrorWrapper(async (req: Request, res: Response) => {
    const startTime = Date.now()
    
    try {
      const userId = parseInt(req.params.userId)

      if (isNaN(userId)) {
        logWarn('Invalid User ID in History Request', {
          correlation_id: req.correlationId,
          provided_user_id: req.params.userId,
          type: 'validation_error'
        })

        const response: ApiError = {
          success: false,
          error: 'Invalid user ID'
        }
        return res.status(400).json(response)
      }

      logInfo('Fetching Recommendation History', {
        correlation_id: req.correlationId,
        user_id: userId,
        type: 'history_request'
      })

      const dbStartTime = Date.now()
      const recommendations = await prisma.recommendation.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              age: true,
              annualIncome: true,
              numberOfDependents: true,
              riskTolerance: true,
              createdAt: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      logDatabaseQuery('Recommendation History Fetch', Date.now() - dbStartTime, {
        correlation_id: req.correlationId,
        user_id: userId,
        records_found: recommendations.length
      })

      if (recommendations.length === 0) {
        logInfo('No Recommendations Found for User', {
          correlation_id: req.correlationId,
          user_id: userId,
          type: 'no_data_found'
        })

        const response: ApiError = {
          success: false,
          error: 'No recommendations found for this user'
        }
        return res.status(404).json(response)
      }

      const response = {
        success: true,
        data: {
          user: recommendations[0].user,
          recommendations: recommendations.map(rec => ({
            id: rec.id,
            insuranceType: rec.insuranceType,
            coverageAmount: Number(rec.coverageAmount),
            termLengthYears: rec.termLengthYears ?? undefined,
            premiumEstimate: rec.premiumEstimate ? Number(rec.premiumEstimate) : null,
            explanation: rec.explanation,
            confidenceScore: rec.confidenceScore ? Number(rec.confidenceScore) : null,
            createdAt: rec.createdAt,
          }))
        }
      }

      logInfo('Recommendation History Retrieved Successfully', {
        correlation_id: req.correlationId,
        user_id: userId,
        recommendations_count: recommendations.length,
        processing_time_ms: Date.now() - startTime,
        type: 'history_success'
      })

      res.status(200).json(response)

    } catch (error) {
      const errorContext = `Recommendation History - ${req.method} ${req.originalUrl}`
      
      if ((error as any).code && (error as any).code.startsWith('P')) {
        const dbError = handleDatabaseError(error, errorContext)
        const response: ApiError = {
          success: false,
          error: dbError.message
        }
        return res.status(dbError.statusCode).json(response)
      }

      logError('Recommendation History Fetch Failed', {
        correlation_id: req.correlationId,
        user_id: req.params.userId,
        error_message: (error as Error).message,
        error_stack: (error as Error).stack,
        processing_time_ms: Date.now() - startTime,
        type: 'history_error'
      })
      
      const response: ApiError = {
        success: false,
        error: 'Failed to fetch recommendation history'
      }
      
      res.status(500).json(response)
    }
  })

  /**
   * GET /api/products
   * Get available insurance products
   */
  static getInsuranceProducts = asyncErrorWrapper(async (req: Request, res: Response) => {
    const startTime = Date.now()
    
    try {
      logInfo('Fetching Insurance Products', {
        correlation_id: req.correlationId,
        type: 'products_request'
      })

      const dbStartTime = Date.now()
      const products = await prisma.insuranceProduct.findMany({
        where: { isActive: true },
        orderBy: { productName: 'asc' }
      })

      logDatabaseQuery('Insurance Products Fetch', Date.now() - dbStartTime, {
        correlation_id: req.correlationId,
        products_found: products.length
      })

      const response = {
        success: true,
        data: {
          products: products.map(product => ({
            id: product.id,
            productName: product.productName,
            productType: product.productType,
            description: product.description,
            minCoverage: product.minCoverage ? Number(product.minCoverage) : null,
            maxCoverage: product.maxCoverage ? Number(product.maxCoverage) : null,
            minTermYears: product.minTermYears,
            maxTermYears: product.maxTermYears,
            targetRiskTolerance: product.targetRiskTolerance,
          }))
        }
      }

      logInfo('Insurance Products Retrieved Successfully', {
        correlation_id: req.correlationId,
        products_count: products.length,
        processing_time_ms: Date.now() - startTime,
        type: 'products_success'
      })

      res.status(200).json(response)

    } catch (error) {
      const errorContext = `Insurance Products Fetch - ${req.method} ${req.originalUrl}`
      
      if ((error as any).code && (error as any).code.startsWith('P')) {
        const dbError = handleDatabaseError(error, errorContext)
        const response: ApiError = {
          success: false,
          error: dbError.message
        }
        return res.status(dbError.statusCode).json(response)
      }

      logError('Insurance Products Fetch Failed', {
        correlation_id: req.correlationId,
        error_message: (error as Error).message,
        error_stack: (error as Error).stack,
        processing_time_ms: Date.now() - startTime,
        type: 'products_error'
      })
      
      const response: ApiError = {
        success: false,
        error: 'Failed to fetch insurance products'
      }
      
      res.status(500).json(response)
    }
  })
}
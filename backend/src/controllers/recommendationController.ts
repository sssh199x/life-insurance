import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { RecommendationRequestSchema, RecommendationResponse, ApiError } from '../types'
import { RecommendationService } from '../services/recommendationService'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

export class RecommendationController {
  /**
   * POST /api/recommendation
   * Generate insurance recommendation for user
   */
  static async getRecommendation(req: Request, res: Response) {
    try {
      // Validate request body
      const validationResult = RecommendationRequestSchema.safeParse(req.body)
      
      if (!validationResult.success) {
        const response: ApiError = {
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.format()
        }
        return res.status(400).json(response)
      }

      const requestData = validationResult.data

      // Generate session ID if not provided
      const sessionId = requestData.sessionId || uuidv4()

      // Calculate recommendation
      const recommendation = RecommendationService.calculateRecommendation(requestData)

      // Save user data to database
      const user = await prisma.user.create({
        data: {
          age: requestData.age,
          annualIncome: requestData.annualIncome,
          numberOfDependents: requestData.numberOfDependents,
          riskTolerance: requestData.riskTolerance,
          sessionId: sessionId,
        }
      })

      // Save recommendation to database
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

      res.status(200).json(response)

    } catch (error) {
      console.error('Error generating recommendation:', error)
      
      const response: ApiError = {
        success: false,
        error: 'Failed to generate recommendation',
        details: process.env.NODE_ENV !== 'production' ? error : undefined
      }
      
      res.status(500).json(response)
    }
  }

  /**
   * GET /api/recommendations/:userId
   * Get recommendation history for a user
   */
  static async getRecommendationHistory(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId)

      if (isNaN(userId)) {
        const response: ApiError = {
          success: false,
          error: 'Invalid user ID'
        }
        return res.status(400).json(response)
      }

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

      if (recommendations.length === 0) {
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

      res.status(200).json(response)

    } catch (error) {
      console.error('Error fetching recommendation history:', error)
      
      const response: ApiError = {
        success: false,
        error: 'Failed to fetch recommendation history'
      }
      
      res.status(500).json(response)
    }
  }

  /**
   * GET /api/products
   * Get available insurance products
   */
  static async getInsuranceProducts(req: Request, res: Response) {
    try {
      const products = await prisma.insuranceProduct.findMany({
        where: { isActive: true },
        orderBy: { productName: 'asc' }
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

      res.status(200).json(response)

    } catch (error) {
      console.error('Error fetching insurance products:', error)
      
      const response: ApiError = {
        success: false,
        error: 'Failed to fetch insurance products'
      }
      
      res.status(500).json(response)
    }
  }
}
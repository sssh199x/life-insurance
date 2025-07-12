import { Router } from 'express'
import { RecommendationController } from '../controllers/recommendationController'
import { validateBody } from '../middleware'
import { RecommendationRequestSchema } from '../types'

const router = Router()

// POST /api/recommendation - Get insurance recommendation
router.post(
  '/recommendation', 
  validateBody(RecommendationRequestSchema),  // Validate request body
  RecommendationController.getRecommendation
)

// GET /api/recommendations/:userId - Get user's recommendation history
router.get(
  '/recommendations/:userId', 
  RecommendationController.getRecommendationHistory
)

// GET /api/products - Get available insurance products
router.get('/products', RecommendationController.getInsuranceProducts)

export default router
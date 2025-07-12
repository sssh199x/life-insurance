import { Router } from 'express'
import { RecommendationController } from '../controllers/recommendationController'

const router = Router()

// POST /api/recommendation - Get insurance recommendation
router.post('/recommendation', RecommendationController.getRecommendation)

// GET /api/recommendations/:userId - Get user's recommendation history
router.get('/recommendations/:userId', RecommendationController.getRecommendationHistory)

// GET /api/products - Get available insurance products
router.get('/products', RecommendationController.getInsuranceProducts)

export default router
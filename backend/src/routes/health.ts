import { Router } from 'express'
import { HealthController } from '../controllers/healthController'

const router = Router()

// Basic health check
router.get('/', HealthController.basicHealth)

// Detailed health check with dependency checks
router.get('/detailed', HealthController.detailedHealth)

// Kubernetes/Docker readiness probe
router.get('/ready', HealthController.readinessProbe)

// Kubernetes/Docker liveness probe  
router.get('/live', HealthController.livenessProbe)

// Metrics endpoint for monitoring
router.get('/metrics', HealthController.metrics)

export default router
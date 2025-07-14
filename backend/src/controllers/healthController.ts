import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { logInfo, logError, logWarn } from '../utils/logger'

const prisma = new PrismaClient()

export class HealthController {
  /**
   * Basic health check endpoint
   * GET /health
   */
  static async basicHealth(req: Request, res: Response) {
    try {
      const healthData = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        service: 'life-insurance-api'
      }

      logInfo('Health Check - Basic', {
        correlation_id: req.correlationId,
        ip_address: req.ip,
        uptime: healthData.uptime,
        type: 'health_check'
      })

      res.status(200).json(healthData)
    } catch (error) {
      logError('Health Check Failed', {
        correlation_id: req.correlationId,
        error_message: (error as Error).message,
        type: 'health_check_error'
      })

      res.status(500).json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      })
    }
  }

  /**
   * Comprehensive health check with dependencies
   * GET /health/detailed
   */
  static async detailedHealth(req: Request, res: Response) {
    const startTime = Date.now()
    const healthChecks: any = {
      timestamp: new Date().toISOString(),
      service: 'life-insurance-api',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      status: 'OK',
      checks: {}
    }

    try {
      // Check database connectivity
      const dbStartTime = Date.now()
      try {
        await prisma.$queryRaw`SELECT 1`
        healthChecks.checks.database = {
          status: 'OK',
          response_time_ms: Date.now() - dbStartTime,
          message: 'Database connection successful'
        }
      } catch (dbError) {
        healthChecks.checks.database = {
          status: 'ERROR',
          response_time_ms: Date.now() - dbStartTime,
          message: 'Database connection failed',
          error: (dbError as Error).message
        }
        healthChecks.status = 'DEGRADED'
      }

      // Check memory usage
      const memUsage = process.memoryUsage()
      const memoryStatus = memUsage.heapUsed < 500 * 1024 * 1024 ? 'OK' : 'WARNING' // 500MB threshold
      healthChecks.checks.memory = {
        status: memoryStatus,
        heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
        heap_total_mb: Math.round(memUsage.heapTotal / 1024 / 1024),
        external_mb: Math.round(memUsage.external / 1024 / 1024)
      }

      if (memoryStatus === 'WARNING') {
        healthChecks.status = 'DEGRADED'
      }

      // Check system load (simplified)
      const cpuUsage = process.cpuUsage()
      healthChecks.checks.cpu = {
        status: 'OK',
        user_cpu_time_ms: Math.round(cpuUsage.user / 1000),
        system_cpu_time_ms: Math.round(cpuUsage.system / 1000)
      }

      // Check disk space (if available)
      try {
        const stats = await import('fs').then(fs => fs.promises.stat('/'))
        healthChecks.checks.filesystem = {
          status: 'OK',
          message: 'Filesystem accessible'
        }
      } catch (fsError) {
        healthChecks.checks.filesystem = {
          status: 'WARNING',
          message: 'Filesystem check failed'
        }
      }

      // Overall response time
      healthChecks.response_time_ms = Date.now() - startTime

      // Log health check results
      const logLevel = healthChecks.status === 'OK' ? 'info' : 'warn'
      const logMessage = `Health Check - Detailed (${healthChecks.status})`
      
      if (logLevel === 'info') {
        logInfo(logMessage, {
          correlation_id: req.correlationId,
          health_status: healthChecks.status,
          response_time_ms: healthChecks.response_time_ms,
          database_status: healthChecks.checks.database.status,
          memory_status: healthChecks.checks.memory.status,
          type: 'detailed_health_check'
        })
      } else {
        logWarn(logMessage, {
          correlation_id: req.correlationId,
          health_status: healthChecks.status,
          failed_checks: Object.entries(healthChecks.checks)
            .filter(([_, check]: any) => check.status !== 'OK')
            .map(([name]) => name),
          type: 'health_check_warning'
        })
      }

      const statusCode = healthChecks.status === 'OK' ? 200 : 
                        healthChecks.status === 'DEGRADED' ? 200 : 503

      res.status(statusCode).json(healthChecks)

    } catch (error) {
      logError('Detailed Health Check Failed', {
        correlation_id: req.correlationId,
        error_message: (error as Error).message,
        error_stack: (error as Error).stack,
        type: 'health_check_error'
      })

      res.status(500).json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: (error as Error).message
      })
    }
  }

  /**
   * Readiness probe for Kubernetes/Docker
   * GET /health/ready
   */
  static async readinessProbe(req: Request, res: Response) {
    try {
      // Check if database is ready
      await prisma.$queryRaw`SELECT 1`
      
      res.status(200).json({
        status: 'READY',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      logError('Readiness Probe Failed', {
        correlation_id: req.correlationId,
        error_message: (error as Error).message,
        type: 'readiness_probe_error'
      })

      res.status(503).json({
        status: 'NOT_READY',
        timestamp: new Date().toISOString(),
        error: 'Service not ready'
      })
    }
  }

  /**
   * Liveness probe for Kubernetes/Docker
   * GET /health/live
   */
  static async livenessProbe(req: Request, res: Response) {
    try {
      // Simple check that the application is running
      res.status(200).json({
        status: 'ALIVE',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      })
    } catch (error) {
      logError('Liveness Probe Failed', {
        correlation_id: req.correlationId,
        error_message: (error as Error).message,
        type: 'liveness_probe_error'
      })

      res.status(503).json({
        status: 'NOT_ALIVE',
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Metrics endpoint for monitoring
   * GET /metrics
   */
  static async metrics(req: Request, res: Response) {
    try {
      const memUsage = process.memoryUsage()
      const cpuUsage = process.cpuUsage()
      
      // Get some basic database metrics
      let dbMetrics = {}
      try {
        const userCount = await prisma.user.count()
        const recommendationCount = await prisma.recommendation.count()
        dbMetrics = {
          total_users: userCount,
          total_recommendations: recommendationCount
        }
      } catch (dbError) {
        logWarn('Failed to fetch database metrics', {
          error_message: (dbError as Error).message,
          type: 'metrics_warning'
        })
      }

      const metrics = {
        timestamp: new Date().toISOString(),
        uptime_seconds: process.uptime(),
        memory: {
          heap_used_bytes: memUsage.heapUsed,
          heap_total_bytes: memUsage.heapTotal,
          external_bytes: memUsage.external,
          rss_bytes: memUsage.rss
        },
        cpu: {
          user_time_ms: cpuUsage.user / 1000,
          system_time_ms: cpuUsage.system / 1000
        },
        process: {
          pid: process.pid,
          version: process.version,
          platform: process.platform,
          arch: process.arch
        },
        database: dbMetrics
      }

      logInfo('Metrics Requested', {
        correlation_id: req.correlationId,
        ip_address: req.ip,
        heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
        uptime: process.uptime(),
        type: 'metrics_request'
      })

      res.status(200).json(metrics)
    } catch (error) {
      logError('Metrics Request Failed', {
        correlation_id: req.correlationId,
        error_message: (error as Error).message,
        type: 'metrics_error'
      })

      res.status(500).json({
        error: 'Failed to generate metrics',
        timestamp: new Date().toISOString()
      })
    }
  }
}
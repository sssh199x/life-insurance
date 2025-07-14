import { Request, Response, NextFunction } from 'express'
import morgan from 'morgan'
import logger, { logApiRequest, logInfo, logWarn } from '../utils/logger'
import { v4 as uuidv4 } from 'uuid'

// Extend Request interface to include correlation ID
declare global {
  namespace Express {
    interface Request {
      correlationId?: string
      startTime?: number
    }
  }
}

/**
 * Correlation ID middleware
 * Adds a unique correlation ID to each request for tracing
 */
export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Generate or use existing correlation ID from headers
  const correlationId = req.headers['x-correlation-id'] as string || uuidv4()
  
  req.correlationId = correlationId
  res.setHeader('x-correlation-id', correlationId)
  
  next()
}

/**
 * Request timing middleware
 * Adds start time to request for performance monitoring
 */
export const requestTimingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.startTime = Date.now()
  next()
}

/**
 * Comprehensive request logging middleware
 * Logs detailed information about each request
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()
  const { method, originalUrl, ip, headers, body } = req
  
  // Log incoming request
  logInfo('Incoming Request', {
    correlation_id: req.correlationId,
    method,
    url: originalUrl,
    ip_address: ip,
    user_agent: headers['user-agent'],
    content_type: headers['content-type'],
    content_length: headers['content-length'],
    // Only log body for non-sensitive endpoints (avoid logging credentials)
    request_body: originalUrl.includes('/health') ? undefined : 
                  method === 'POST' ? sanitizeRequestBody(body) : undefined,
    type: 'request_start'
  })

  // Capture response data
  const originalSend = res.send
  res.send = function(data) {
    const duration = Date.now() - startTime
    const statusCode = res.statusCode
    
    // Log response
    logApiRequest(req, res, duration)
    
    // Log slow requests as warnings
    if (duration > 1000) {
      logWarn('Slow Request Detected', {
        correlation_id: req.correlationId,
        method,
        url: originalUrl,
        duration_ms: duration,
        status_code: statusCode,
        type: 'slow_request'
      })
    }
    
    return originalSend.call(this, data)
  }
  
  next()
}

export const morganLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message: string) => {
        // Remove newline and log through Winston
        logger.http(message.trim())
      }
    }
  }
)

/**
 * Response time logger middleware
 * Tracks and logs response times for performance monitoring
 */
export const responseTimeLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - startTime
    const statusCode = res.statusCode
    const { method, originalUrl } = req
    
    // Log performance metrics
    logger.info('Response Time', {
      correlation_id: req.correlationId,
      method,
      url: originalUrl,
      status_code: statusCode,
      duration_ms: duration,
      type: 'performance'
    })
    
    // Alert on very slow requests
    if (duration > 5000) {
      logWarn('Very Slow Request', {
        correlation_id: req.correlationId,
        method,
        url: originalUrl,
        duration_ms: duration,
        status_code: statusCode,
        type: 'performance_alert'
      })
    }
  })
  
  next()
}

/**
 * Security logging middleware
 * Logs security-related events and suspicious activity
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const { method, originalUrl, ip, headers } = req
  
  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\./,           // Directory traversal
    /script>/i,       // XSS attempts
    /union.*select/i, // SQL injection
    /exec\(/i,        // Code execution
  ]
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(originalUrl) || 
    pattern.test(JSON.stringify(req.body || {}))
  )
  
  if (isSuspicious) {
    logWarn('Suspicious Request Detected', {
      correlation_id: req.correlationId,
      method,
      url: originalUrl,
      ip_address: ip,
      user_agent: headers['user-agent'],
      type: 'security_alert'
    })
  }
  
  // Log multiple requests from same IP (simple rate limiting detection)
  const userAgent = headers['user-agent']
  if (!userAgent || userAgent.length < 10) {
    logWarn('Request with suspicious User-Agent', {
      correlation_id: req.correlationId,
      ip_address: ip,
      user_agent: userAgent,
      type: 'security_warning'
    })
  }
  
  next()
}

/**
 * Health check logger (minimal logging for health checks)
 */
export const healthCheckLogger = (req: Request, res: Response, next: NextFunction) => {
  // Only log health check failures or if debug logging is enabled
  if (process.env.LOG_LEVEL === 'debug') {
    logger.debug('Health Check Request', {
      correlation_id: req.correlationId,
      ip_address: req.ip,
      type: 'health_check'
    })
  }
  next()
}

/**
 * Sanitize request body for logging
 * Removes sensitive information from logs
 */
function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') return body
  
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth']
  const sanitized = { ...body }
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  }
  
  return sanitized
}
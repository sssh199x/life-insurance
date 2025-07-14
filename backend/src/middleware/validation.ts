import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import rateLimit from 'express-rate-limit'
import { logWarn, logError, logInfo } from '../utils/logger'
import { handleRateLimitError, handleValidationError } from './errorHandler'

/**
 * Generic validation middleware factory
 * Creates middleware that validates request body against a Zod schema
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationResult = schema.safeParse(req.body)
      
      if (!validationResult.success) {
        const validationError = handleValidationError(validationResult.error)
        
        // Log validation failure with context
        logWarn('Request Validation Failed', {
          correlation_id: req.correlationId,
          url: req.originalUrl,
          method: req.method,
          ip_address: req.ip,
          validation_errors: validationResult.error.issues,
          request_body: req.body,
          type: 'validation_error'
        })
        
        return res.status(validationError.statusCode).json({
          success: false,
          error: validationError.message,
          details: validationError.details,
          correlation_id: req.correlationId,
          timestamp: new Date().toISOString()
        })
      }
      
      // Log successful validation in debug mode
      if (process.env.LOG_LEVEL === 'debug') {
        logInfo('Request Validation Successful', {
          correlation_id: req.correlationId,
          url: req.originalUrl,
          method: req.method,
          type: 'validation_success'
        })
      }
      
      // Replace req.body with validated data
      req.body = validationResult.data
      next()
    } catch (error) {
      logError('Validation Middleware Error', {
        correlation_id: req.correlationId,
        error_message: (error as Error).message,
        error_stack: (error as Error).stack,
        url: req.originalUrl,
        method: req.method,
        type: 'validation_middleware_error'
      })
      
      res.status(500).json({
        success: false,
        error: 'Validation error occurred',
        correlation_id: req.correlationId,
        timestamp: new Date().toISOString()
      })
    }
  }
}

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req: Request, res: Response) => {
    handleRateLimitError(req)
    
    // Log rate limit hit
    logWarn('Rate Limit Exceeded', {
      correlation_id: req.correlationId,
      ip_address: req.ip,
      url: req.originalUrl,
      method: req.method,
      user_agent: req.get('User-Agent'),
      type: 'rate_limit_exceeded'
    })
    
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      correlation_id: req.correlationId,
      timestamp: new Date().toISOString(),
      retryAfter: Math.ceil(15 * 60) // 15 minutes in seconds
    })
  },
  
  // Skip successful requests to health endpoint
  skip: (req: Request) => {
    return req.path === '/health'
  },
  
  // Custom key generator (could be enhanced with user ID if auth is implemented)
  keyGenerator: (req: Request) => {
    return req.ip || 'unknown'
  }
})


export const strictRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute for sensitive endpoints
  message: {
    success: false,
    error: 'Too many requests to sensitive endpoint',
    message: 'Rate limit exceeded for this endpoint. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req: Request, res: Response) => {
    logWarn('Strict Rate Limit Exceeded', {
      correlation_id: req.correlationId,
      ip_address: req.ip,
      url: req.originalUrl,
      method: req.method,
      user_agent: req.get('User-Agent'),
      type: 'strict_rate_limit'
    })
    
    res.status(429).json({
      success: false,
      error: 'Too many requests to sensitive endpoint',
      message: 'Rate limit exceeded for this endpoint. Please try again later.',
      correlation_id: req.correlationId,
      timestamp: new Date().toISOString(),
      retryAfter: 60 // 1 minute
    })
  }
})

/**
 * Input sanitization middleware
 * Sanitizes and validates common security issues
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitize query parameters
    if (req.query) {
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string') {
          // Remove potentially dangerous characters
          req.query[key] = value.replace(/[<>\"']/g, '')
        }
      }
    }
    
    // Log suspicious input patterns
    const inputString = JSON.stringify({ ...req.body, ...req.query })
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /union.*select/gi,
      /drop\s+table/gi
    ]
    
    const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(inputString))
    
    if (hasSuspiciousContent) {
      logWarn('Suspicious Input Detected', {
        correlation_id: req.correlationId,
        ip_address: req.ip,
        url: req.originalUrl,
        method: req.method,
        suspicious_content: inputString.substring(0, 500), // Limit log size
        type: 'security_alert'
      })
    }
    
    next()
  } catch (error) {
    logError('Input Sanitization Error', {
      correlation_id: req.correlationId,
      error_message: (error as Error).message,
      type: 'sanitization_error'
    })
    next() // Continue processing even if sanitization fails
  }
}

/**
 * Request size limiter
 */
export const requestSizeLimiter = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.get('content-length') || '0', 10)
  const maxSize = 1024 * 1024 // 1MB
  
  if (contentLength > maxSize) {
    logWarn('Request Size Exceeded', {
      correlation_id: req.correlationId,
      ip_address: req.ip,
      url: req.originalUrl,
      method: req.method,
      content_length: contentLength,
      max_allowed: maxSize,
      type: 'request_size_limit'
    })
    
    return res.status(413).json({
      success: false,
      error: 'Request too large',
      message: `Request size exceeds maximum allowed size of ${maxSize} bytes`,
      correlation_id: req.correlationId,
      timestamp: new Date().toISOString()
    })
  }
  
  next()
}
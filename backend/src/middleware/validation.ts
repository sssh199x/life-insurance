import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

/**
 * Generic validation middleware factory
 * Creates middleware that validates request body against a Zod schema
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationResult = schema.safeParse(req.body)
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.format(),
          timestamp: new Date().toISOString()
        })
      }
      
      // Replace req.body with validated data
      req.body = validationResult.data
      next()
    } catch (error) {
      console.error('Validation middleware error:', error)
      res.status(500).json({
        success: false,
        error: 'Validation error occurred',
        timestamp: new Date().toISOString()
      })
    }
  }
}

/**
 * Rate limiting middleware (basic implementation)
 */
const requestCounts = new Map<string, { count: number, resetTime: number }>()

export const rateLimiter = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || 'unknown'
    const now = Date.now()
    
    // Clean up expired entries
    for (const [key, value] of requestCounts.entries()) {
      if (now > value.resetTime) {
        requestCounts.delete(key)
      }
    }
    
    // Check current client
    const clientData = requestCounts.get(clientId)
    
    if (!clientData) {
      // First request from this client
      requestCounts.set(clientId, {
        count: 1,
        resetTime: now + windowMs
      })
      return next()
    }
    
    if (now > clientData.resetTime) {
      // Reset window
      requestCounts.set(clientId, {
        count: 1,
        resetTime: now + windowMs
      })
      return next()
    }
    
    if (clientData.count >= maxRequests) {
      // Rate limit exceeded
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000 / 60} minutes.`,
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
        timestamp: new Date().toISOString()
      })
    }
    
    // Increment count
    clientData.count++
    next()
  }
}
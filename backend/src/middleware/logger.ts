import { Request, Response, NextFunction } from 'express'

/**
 * Request logging middleware
 * Logs all incoming requests with timestamp, method, and path
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString()
  const method = req.method
  const path = req.path
  const ip = req.ip || req.connection.remoteAddress
  
  console.log(`${timestamp} - ${method} ${path} - IP: ${ip}`)
  
  next()
}

/**
 * Response time logger middleware
 * Measures and logs how long each request takes
 */
export const responseTimeLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - startTime
    const statusCode = res.statusCode
    console.log(`${req.method} ${req.path} - ${statusCode} - ${duration}ms`)
  })
  
  next()
}
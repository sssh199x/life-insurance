import { Request, Response, NextFunction } from 'express'

/**
 * Global error handler middleware
 * Catches all unhandled errors and returns standardized error responses
 */
export const globalErrorHandler = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  })
  
  // Determine error status code
  const statusCode = err.status || err.statusCode || 500
  
  // Create error response
  const errorResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  }
  
  // Add stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    (errorResponse as any).stack = err.stack
  }
  
  res.status(statusCode).json(errorResponse)
}

/**
 * 404 Not Found handler
 * Handles requests to non-existent endpoints
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /health',
      'POST /api/recommendation',
      'GET /api/recommendations/:userId',
      'GET /api/products'
    ]
  })
}
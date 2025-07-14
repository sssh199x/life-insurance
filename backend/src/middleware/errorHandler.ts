import { Request, Response, NextFunction } from 'express'
import { logError, logWarn, logErrorWithContext } from '../utils/logger'

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
  // Determine error status code
  const statusCode = err.status || err.statusCode || 500
  
  const errorContext = {
    correlation_id: req.correlationId,
    error_message: err.message,
    error_stack: err.stack,
    error_code: err.code,
    url: req.originalUrl,
    method: req.method,
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    status_code: statusCode,
    request_body: req.body,
    request_params: req.params,
    request_query: req.query,
    type: 'error'
  }
  
  // Log error with appropriate level based on status code
  if (statusCode >= 500) {
    logErrorWithContext(err, `Global Error Handler - ${req.method} ${req.originalUrl}`, errorContext)
  } else if (statusCode >= 400) {
    logWarn('Client Error', errorContext)
  }
  
  // Create error response
  const errorResponse = {
    success: false,
    error: getErrorMessage(err, statusCode),
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    correlation_id: req.correlationId
  }
  
  // Add additional details in development
  if (process.env.NODE_ENV !== 'production') {
    (errorResponse as any).details = {
      message: err.message,
      stack: err.stack,
      code: err.code
    }
  }
  
  res.status(statusCode).json(errorResponse)
}

/**
 * 404 Not Found handler
 * Handles requests to non-existent endpoints
 */
export const notFoundHandler = (req: Request, res: Response) => {
  const errorContext = {
    correlation_id: req.correlationId,
    url: req.originalUrl,
    method: req.method,
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
    type: 'not_found'
  }
  
  logWarn('Endpoint Not Found', errorContext)
  
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
    correlation_id: req.correlationId,
    availableEndpoints: [
      'GET /health',
      'POST /api/recommendation',
      'GET /api/recommendations/:userId',
      'GET /api/products'
    ]
  })
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
export const asyncErrorWrapper = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Database error handler
 * Handles Prisma and database-specific errors
 */
export const handleDatabaseError = (error: any, context: string) => {
  let errorMessage = 'Database operation failed'
  let statusCode = 500
  
  // Handle Prisma-specific errors
  if (error.code) {
    switch (error.code) {
      case 'P2002':
        errorMessage = 'Unique constraint violation'
        statusCode = 409
        break
      case 'P2025':
        errorMessage = 'Record not found'
        statusCode = 404
        break
      case 'P2003':
        errorMessage = 'Foreign key constraint violation'
        statusCode = 400
        break
      case 'P2021':
        errorMessage = 'Table does not exist'
        statusCode = 500
        break
      default:
        errorMessage = 'Database error occurred'
    }
  }
  
  logErrorWithContext(error, context, {
    error_type: 'database',
    prisma_code: error.code,
    prisma_meta: error.meta
  })
  
  return { message: errorMessage, statusCode }
}

export const handleValidationError = (error: any) => {
  logWarn('Validation Error', {
    error_message: error.message,
    validation_issues: error.issues || error.errors,
    type: 'validation_error'
  })
  
  return {
    message: 'Validation failed',
    details: error.issues || error.errors,
    statusCode: 400
  }
}

/**
 * Rate limit error handler
 */
export const handleRateLimitError = (req: Request) => {
  logWarn('Rate Limit Exceeded', {
    correlation_id: req.correlationId,
    ip_address: req.ip,
    url: req.originalUrl,
    method: req.method,
    user_agent: req.get('User-Agent'),
    type: 'rate_limit'
  })
}

function getErrorMessage(err: any, statusCode: number): string {
  if (process.env.NODE_ENV === 'production') {
    if (statusCode >= 500) {
      return 'Internal server error'
    }
    if (statusCode === 404) {
      return 'Resource not found'
    }
    if (statusCode === 400) {
      return 'Bad request'
    }
    if (statusCode === 401) {
      return 'Unauthorized'
    }
    if (statusCode === 403) {
      return 'Forbidden'
    }
    if (statusCode === 429) {
      return 'Too many requests'
    }
  }
  
  return err.message || 'An error occurred'
}
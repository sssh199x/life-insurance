import winston from 'winston'

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Define log colors for console output
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
}

// Add colors to winston
winston.addColors(logColors)

// Custom format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info
    
    // Create structured log object
    const logObject = {
      timestamp,
      level: level.toUpperCase(),
      message,
      service: 'life-insurance-api',
      environment: process.env.NODE_ENV || 'development',
      pid: process.pid,
      ...meta
    }

    // For Docker stdout logging, output as JSON
    return JSON.stringify(logObject)
  })
)

// Console format for development (more readable)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    return `${timestamp} [${level}]: ${message} ${metaStr}`
  })
)

// Create winston logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format: logFormat,
  defaultMeta: {
    service: 'life-insurance-api',
    version: '1.0.0'
  },
  transports: [
    // Console transport (stdout) - always enabled for Docker
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat
    })
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
})

// Handle uncaught exceptions and unhandled rejections
logger.exceptions.handle(
  new winston.transports.Console({
    format: logFormat
  })
)

logger.rejections.handle(
  new winston.transports.Console({
    format: logFormat
  })
)

// Export logger and specific log level functions
export default logger

// Convenience functions for different log levels
export const logError = (message: string, meta?: any) => {
  logger.error(message, meta)
}

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta)
}

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta)
}

export const logHttp = (message: string, meta?: any) => {
  logger.http(message, meta)
}

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta)
}

// Performance monitoring helper
export const logPerformance = (operation: string, startTime: number, meta?: any) => {
  const duration = Date.now() - startTime
  logger.info(`Performance: ${operation}`, {
    operation,
    duration_ms: duration,
    ...meta
  })
}

// Database query logging helper
export const logDatabaseQuery = (query: string, duration: number, params?: any) => {
  logger.debug('Database Query', {
    query,
    duration_ms: duration,
    parameters: params,
    type: 'database'
  })
}

// API request/response logging helper
export const logApiRequest = (req: any, res: any, duration: number) => {
  const { method, originalUrl, ip, headers } = req
  const { statusCode } = res
  
  logger.http('API Request', {
    method,
    url: originalUrl,
    status_code: statusCode,
    ip_address: ip,
    user_agent: headers['user-agent'],
    duration_ms: duration,
    type: 'api_request'
  })
}

// Error logging with context
export const logErrorWithContext = (error: Error, context: string, meta?: any) => {
  logger.error(`Error in ${context}`, {
    error_message: error.message,
    error_stack: error.stack,
    context,
    ...meta
  })
}
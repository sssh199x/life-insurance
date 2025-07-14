import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import logger, { logInfo, logError, logWarn } from './utils/logger'

// Import custom middleware
import { 
  requestLogger, 
  responseTimeLogger,
  correlationIdMiddleware,
  requestTimingMiddleware,
  morganLogger,
  securityLogger,
  healthCheckLogger
} from './middleware/logger'

import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler'

import { 
  rateLimiter, 
  strictRateLimiter, 
  sanitizeInput, 
  requestSizeLimiter 
} from './middleware/validation'

// Import routes
import recommendationRoutes from './routes/recommendations'
import healthRoutes from './routes/health'

// Load environment variables
dotenv.config()

// Initialize Prisma client with logging
export const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
})

// Set up Prisma logging
prisma.$on('query', (e) => {
  logger.debug('Database Query', {
    query: e.query,
    params: e.params,
    duration_ms: e.duration,
    timestamp: e.timestamp,
    type: 'database_query'
  })
})

prisma.$on('error', (e) => {
  logError('Database Error', {
    message: e.message,
    timestamp: e.timestamp,
    type: 'database_error'
  })
})

prisma.$on('info', (e) => {
  logInfo('Database Info', {
    message: e.message,
    timestamp: e.timestamp,
    type: 'database_info'
  })
})

prisma.$on('warn', (e) => {
  logWarn('Database Warning', {
    message: e.message,
    timestamp: e.timestamp,
    type: 'database_warning'
  })
})

// Create Express app
const app = express()
const PORT = process.env.PORT || 3001

// Trust proxy (important for Render deployments)
app.set('trust proxy', 1)

// Security and CORS middleware
app.use(helmet({
  // Configure helmet for API
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false
}))

// Configure CORS for Render deployment
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.onrender.com'] 
    : ['http://localhost:3000', 'http://localhost:3001']

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
}))

// Request parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Core logging middleware (applied to all requests)
app.use(correlationIdMiddleware)      // Add correlation ID for request tracing
app.use(requestTimingMiddleware)      // Add request timing
app.use(morganLogger)                 // HTTP request logging
app.use(requestLogger)                // Custom request logging
app.use(responseTimeLogger)           // Response time tracking
app.use(securityLogger)               // Security monitoring

// Input validation and security
app.use(requestSizeLimiter)           // Limit request size
app.use(sanitizeInput)                // Input sanitization

// Health check endpoints (before rate limiting for monitoring)
app.use('/health', healthCheckLogger, healthRoutes)

// Rate limiting (after health checks)
app.use(rateLimiter)                  // General rate limiting

// API routes with stricter rate limiting for sensitive endpoints
app.use('/api/recommendation', strictRateLimiter)
app.use('/api', recommendationRoutes)

// Root endpoint for Render health checks
app.get('/', (req, res) => {
  res.json({
    service: 'Life Insurance API',
    status: 'OK',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Startup logging
logInfo('Server Configuration', {
  port: PORT,
  environment: process.env.NODE_ENV || 'development',
  log_level: process.env.LOG_LEVEL || 'info',
  database_url: process.env.DATABASE_URL ? '[CONFIGURED]' : '[NOT SET]',
  cors_origins: allowedOrigins,
  type: 'server_config'
})

// Error handling middleware (must be last)
app.use('*', notFoundHandler)         // 404 handler
app.use(globalErrorHandler)           // Global error handler

// Graceful shutdown handlers
const gracefulShutdown = async (signal: string) => {
  logInfo(`Received ${signal}, starting graceful shutdown...`, {
    signal,
    uptime: process.uptime(),
    type: 'shutdown_start'
  })
  
  try {
    // Close database connections
    await prisma.$disconnect()
    logInfo('Database connections closed successfully', {
      type: 'shutdown_database'
    })
    
    // Close server
    server.close(() => {
      logInfo('HTTP server closed successfully', {
        type: 'shutdown_complete'
      })
      process.exit(0)
    })
    
    // Force exit after 10 seconds
    setTimeout(() => {
      logError('Forced shutdown due to timeout', {
        type: 'shutdown_timeout'
      })
      process.exit(1)
    }, 10000)
    
  } catch (error) {
    logError('Error during graceful shutdown', {
      error_message: (error as Error).message,
      error_stack: (error as Error).stack,
      type: 'shutdown_error'
    })
    process.exit(1)
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  logError('Uncaught Exception', {
    error_message: error.message,
    error_stack: error.stack,
    type: 'uncaught_exception'
  })
  gracefulShutdown('UNCAUGHT_EXCEPTION')
})

process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Promise Rejection', {
    reason: String(reason),
    promise: String(promise),
    type: 'unhandled_rejection'
  })
  gracefulShutdown('UNHANDLED_REJECTION')
})

// Start server
const server = app.listen(PORT, () => {
  logInfo('Life Insurance API Server Started on Render', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    cors_origins: allowedOrigins,
    features: [
      'Helmet Security Headers',
      'CORS Protection', 
      'Request/Response Logging',
      'Rate Limiting',
      'Input Sanitization',
      'Error Tracking',
      'Performance Monitoring',
      'Health Checks',
      'Graceful Shutdown'
    ],
    type: 'server_start'
  })
  
  console.log(`🚀 Life Insurance API server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`)
  console.log(`🛡️  Security: Helmet + CORS + Rate Limiting enabled`)
  console.log(`📊 Logging: Structured JSON logging to stdout`)
  console.log(`⚡ Performance: Request/Response monitoring active`)
})

export default app
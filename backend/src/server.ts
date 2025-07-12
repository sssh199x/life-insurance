import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Import custom middleware
import { 
  requestLogger, 
  responseTimeLogger, 
  globalErrorHandler, 
  notFoundHandler,
  rateLimiter 
} from './middleware'

// Import routes
import recommendationRoutes from './routes/recommendations'

// Load environment variables
dotenv.config()

// Initialize Prisma client
export const prisma = new PrismaClient()

// Create Express app
const app = express()
const PORT = process.env.PORT || 3001

// Security and CORS middleware
app.use(helmet()) // Security headers
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}))

// Request parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Custom middleware
app.use(requestLogger)        // Log all requests
app.use(responseTimeLogger)   // Log response times
app.use(rateLimiter(100, 15 * 60 * 1000)) // 100 requests per 15 minutes

// Health check endpoint (before rate limiting for monitoring)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  })
})

// API routes
app.use('/api', recommendationRoutes)

// Error handling middleware
app.use('*', notFoundHandler)     // 404 handler
app.use(globalErrorHandler)       // Global error handler

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Received shutdown signal, closing server...')
  try {
    await prisma.$disconnect()
    console.log('Database connections closed.')
    process.exit(0)
  } catch (error) {
    console.error('Error during shutdown:', error)
    process.exit(1)
  }
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Life Insurance API server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`)
  console.log(`🛡️  Security: Helmet + CORS enabled`)
  console.log(`📊 Logging: Request/Response time tracking`)
  console.log(`⚡ Rate limiting: 100 requests per 15 minutes`)
})

export default app
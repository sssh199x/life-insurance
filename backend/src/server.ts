import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Import routes
import recommendationRoutes from './routes/recommendations'

// Load environment variables
dotenv.config()

// Initialize Prisma client
export const prisma = new PrismaClient()

// Create Express app
const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet()) // Security headers
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API routes
app.use('/api', recommendationRoutes)

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err)
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  })
})

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Received shutdown signal, closing server...')
  await prisma.$disconnect()
  process.exit(0)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Life Insurance API server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`)
})

export default app
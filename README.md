# Life Insurance Recommendation MVP

A full-stack web application that provides personalized life insurance recommendations based on user profiles. Built with Next.js frontend, Node.js/Express backend, PostgreSQL database, and comprehensive logging & monitoring.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│     Next.js.    │◄──►│ Node.js/Express │◄──►│ PostgreSQL 15   │
│   Frontend      │    │    Backend      │    │   Database      │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 5433    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ✨ Features

### Frontend (Next.js 15)
- 🎨 Modern React-based UI with TypeScript
- 📱 Responsive design with Tailwind CSS
- 🔄 Real-time form validation with React Hook Form + Zod
- 🎯 Insurance recommendation interface
- ⚡ Server-side rendering and optimization

### Backend (Node.js/Express)
- 🔐 Secure REST API with helmet and CORS protection
- 📊 Comprehensive structured JSON logging (stdout for Docker)
- 🚦 Rate limiting and request validation
- 📈 Performance monitoring and health checks
- 🗃️ Prisma ORM with PostgreSQL
- 🔍 Request correlation IDs for distributed tracing
- 🛡️ Input sanitization and security middleware

### Database (PostgreSQL)
- 👤 User profiles and preferences
- 💡 Insurance recommendations history
- 📋 Insurance products catalog
- 🔄 Database migrations with Prisma

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd life-insurance-mvp
```

### 2. Environment Setup
```bash
# Create environment file
cp backend/.env.example backend/.env

# Update the DATABASE_URL in backend/.env
DATABASE_URL="postgresql://postgres:password@localhost:5433/life_insurance"
```

### 3. Start with Docker (Recommended)
```bash
# Start all services (frontend, backend, database)
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health
- **Database**: localhost:5433

## 📁 Project Structure

```
life-insurance-mvp/
├── docker-compose.yml              # Multi-service orchestration
├── docker-compose.dev.yml          # Development mode
├── README.md
├── frontend/                       # Next.js Frontend
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── src/
│   │   ├── app/                    # App router pages
│   │   ├── components/             # Reusable components
│   │   └── lib/                    # Utilities and helpers
│   └── public/                     # Static assets
└── backend/                        # Node.js Backend
    ├── Dockerfile
    ├── .dockerignore
    ├── package.json
    ├── tsconfig.json
    ├── prisma/
    │   ├── schema.prisma           # Database schema
    │   ├── migrations/             # Database migrations
    │   └── seed.ts                 # Sample data
    └── src/
        ├── server.ts               # Main server file
        ├── controllers/            # API route handlers
        ├── middleware/             # Custom middleware
        ├── services/               # Business logic
        ├── routes/                 # API routes
        ├── types/                  # TypeScript types
        └── utils/                  # Utilities and logging
```

## 🔧 Development Setup

### Local Development (Without Docker)

#### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Start PostgreSQL (if running locally)
# Or use Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15

# Set up environment
cp .env.example .env
# Update DATABASE_URL to point to your local PostgreSQL

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database
npm run seed

# Start development server
npm run dev
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Docker Development Mode
```bash
# Use development compose (with hot reload)
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# This mode provides:
# - Hot reload for both frontend and backend
# - No build step required
# - Faster development iteration
```

## 🗄️ Database Operations

### Migrations
```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Seeding
```bash
# Seed the database with sample data
npm run seed

# Or via Docker
docker-compose exec backend npm run seed
```

### Database Access
```bash
# Open Prisma Studio (GUI)
npx prisma studio

# Or via Docker
docker-compose exec backend npx prisma studio

# Connect via psql
docker-compose exec postgres psql -U postgres -d life_insurance
```

## 📊 API Endpoints

### Health & Monitoring
```bash
GET  /health                    # Basic health check
GET  /health/detailed          # Comprehensive health with dependencies
GET  /health/ready             # Kubernetes readiness probe
GET  /health/live              # Kubernetes liveness probe
GET  /metrics                  # Application metrics
```

### Insurance API
```bash
POST /api/recommendation       # Generate recommendation
GET  /api/recommendations/:id  # Get user's recommendation history
GET  /api/products            # Get available insurance products
```

### Example API Usage
```bash
# Get health status
curl http://localhost:3001/health

# Generate recommendation
curl -X POST http://localhost:3001/api/recommendation \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "annualIncome": 75000,
    "numberOfDependents": 2,
    "riskTolerance": "medium"
  }'

# Get insurance products
curl http://localhost:3001/api/products
```

## 📋 Logging & Monitoring

### Structured JSON Logging
All logs are output as structured JSON to stdout for Docker compatibility:

```json
{
  "timestamp": "2025-01-13 23:30:15",
  "level": "INFO",
  "message": "API Request",
  "service": "life-insurance-api",
  "correlation_id": "req-123e4567-e89b-12d3-a456-426614174000",
  "method": "POST",
  "url": "/api/recommendation",
  "status_code": 200,
  "duration_ms": 156,
  "type": "api_request"
}
```

### Log Categories
- **API Requests**: HTTP request/response logs with timing
- **Database Operations**: Query performance and connection health
- **Business Logic**: Recommendation calculations and user interactions
- **Security Events**: Rate limiting, validation failures, suspicious activity
- **Performance**: Response times, memory usage, slow request alerts
- **Errors**: Comprehensive error tracking with stack traces

### Viewing Logs
```bash
# Real-time logs from all services
docker-compose logs -f

# Backend logs only
docker-compose logs -f backend

# Frontend logs only
docker-compose logs -f frontend

# Filter by log level (requires jq)
docker-compose logs backend | jq 'select(.level=="ERROR")'

# Export logs to file
docker-compose logs --no-color backend > api_logs.json
```

### Performance Monitoring
- Request correlation IDs for distributed tracing
- Response time tracking and alerts (>1s warnings, >5s alerts)
- Database query performance monitoring
- Memory and CPU usage metrics
- Health check endpoints for uptime monitoring

## 🚀 Deployment

### Production Docker Build
```bash
# Build all services for production
docker-compose build --no-cache

# Start in production mode
docker-compose up -d

# Check deployment health
curl http://localhost:3001/health/detailed
```

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Server Configuration
NODE_ENV=production
PORT=3001
LOG_LEVEL=warn

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_APP_NAME="Life Insurance MVP"

# Environment
NODE_ENV=production
```

### AWS Deployment Example

#### Using AWS ECS
1. **Push images to ECR**:
```bash
# Build and tag images
docker build -t life-insurance-frontend ./frontend
docker build -t life-insurance-backend ./backend

# Tag for ECR
docker tag life-insurance-frontend:latest <ecr-url>/life-insurance-frontend:latest
docker tag life-insurance-backend:latest <ecr-url>/life-insurance-backend:latest

# Push to ECR
docker push <ecr-url>/life-insurance-frontend:latest
docker push <ecr-url>/life-insurance-backend:latest
```

2. **Create ECS Task Definition** with the built images
3. **Set up RDS PostgreSQL** instance
4. **Configure ALB** for load balancing
5. **Set up CloudWatch** for log aggregation

#### Using Docker Compose on EC2
```bash
# Install Docker on EC2 instance
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Deploy application
git clone <your-repo>
cd life-insurance-mvp
docker-compose up -d
```

### Kubernetes Deployment
```yaml
# Example deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: life-insurance-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: life-insurance-backend
  template:
    metadata:
      labels:
        app: life-insurance-backend
    spec:
      containers:
      - name: backend
        image: <your-registry>/life-insurance-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3001
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3001
```

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Run tests (when implemented)
npm test

# Test API endpoints
curl http://localhost:3001/health
curl -X POST http://localhost:3001/api/recommendation -H "Content-Type: application/json" -d '{"age":30,"annualIncome":50000,"numberOfDependents":1,"riskTolerance":"medium"}'
```

### Frontend Testing
```bash
cd frontend

# Run tests (when implemented)
npm test

# Build test
npm run build

# Lint
npm run lint
```

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3001/health

# Using curl for stress testing
for i in {1..100}; do
  curl -X POST http://localhost:3001/api/recommendation \
    -H "Content-Type: application/json" \
    -d '{"age":30,"annualIncome":50000,"numberOfDependents":1,"riskTolerance":"medium"}' &
done
```

## 🛠️ Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find what's using the port
lsof -i :5432  # or :3000, :3001

# Change port in docker-compose.yml
ports:
  - "5434:5432"  # Use different external port
```

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Reset database
docker-compose down
docker volume rm life-insurance-mvp_postgres_data
docker-compose up -d
```

#### Build Failures
```bash
# Clean Docker cache
docker system prune -f

# Rebuild without cache
docker-compose build --no-cache

# Use development mode as fallback
docker-compose -f docker-compose.dev.yml up -d
```

#### Frontend Not Loading
```bash
# Check if Next.js build completed
docker-compose logs frontend

# Verify environment variables
docker-compose exec frontend env | grep NEXT_PUBLIC

# Test API connectivity
curl http://localhost:3001/health
```

### Debugging Commands
```bash
# Enter running container
docker-compose exec backend sh
docker-compose exec frontend sh

# Check container resources
docker stats

# Inspect container configuration
docker-compose config
```

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Docker Compose Reference](https://docs.docker.com/compose/)

### Monitoring & Observability
- **Structured Logging**: Winston with JSON formatters
- **Health Checks**: Multiple endpoint types for different monitoring needs
- **Metrics**: Custom application metrics at `/metrics`
- **Correlation IDs**: Distributed tracing support
- **Performance Monitoring**: Request timing and resource usage

### Security Features
- **Helmet.js**: Security headers
- **CORS**: Cross-origin request protection
- **Rate Limiting**: Request throttling
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
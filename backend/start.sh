#!/bin/bash

echo "🚀 Starting Life Insurance API on Render..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
until npx prisma db push --accept-data-loss; do
  echo "Database not ready, waiting 10 seconds..."
  sleep 10
done

echo "✅ Database connected!"

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy || echo "⚠️ Migrations failed or not needed"

# Seed database (only if tables are empty)
echo "🌱 Seeding database..."
npm run seed || echo "⚠️ Seeding failed or already done"

echo "🎉 Database setup complete!"

# Start the application
echo "🚀 Starting server on port ${PORT:-3001}..."
exec node dist/server.js
#!/bin/bash

# Academic Navigator Deployment Script
# This script builds and deploys the application

set -e

echo "🚀 Academic Navigator Deployment Script"
echo "======================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your production values before deploying."
    exit 1
fi

# Parse command line arguments
COMMAND=${1:-help}

case $COMMAND in
    build)
        echo "📦 Building application..."
        docker-compose build
        echo "✅ Build complete!"
        ;;
    
    start)
        echo "🚀 Starting application..."
        docker-compose up -d
        echo "✅ Application started!"
        echo "📍 Access at: http://localhost:5001"
        ;;
    
    stop)
        echo "🛑 Stopping application..."
        docker-compose down
        echo "✅ Application stopped!"
        ;;
    
    restart)
        echo "🔄 Restarting application..."
        docker-compose down
        docker-compose up -d
        echo "✅ Application restarted!"
        ;;
    
    logs)
        echo "📋 Showing logs..."
        docker-compose logs -f
        ;;
    
    status)
        echo "📊 Application status:"
        docker-compose ps
        ;;
    
    seed)
        echo "🌱 Seeding database..."
        docker-compose exec app python -m backend.seed
        echo "✅ Database seeded!"
        ;;
    
    shell)
        echo "🐚 Opening shell in container..."
        docker-compose exec app /bin/bash
        ;;
    
    local)
        echo "🖥️  Running locally (development mode)..."
        echo "Starting backend..."
        cd backend && python app.py &
        BACKEND_PID=$!
        echo "Starting frontend..."
        npm run dev &
        FRONTEND_PID=$!
        
        trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
        wait
        ;;
    
    help|*)
        echo "Usage: ./deploy.sh [command]"
        echo ""
        echo "Commands:"
        echo "  build    - Build Docker images"
        echo "  start    - Start the application"
        echo "  stop     - Stop the application"
        echo "  restart  - Restart the application"
        echo "  logs     - View application logs"
        echo "  status   - Show application status"
        echo "  seed     - Seed the database with sample data"
        echo "  shell    - Open a shell in the container"
        echo "  local    - Run locally in development mode"
        echo "  help     - Show this help message"
        ;;
esac

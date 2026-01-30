#!/bin/bash
echo "🔄 Resetting HealthTrack AI..."
docker-compose down -v
echo "✅ All containers and volumes removed"
echo ""
echo "🚀 To restart fresh: ./docker-start.sh"
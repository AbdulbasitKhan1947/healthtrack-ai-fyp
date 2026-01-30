@echo off
echo ===============================
echo HEALTHTRACK AI - DOCKER STARTUP
echo ===============================
echo.

REM Check Docker
docker version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Docker Desktop is not running!
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker is running
echo.

REM Create data directories
if not exist "data\neo4j-data" mkdir "data\neo4j-data"
if not exist "data\neo4j-logs" mkdir "data\neo4j-logs"
if not exist "data\neo4j-import" mkdir "data\neo4j-import"

echo 🚀 Building and starting containers...
echo This may take a few minutes on first run...
echo.

docker-compose up --build -d

echo.
echo ✅ Services are starting in the background...
echo.
echo ⏳ Please wait 30-60 seconds for all services to start...
echo.
echo 🔗 ACCESS URLs:
echo   Frontend:      http://localhost:3000
echo   Backend API:   http://localhost:8000
echo   API Docs:      http://localhost:8000/docs
echo   Neo4j Browser: http://localhost:7474
echo.
echo 📝 View logs:   docker-compose logs -f
echo 🛑 Stop:        stop-docker.bat
echo 🔄 Reset:       reset-docker.bat
echo.
echo To load medical data, run: docker-compose run --rm data-loader
echo.
pause
@echo off
echo 🔄 Resetting HealthTrack AI (removes everything)...
echo This will delete all containers, volumes, and data!
echo.
set /p confirm="Are you sure? (y/N): "
if /i "%confirm%"=="y" (
    echo Removing containers and volumes...
    docker-compose down -v --rmi all
    echo ✅ All containers, volumes, and images removed
) else (
    echo Operation cancelled
)
pause
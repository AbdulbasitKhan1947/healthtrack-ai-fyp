@echo off
echo ========================================
echo 🚀 HEALTHTRACK AI - STARTUP SCRIPT
echo ========================================
echo.

echo [1/3] Please ensure Neo4j Desktop is running:
echo        - Open Neo4j Desktop
echo        - Start 'healthtrack-db' (should be GREEN)
echo        - Leave it running in background
echo.
pause

echo [2/3] Starting Backend API (FastAPI)...
start cmd /k "cd /d "C:\Users\basit digitech\Desktop\healthtrack-ai-fyp\backend" && venv\Scripts\activate && python main.py"
echo    Backend starting on: http://localhost:8000
echo    Waiting 5 seconds for backend to initialize...
timeout /t 5

echo [3/3] Starting Frontend (Next.js)...
start cmd /k "cd /d "C:\Users\basit digitech\Desktop\healthtrack-ai-fyp\frontend" && npm run dev"
echo    Frontend starting on: http://localhost:3000
echo    Waiting 3 seconds for frontend to initialize...
timeout /t 3

echo.
echo ========================================
echo ✅ SYSTEM READY!
echo ========================================
echo.
echo IMPORTANT LINKS:
echo 1. Frontend:  http://localhost:3000
echo 2. Backend:   http://localhost:8000
echo 3. API Docs:  http://localhost:8000/docs
echo 4. Neo4j:     http://localhost:7474
echo.
echo QUICK TEST:
echo 1. Open http://localhost:3000
echo 2. Add symptoms: "itching" + "skin rash"
echo 3. Click "Analyze Symptoms"
echo 4. Should show disease predictions!
echo.
echo Press any key to open the frontend in browser...
pause
start http://localhost:3000

echo.
echo NOTE: Keep all terminal windows open while using the system.
echo To stop: Press Ctrl+C in each terminal window.
pause
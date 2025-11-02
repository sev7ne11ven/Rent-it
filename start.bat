@echo off
echo Starting Rent-It Application...
echo.

echo [2/3] Starting Backend Server...
cd backend
start "Backend" uvicorn server:app --reload --port 8000
cd ..

echo [3/3] Starting Frontend...
start "Frontend" npm start

echo.
echo All services starting! Please wait...
echo Frontend: http://localhost:3000
pause
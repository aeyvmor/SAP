@echo off
echo 🏭 Starting Complete SAP Manufacturing System...
echo =============================================

echo.
echo 🚀 Starting Backend Server...
start "SAP Backend" cmd /k "cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo 🎨 Starting Frontend Server...
start "SAP Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ✅ Both servers are starting up!
echo ================================
echo.
echo Access your application at:
echo   🌐 Frontend:          http://localhost:3000
echo   📡 Backend API:       http://localhost:8000
echo   📊 Backend Dashboard: http://localhost:8000/dashboard
echo.
echo Two command prompt windows will open for backend and frontend.
echo Close those windows to stop the servers.
echo.
pause
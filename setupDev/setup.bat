@echo off
echo 🏭 SAP Manufacturing System Setup
echo =================================

echo.
echo 📋 Checking Prerequisites...

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.12+ first.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('python --version') do echo ✅ Python found: %%i
)

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js found: %%i
)

:: Check PostgreSQL
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  PostgreSQL not found. Please ensure PostgreSQL is installed.
) else (
    for /f "tokens=*" %%i in ('psql --version') do echo ✅ PostgreSQL found: %%i
)

echo.
echo 🔧 Setting up Backend...

if exist "backend" (
    cd backend
    echo 📦 Installing Python dependencies...
    python -m pip install --upgrade pip
    python -m pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo ❌ Failed to install backend dependencies
        cd ..
        pause
        exit /b 1
    )
    echo ✅ Backend dependencies installed successfully!
    cd ..
) else (
    echo ❌ Backend directory not found!
    pause
    exit /b 1
)

echo.
echo 🎨 Setting up Frontend...

if exist "frontend" (
    cd frontend
    echo 📦 Installing Node.js dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies
        cd ..
        pause
        exit /b 1
    )
    echo ✅ Frontend dependencies installed successfully!
    cd ..
) else (
    echo ❌ Frontend directory not found!
    pause
    exit /b 1
)

echo.
echo 🗄️  Database Setup...
echo Please ensure PostgreSQL is running and create the 'sap' database:
echo   1. Run: psql -U postgres
echo   2. Enter password: admin
echo   3. Run: CREATE DATABASE sap;
echo   4. Run: \q

echo.
echo ✅ Setup Complete!
echo ==================
echo.
echo To start the application:
echo   Backend:  start-backend.bat
echo   Frontend: start-frontend.bat
echo   Both:     start-all.bat
echo.
echo Access points:
echo   Backend API:       http://localhost:8000
echo   Backend Dashboard: http://localhost:8000/dashboard
echo   Frontend:          http://localhost:3000
echo.
pause
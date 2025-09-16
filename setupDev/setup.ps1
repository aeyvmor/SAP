# SAP Manufacturing System - Windows PowerShell Setup Script
# This script sets up the entire development environment

Write-Host "🏭 SAP Manufacturing System Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check if Python is installed
Write-Host "`n📋 Checking Prerequisites..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.12+ first." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL is available
try {
    $pgVersion = psql --version 2>&1
    Write-Host "✅ PostgreSQL found: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL not found. Please ensure PostgreSQL is installed and accessible." -ForegroundColor Yellow
}

Write-Host "`n🔧 Setting up Backend..." -ForegroundColor Yellow

# Backend setup
if (Test-Path "backend") {
    Set-Location backend
    
    Write-Host "📦 Installing Python dependencies..." -ForegroundColor Blue
    try {
        python -m pip install --upgrade pip
        python -m pip install -r requirements.txt
        Write-Host "✅ Backend dependencies installed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    Set-Location ..
} else {
    Write-Host "❌ Backend directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎨 Setting up Frontend..." -ForegroundColor Yellow

# Frontend setup
if (Test-Path "frontend") {
    Set-Location frontend
    
    Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Blue
    try {
        npm install
        Write-Host "✅ Frontend dependencies installed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    Set-Location ..
} else {
    Write-Host "❌ Frontend directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`n🗄️  Database Setup..." -ForegroundColor Yellow
Write-Host "Please ensure PostgreSQL is running and create the 'sap' database:" -ForegroundColor Blue
Write-Host "  1. Run: psql -U postgres" -ForegroundColor White
Write-Host "  2. Enter password: admin" -ForegroundColor White
Write-Host "  3. Run: CREATE DATABASE sap;" -ForegroundColor White
Write-Host "  4. Run: \q" -ForegroundColor White

Write-Host "`n✅ Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host "`nTo start the application:" -ForegroundColor Cyan
Write-Host "  Backend:  .\start-backend.ps1" -ForegroundColor White
Write-Host "  Frontend: .\start-frontend.ps1" -ForegroundColor White
Write-Host "  Both:     .\start-all.ps1" -ForegroundColor White
Write-Host "`nAccess points:" -ForegroundColor Cyan
Write-Host "  Backend API:      http://localhost:8000" -ForegroundColor White
Write-Host "  Backend Dashboard: http://localhost:8000/dashboard" -ForegroundColor White
Write-Host "  Frontend:         http://localhost:3000" -ForegroundColor White
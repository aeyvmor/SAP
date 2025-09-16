# SAP Manufacturing System - One-Click Setup & Run
Write-Host "🏭 SAP Manufacturing System - One-Click Setup" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Check prerequisites
Write-Host "`n📋 Checking Prerequisites..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Install Python 3.12+ first." -ForegroundColor Red
    pause; exit 1
}

try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Install Node.js first." -ForegroundColor Red
    pause; exit 1
}

# Setup backend
Write-Host "`n🔧 Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location ..\backend
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend setup failed" -ForegroundColor Red
    Set-Location ..\setupDev
    pause; exit 1
}
Write-Host "✅ Backend ready!" -ForegroundColor Green

# Setup frontend
Write-Host "`n🎨 Installing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location ..\frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend setup failed" -ForegroundColor Red
    Set-Location ..\setupDev
    pause; exit 1
}
Write-Host "✅ Frontend ready!" -ForegroundColor Green

Set-Location ..\setupDev

# Database reminder
Write-Host "`n🗄️  Database Setup Required:" -ForegroundColor Yellow
Write-Host "  Run: psql -U postgres" -ForegroundColor White
Write-Host "  Then: CREATE DATABASE sap;" -ForegroundColor White
Write-Host "  Password is: admin" -ForegroundColor White

# Ask if user wants to start servers
Write-Host "`n🚀 Setup Complete! Start servers now? (Y/N)" -ForegroundColor Green
$response = Read-Host
if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host "`n🚀 Starting Backend..." -ForegroundColor Blue
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ..\backend; python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
    
    Start-Sleep 3
    
    Write-Host "🎨 Starting Frontend..." -ForegroundColor Blue
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ..\frontend; npm run dev"
    
    Write-Host "`n✅ Both servers starting!" -ForegroundColor Green
    Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "📡 Backend: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "📊 Dashboard: http://localhost:8000/dashboard" -ForegroundColor Cyan
}

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
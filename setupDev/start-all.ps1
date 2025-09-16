# Start Both Backend and Frontend Servers
Write-Host "🏭 Starting Complete SAP Manufacturing System..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Function to start backend in background
function Start-Backend {
    Write-Host "`n🚀 Starting Backend Server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '.\start-backend.ps1'"
    Start-Sleep 3
}

# Function to start frontend in background
function Start-Frontend {
    Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '.\start-frontend.ps1'"
    Start-Sleep 3
}

# Start both servers
Start-Backend
Start-Frontend

Write-Host "`n✅ Both servers are starting up!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "`nAccess your application at:" -ForegroundColor Cyan
Write-Host "  🌐 Frontend:          http://localhost:3000" -ForegroundColor White
Write-Host "  📡 Backend API:       http://localhost:8000" -ForegroundColor White
Write-Host "  📊 Backend Dashboard: http://localhost:8000/dashboard" -ForegroundColor White
Write-Host "`nTwo PowerShell windows will open for backend and frontend." -ForegroundColor Yellow
Write-Host "Close those windows to stop the servers." -ForegroundColor Yellow
Write-Host "`nPress any key to exit this script..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
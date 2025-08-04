# Script PowerShell para iniciar solo Frontend y Gateway (sin autenticación)
Write-Host "========================================" -ForegroundColor Green
Write-Host "  INICIANDO FRONTEND Y GATEWAY" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Iniciando servicios en orden:" -ForegroundColor Cyan
Write-Host "1. Gateway (puerto 3000)" -ForegroundColor White
Write-Host "2. Frontend (puerto 3006)" -ForegroundColor White
Write-Host ""

Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "[1/2] Iniciando Gateway..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd gateway; npm run dev" -WindowStyle Normal

Write-Host "[2/2] Iniciando Frontend..." -ForegroundColor Green
Start-Sleep -Seconds 5
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SERVICIOS INICIADOS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Servicios disponibles:" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:3006" -ForegroundColor White
Write-Host "- Gateway API: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "El frontend irá directamente al Dashboard sin autenticación" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para detener los servicios, cierra las ventanas de PowerShell" -ForegroundColor Yellow
Write-Host ""
Read-Host "Presiona Enter para salir" 
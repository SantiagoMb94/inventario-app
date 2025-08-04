# Script simple para iniciar el frontend del sistema de inventario
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SISTEMA DE INVENTARIO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Iniciando Frontend..." -ForegroundColor Cyan
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm start" -WindowStyle Normal

Write-Host "Frontend iniciado!" -ForegroundColor Green
Write-Host ""
Write-Host "Accede a: http://localhost:3006" -ForegroundColor Yellow
Write-Host ""
Write-Host "El sistema irá directamente al Dashboard" -ForegroundColor White
Write-Host "Navega entre Dashboard, Equipment, Reports y Settings" -ForegroundColor White
Write-Host ""
Read-Host "Presiona Enter para salir" 
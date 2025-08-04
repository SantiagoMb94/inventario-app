# Script PowerShell para iniciar todos los servicios en local
Write-Host "========================================" -ForegroundColor Green
Write-Host "  INICIANDO TODOS LOS SERVICIOS LOCALES" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "IMPORTANTE: Asegúrate de que PostgreSQL esté corriendo" -ForegroundColor Yellow
Write-Host "y que el archivo .env esté configurado correctamente" -ForegroundColor Yellow
Write-Host ""

Write-Host "Iniciando servicios en orden:" -ForegroundColor Cyan
Write-Host "1. Gateway (puerto 3000)" -ForegroundColor White
Write-Host "2. Auth Service (puerto 3001)" -ForegroundColor White
Write-Host "3. Equipos Service (puerto 3002)" -ForegroundColor White
Write-Host "4. Inventario Service (puerto 3003)" -ForegroundColor White
Write-Host "5. Frontend (puerto 3006)" -ForegroundColor White
Write-Host ""

Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "[1/5] Iniciando Gateway..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd gateway; npm run dev" -WindowStyle Normal

Write-Host "[2/5] Iniciando Auth Service..." -ForegroundColor Green
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services\auth-service; npm run dev" -WindowStyle Normal

Write-Host "[3/5] Iniciando Equipos Service..." -ForegroundColor Green
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services\equipos-service; npm run dev" -WindowStyle Normal

Write-Host "[4/5] Iniciando Inventario Service..." -ForegroundColor Green
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services\inventario-service; npm run dev" -WindowStyle Normal

Write-Host "[5/5] Iniciando Frontend..." -ForegroundColor Green
Start-Sleep -Seconds 5
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  TODOS LOS SERVICIOS INICIADOS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Servicios disponibles:" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:3006" -ForegroundColor White
Write-Host "- Gateway API: http://localhost:3000" -ForegroundColor White
Write-Host "- Auth Service: http://localhost:3001" -ForegroundColor White
Write-Host "- Equipos Service: http://localhost:3002" -ForegroundColor White
Write-Host "- Inventario Service: http://localhost:3003" -ForegroundColor White
Write-Host ""
Write-Host "Para detener todos los servicios, cierra las ventanas de PowerShell" -ForegroundColor Yellow
Write-Host ""
Read-Host "Presiona Enter para salir" 
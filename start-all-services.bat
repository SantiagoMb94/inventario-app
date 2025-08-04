@echo off
echo ========================================
echo   INICIANDO TODOS LOS SERVICIOS
echo ========================================
echo.

echo IMPORTANTE: Asegurate de que PostgreSQL este corriendo
echo y que el archivo .env este configurado correctamente
echo.

echo Iniciando servicios en orden:
echo 1. Gateway (puerto 3000)
echo 2. Auth Service (puerto 3001)
echo 3. Equipos Service (puerto 3002)
echo 4. Inventario Service (puerto 3003)
echo 5. Frontend (puerto 3006)
echo.

echo Presiona cualquier tecla para continuar...
pause > nul

echo.
echo [1/5] Iniciando Gateway...
start "Gateway" cmd /k "cd gateway && npm run dev"

echo [2/5] Iniciando Auth Service...
timeout /t 3 /nobreak > nul
start "Auth Service" cmd /k "cd services\auth-service && npm run dev"

echo [3/5] Iniciando Equipos Service...
timeout /t 3 /nobreak > nul
start "Equipos Service" cmd /k "cd services\equipos-service && npm run dev"

echo [4/5] Iniciando Inventario Service...
timeout /t 3 /nobreak > nul
start "Inventario Service" cmd /k "cd services\inventario-service && npm run dev"

echo [5/5] Iniciando Frontend...
timeout /t 5 /nobreak > nul
start "Frontend" cmd /k "cd client && npm start"

echo.
echo ========================================
echo   TODOS LOS SERVICIOS INICIADOS
echo ========================================
echo.
echo Servicios disponibles:
echo - Frontend: http://localhost:3006
echo - Gateway API: http://localhost:3000
echo - Auth Service: http://localhost:3001
echo - Equipos Service: http://localhost:3002
echo - Inventario Service: http://localhost:3003
echo.
echo Para detener todos los servicios, cierra las ventanas de comandos
echo.
pause 
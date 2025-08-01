@echo off
echo ========================================
echo    DESPLIEGUE EN WINDOWS - INVENTARIO
echo ========================================
echo.

echo [1/6] Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker no esta instalado o no esta ejecutandose
    echo Por favor instala Docker Desktop y asegurate de que este corriendo
    pause
    exit /b 1
)
echo ✓ Docker encontrado

echo.
echo [2/6] Verificando archivo .env...
if not exist ".env" (
    echo Creando archivo .env desde env.example...
    copy env.example .env
    echo ✓ Archivo .env creado
    echo Por favor edita el archivo .env con tus configuraciones
    pause
) else (
    echo ✓ Archivo .env encontrado
)

echo.
echo [3/6] Creando directorios necesarios...
if not exist "logs" mkdir logs
if not exist "data" mkdir data
if not exist "database\migrations" mkdir database\migrations
if not exist "database\seeds" mkdir database\seeds
echo ✓ Directorios creados

echo.
echo [4/6] Deteniendo servicios existentes...
docker-compose -f docker-compose.dev.yml down
echo ✓ Servicios detenidos

echo.
echo [5/6] Construyendo y levantando servicios...
docker-compose -f docker-compose.dev.yml build --no-cache
if errorlevel 1 (
    echo ERROR: Error al construir las imagenes
    pause
    exit /b 1
)

docker-compose -f docker-compose.dev.yml up -d
if errorlevel 1 (
    echo ERROR: Error al levantar los servicios
    pause
    exit /b 1
)
echo ✓ Servicios levantados

echo.
echo [6/6] Verificando servicios...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo           DESPLIEGUE COMPLETADO
echo ========================================
echo.
echo 📊 Servicios disponibles:
echo    - Frontend:     http://localhost:3005
echo    - API Gateway:  http://localhost:3000
echo    - PostgreSQL:   localhost:5432
echo.
echo 🔐 Credenciales por defecto:
echo    - Email: admin@inventario.com
echo    - Password: admin123
echo.
echo 📋 Comandos utiles:
echo    - Ver servicios: docker-compose -f docker-compose.dev.yml ps
echo    - Ver logs:      docker-compose -f docker-compose.dev.yml logs -f
echo    - Parar:         docker-compose -f docker-compose.dev.yml down
echo.
echo 🎉 ¡Aplicacion lista para usar!
echo.
pause 
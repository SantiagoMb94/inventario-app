@echo off
echo ========================================
echo   CONFIGURACION LOCAL - SISTEMA INVENTARIO
echo ========================================
echo.

echo [1/6] Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo [2/6] Verificando PostgreSQL...
echo Asegurate de que PostgreSQL este instalado y corriendo en puerto 5432
echo Usuario: inventario_user
echo Password: inventario_pass_secure_2024
echo Base de datos: inventario_db
echo.

echo [3/6] Creando archivo .env local...
if not exist .env (
    copy env.example .env
    echo Archivo .env creado desde env.example
    echo IMPORTANTE: Edita el archivo .env con tus configuraciones locales
) else (
    echo Archivo .env ya existe
)

echo.
echo [4/6] Instalando dependencias del Gateway...
cd gateway
npm install
cd ..

echo.
echo [5/6] Instalando dependencias de los servicios...
cd services\auth-service
npm install
cd ..\equipos-service
npm install
cd ..\inventario-service
npm install
cd ..\..

echo.
echo [6/6] Instalando dependencias del Frontend...
cd client
npm install
cd ..

echo.
echo ========================================
echo   CONFIGURACION COMPLETADA
echo ========================================
echo.
echo Para ejecutar el sistema completo:
echo 1. Ejecuta: start-all-services.bat
echo 2. O ejecuta cada servicio manualmente:
echo    - Gateway: cd gateway && npm run dev
echo    - Auth Service: cd services\auth-service && npm run dev
echo    - Equipos Service: cd services\equipos-service && npm run dev
echo    - Inventario Service: cd services\inventario-service && npm run dev
echo    - Frontend: cd client && npm start
echo.
pause 
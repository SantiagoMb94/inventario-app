@echo off
echo ========================================
echo   CONFIGURACION BASE DE DATOS LOCAL
echo ========================================
echo.

echo IMPORTANTE: Asegurate de que PostgreSQL este instalado y corriendo
echo.

echo [1/4] Verificando conexion a PostgreSQL...
psql -U postgres -c "SELECT version();" > nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: No se puede conectar a PostgreSQL
    echo Asegurate de que PostgreSQL este instalado y corriendo
    echo.
    echo Para instalar PostgreSQL:
    echo 1. Descarga desde: https://www.postgresql.org/download/
    echo 2. Instala con usuario 'postgres' y password que recuerdes
    echo 3. Asegurate de que el servicio este corriendo
    pause
    exit /b 1
)

echo.
echo [2/4] Creando usuario de base de datos...
psql -U postgres -c "CREATE USER inventario_user WITH PASSWORD 'inventario_pass_secure_2024';" 2>nul
if %errorlevel% equ 0 (
    echo Usuario creado exitosamente
) else (
    echo Usuario ya existe o error al crear
)

echo.
echo [3/4] Creando base de datos...
psql -U postgres -c "CREATE DATABASE inventario_db OWNER inventario_user;" 2>nul
if %errorlevel% equ 0 (
    echo Base de datos creada exitosamente
) else (
    echo Base de datos ya existe o error al crear
)

echo.
echo [4/4] Ejecutando script de inicializacion...
psql -U inventario_user -d inventario_db -f database/init.sql
if %errorlevel% equ 0 (
    echo Script de inicializacion ejecutado exitosamente
) else (
    echo Error al ejecutar script de inicializacion
)

echo.
echo ========================================
echo   BASE DE DATOS CONFIGURADA
echo ========================================
echo.
echo Configuracion:
echo - Host: localhost
echo - Puerto: 5432
echo - Base de datos: inventario_db
echo - Usuario: inventario_user
echo - Password: inventario_pass_secure_2024
echo.
echo Ahora puedes ejecutar: setup-local.bat
echo.
pause 
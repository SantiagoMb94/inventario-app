@echo off
echo Reiniciando Docker Desktop...

echo Deteniendo Docker Desktop...
taskkill /f /im "Docker Desktop.exe" 2>nul
taskkill /f /im "com.docker.service" 2>nul
taskkill /f /im "com.docker.wsl-distro-proxy" 2>nul

echo Esperando 5 segundos...
timeout /t 5 /nobreak >nul

echo Iniciando Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo Esperando a que Docker se inicie completamente...
timeout /t 30 /nobreak >nul

echo Verificando estado de Docker...
docker info

echo Docker Desktop reiniciado. Intenta ejecutar docker-compose nuevamente.
pause 
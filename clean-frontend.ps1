# Script para limpiar caché y reiniciar el frontend
Write-Host "🧹 Limpiando caché del frontend..." -ForegroundColor Cyan

# Detener procesos de React si están corriendo
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# Limpiar caché de npm
Write-Host "📦 Limpiando caché de npm..." -ForegroundColor Yellow
cd client
npm cache clean --force

# Eliminar node_modules y reinstalar
Write-Host "🗑️ Eliminando node_modules..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Reinstalar dependencias
Write-Host "📥 Reinstalando dependencias..." -ForegroundColor Green
npm install

# Volver al directorio raíz
cd ..

Write-Host "✅ Limpieza completada!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Para iniciar el frontend:" -ForegroundColor Yellow
Write-Host "   cd client" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Read-Host "Presiona Enter para continuar" 
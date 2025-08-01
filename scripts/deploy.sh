#!/bin/bash

# Script de despliegue de Inventario App
# Autor: Suti
# Fecha: 2024

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables
PROJECT_DIR="/home/suti/inventario-app"
USERNAME="suti"

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Verificar que estamos en el directorio correcto
if [[ ! -f "docker-compose.yml" ]]; then
    error "No se encontró docker-compose.yml. Ejecuta este script desde el directorio raíz del proyecto."
fi

log "🚀 Iniciando despliegue de Inventario App"

# ========================================
# 1. VERIFICAR DOCKER Y DOCKER COMPOSE
# ========================================
log "🔍 Verificando Docker..."
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado. Ejecuta primero setup-server.sh"
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado. Ejecuta primero setup-server.sh"
fi

# ========================================
# 2. VERIFICAR ARCHIVO .ENV
# ========================================
log "🔍 Verificando configuración..."
if [[ ! -f ".env" ]]; then
    warn "Archivo .env no encontrado. Creando desde .env.example..."
    if [[ -f "env.example" ]]; then
        cp env.example .env
        log "✅ Archivo .env creado. Por favor, edita las variables según tu configuración."
        log "   nano .env"
        read -p "Presiona Enter después de configurar .env..."
    else
        error "No se encontró env.example. Crea manualmente el archivo .env"
    fi
fi

# ========================================
# 3. CREAR DIRECTORIOS NECESARIOS
# ========================================
log "📁 Creando directorios necesarios..."
mkdir -p logs
mkdir -p data
mkdir -p nginx/ssl
mkdir -p database/migrations
mkdir -p database/seeds

# ========================================
# 4. CONSTRUIR Y LEVANTAR SERVICIOS
# ========================================
log "🐳 Construyendo y levantando servicios..."

# Detener servicios existentes si los hay
if docker-compose ps | grep -q "Up"; then
    log "🛑 Deteniendo servicios existentes..."
    docker-compose down
fi

# Construir imágenes
log "🔨 Construyendo imágenes Docker..."
docker-compose build --no-cache

# Levantar servicios
log "🚀 Levantando servicios..."
docker-compose up -d

# ========================================
# 5. VERIFICAR ESTADO DE SERVICIOS
# ========================================
log "🔍 Verificando estado de servicios..."
sleep 10

# Verificar que todos los servicios estén corriendo
services=("postgres" "gateway" "auth-service" "equipos-service" "inventario-service" "reportes-service" "client" "nginx")
all_running=true

for service in "${services[@]}"; do
    if docker-compose ps | grep -q "$service.*Up"; then
        log "✅ $service: Activo"
    else
        log "❌ $service: Inactivo"
        all_running=false
    fi
done

if [[ "$all_running" == false ]]; then
    warn "Algunos servicios no están corriendo. Revisando logs..."
    docker-compose logs --tail=20
    error "Despliegue incompleto. Revisa los logs arriba."
fi

# ========================================
# 6. CONFIGURAR BASE DE DATOS
# ========================================
log "🗄️ Configurando base de datos..."
sleep 5

# Esperar a que PostgreSQL esté listo
log "⏳ Esperando a que PostgreSQL esté listo..."
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U inventario_user; then
        log "✅ PostgreSQL listo"
        break
    fi
    if [[ $i -eq 30 ]]; then
        error "PostgreSQL no se pudo conectar después de 30 intentos"
    fi
    sleep 2
done

# Ejecutar migraciones si existen
if [[ -f "scripts/migrate-data.js" ]]; then
    log "🔄 Ejecutando migración de datos..."
    docker-compose exec equipos-service node /app/scripts/migrate-data.js
fi

# ========================================
# 7. CONFIGURAR CERTIFICADOS SSL
# ========================================
log "🔒 Configurando certificados SSL..."
if [[ -f ".env" ]]; then
    source .env
    if [[ -n "$SSL_EMAIL" && -n "$SSL_DOMAIN" ]]; then
        log "📧 Configurando certificado para $SSL_DOMAIN"
        
        # Crear certificado temporal para IP
        if [[ "$SSL_DOMAIN" == "10.55.55.20" ]]; then
            warn "Configurando certificado para IP. Para producción, usa un dominio real."
            
            # Generar certificado autofirmado temporal
            if [[ ! -f "nginx/ssl/live/10.55.55.20/fullchain.pem" ]]; then
                log "🔐 Generando certificado autofirmado temporal..."
                mkdir -p nginx/ssl/live/10.55.55.20
                
                # Generar certificado autofirmado
                openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                    -keyout nginx/ssl/live/10.55.55.20/privkey.pem \
                    -out nginx/ssl/live/10.55.55.20/fullchain.pem \
                    -subj "/C=ES/ST=Madrid/L=Madrid/O=Inventario/OU=IT/CN=10.55.55.20"
                
                log "✅ Certificado autofirmado generado"
            fi
        else
            # Para dominio real, usar Let's Encrypt
            log "🌐 Configurando certificado Let's Encrypt para $SSL_DOMAIN"
            docker-compose exec nginx certbot --nginx -d $SSL_DOMAIN --email $SSL_EMAIL --agree-tos --non-interactive
        fi
    else
        warn "Variables SSL_EMAIL o SSL_DOMAIN no configuradas. Saltando configuración SSL."
    fi
fi

# ========================================
# 8. VERIFICAR CONECTIVIDAD
# ========================================
log "🌐 Verificando conectividad..."

# Verificar gateway
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    log "✅ Gateway API: Accesible"
else
    warn "⚠️ Gateway API: No accesible en puerto 3000"
fi

# Verificar nginx
if curl -f http://localhost > /dev/null 2>&1; then
    log "✅ Nginx: Accesible en puerto 80"
else
    warn "⚠️ Nginx: No accesible en puerto 80"
fi

# Verificar HTTPS si existe certificado
if [[ -f "nginx/ssl/live/10.55.55.20/fullchain.pem" ]]; then
    if curl -k -f https://localhost > /dev/null 2>&1; then
        log "✅ Nginx HTTPS: Accesible en puerto 443"
    else
        warn "⚠️ Nginx HTTPS: No accesible en puerto 443"
    fi
fi

# ========================================
# 9. MOSTRAR INFORMACIÓN FINAL
# ========================================
log "🎉 ¡Despliegue completado exitosamente!"

echo ""
echo "=========================================="
echo "🌐 ACCESO A LA APLICACIÓN"
echo "=========================================="
echo "Frontend:     http://10.55.55.20"
echo "API Gateway:  http://10.55.55.20/api"
echo "Health Check: http://10.55.55.20/health"
echo ""

echo "=========================================="
echo "🔧 COMANDOS ÚTILES"
echo "=========================================="
echo "Ver servicios:     docker-compose ps"
echo "Ver logs:          docker-compose logs -f"
echo "Reiniciar:         docker-compose restart"
echo "Parar:             docker-compose down"
echo "Backup:            /home/suti/backup-inventario.sh"
echo "Monitoreo:         /home/suti/monitor.sh"
echo ""

echo "=========================================="
echo "📊 ESTADO DE SERVICIOS"
echo "=========================================="
docker-compose ps

echo ""
log "📖 Para más información, consulta: /home/suti/server-info.txt"
log "🔐 Usuario: $USERNAME"
log "�� IP: 10.55.55.20" 
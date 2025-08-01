#!/bin/bash

# Script de configuración completa del servidor Ubuntu para Inventario App
# Autor: Suti
# Fecha: 2024

set -e  # Salir en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables de configuración
SERVER_IP="10.55.55.20"
USERNAME="suti"
PASSWORD="Meteoro2021*+"
PROJECT_DIR="/home/suti/inventario-app"

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

# Función para ejecutar comandos con verificación
run_cmd() {
    local cmd="$1"
    local description="$2"
    
    log "Ejecutando: $description"
    if eval "$cmd"; then
        log "✅ $description completado"
    else
        error "❌ Falló: $description"
    fi
}

# Verificar que estamos como root
if [[ $EUID -ne 0 ]]; then
   error "Este script debe ejecutarse como root"
fi

log "🚀 Iniciando configuración del servidor Ubuntu para Inventario App"
log "IP del servidor: $SERVER_IP"
log "Usuario: $USERNAME"

# ========================================
# 1. ACTUALIZACIÓN DEL SISTEMA
# ========================================
log "📦 Actualizando sistema operativo..."
run_cmd "apt update && apt upgrade -y" "Actualización del sistema"
run_cmd "apt autoremove -y" "Limpieza de paquetes no utilizados"

# ========================================
# 2. INSTALACIÓN DE PAQUETES BÁSICOS
# ========================================
log "📦 Instalando paquetes básicos..."
run_cmd "apt install -y curl wget git vim htop ufw fail2ban ntp ntpdate" "Instalación de paquetes básicos"

# ========================================
# 3. CONFIGURACIÓN DE USUARIO
# ========================================
log "👤 Configurando usuario..."
if id "$USERNAME" &>/dev/null; then
    warn "Usuario $USERNAME ya existe"
else
    run_cmd "useradd -m -s /bin/bash $USERNAME" "Creación de usuario $USERNAME"
    echo "$USERNAME:$PASSWORD" | chpasswd
    log "✅ Contraseña configurada para $USERNAME"
fi

# Agregar usuario al grupo sudo
run_cmd "usermod -aG sudo $USERNAME" "Agregando usuario al grupo sudo"

# ========================================
# 4. CONFIGURACIÓN DE RED
# ========================================
log "🌐 Configurando red..."
cat > /etc/netplan/01-netcfg.yaml << EOF
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      dhcp4: false
      addresses:
        - $SERVER_IP/24
      gateway4: 10.55.55.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
EOF

run_cmd "netplan apply" "Aplicando configuración de red"

# ========================================
# 5. CONFIGURACIÓN DE FIREWALL (UFW)
# ========================================
log "🔥 Configurando firewall..."
run_cmd "ufw --force reset" "Reseteando firewall"
run_cmd "ufw default deny incoming" "Configurando política por defecto"
run_cmd "ufw default allow outgoing" "Permitiendo tráfico saliente"
run_cmd "ufw allow ssh" "Permitiendo SSH"
run_cmd "ufw allow 80/tcp" "Permitiendo HTTP"
run_cmd "ufw allow 443/tcp" "Permitiendo HTTPS"
run_cmd "ufw --force enable" "Activando firewall"

# ========================================
# 6. INSTALACIÓN DE DOCKER
# ========================================
log "🐳 Instalando Docker..."
run_cmd "apt install -y apt-transport-https ca-certificates curl gnupg lsb-release" "Instalando dependencias de Docker"
run_cmd "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg" "Agregando clave GPG de Docker"
run_cmd "echo \"deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \$(lsb_release -cs) stable\" | tee /etc/apt/sources.list.d/docker.list > /dev/null" "Agregando repositorio de Docker"
run_cmd "apt update" "Actualizando repositorios"
run_cmd "apt install -y docker-ce docker-ce-cli containerd.io" "Instalando Docker CE"

# Agregar usuario al grupo docker
run_cmd "usermod -aG docker $USERNAME" "Agregando usuario al grupo docker"

# Iniciar y habilitar Docker
run_cmd "systemctl start docker" "Iniciando Docker"
run_cmd "systemctl enable docker" "Habilitando Docker"

# ========================================
# 7. INSTALACIÓN DE DOCKER COMPOSE
# ========================================
log "🐳 Instalando Docker Compose..."
run_cmd "curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose" "Descargando Docker Compose"
run_cmd "chmod +x /usr/local/bin/docker-compose" "Haciendo ejecutable Docker Compose"

# ========================================
# 8. INSTALACIÓN DE CERTBOT
# ========================================
log "🔒 Instalando Certbot..."
run_cmd "apt install -y certbot python3-certbot-nginx" "Instalando Certbot"

# ========================================
# 9. CONFIGURACIÓN DE NTP
# ========================================
log "⏰ Configurando NTP..."
run_cmd "systemctl start ntp" "Iniciando NTP"
run_cmd "systemctl enable ntp" "Habilitando NTP"
run_cmd "ntpdate -s time.nist.gov" "Sincronizando tiempo"

# ========================================
# 10. CONFIGURACIÓN DE FAIL2BAN
# ========================================
log "🛡️ Configurando Fail2ban..."
run_cmd "systemctl start fail2ban" "Iniciando Fail2ban"
run_cmd "systemctl enable fail2ban" "Habilitando Fail2ban"

# ========================================
# 11. CREACIÓN DE DIRECTORIOS DEL PROYECTO
# ========================================
log "📁 Creando directorios del proyecto..."
run_cmd "mkdir -p $PROJECT_DIR" "Creando directorio del proyecto"
run_cmd "mkdir -p /home/suti/backups" "Creando directorio de backups"
run_cmd "chown -R $USERNAME:$USERNAME $PROJECT_DIR" "Cambiando propiedad del directorio"
run_cmd "chown -R $USERNAME:$USERNAME /home/suti/backups" "Cambiando propiedad del directorio de backups"

# ========================================
# 12. CONFIGURACIÓN DE LOGROTATE
# ========================================
log "📝 Configurando logrotate..."
cat > /etc/logrotate.d/inventario-app << EOF
/home/suti/inventario-app/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USERNAME $USERNAME
    postrotate
        systemctl reload nginx
    endscript
}
EOF

# ========================================
# 13. CONFIGURACIÓN DE BACKUP AUTOMÁTICO
# ========================================
log "💾 Configurando backup automático..."
cat > /home/suti/backup-inventario.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/suti/backups"
PROJECT_DIR="/home/suti/inventario-app"

# Crear backup de la base de datos
docker exec inventario_postgres pg_dump -U inventario_user inventario_db > $BACKUP_DIR/db_backup_$DATE.sql

# Crear backup de archivos de configuración
tar -czf $BACKUP_DIR/config_backup_$DATE.tar.gz -C $PROJECT_DIR .env* docker-compose.yml

# Limpiar backups antiguos (mantener solo 30 días)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completado: $DATE"
EOF

run_cmd "chmod +x /home/suti/backup-inventario.sh" "Haciendo ejecutable script de backup"
run_cmd "chown $USERNAME:$USERNAME /home/suti/backup-inventario.sh" "Cambiando propiedad del script"

# Agregar cron job para backup diario
echo "0 2 * * * /home/suti/backup-inventario.sh" | crontab -u $USERNAME -

# ========================================
# 14. CONFIGURACIÓN DE MONITOREO
# ========================================
log "📊 Configurando monitoreo básico..."
cat > /home/suti/monitor.sh << 'EOF'
#!/bin/bash
# Script de monitoreo básico

# Verificar servicios Docker
if ! docker ps | grep -q "inventario_"; then
    echo "ALERTA: Algunos servicios de inventario no están corriendo"
    # Aquí podrías agregar notificación por email
fi

# Verificar espacio en disco
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "ALERTA: Uso de disco alto: ${DISK_USAGE}%"
fi

# Verificar memoria
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM_USAGE -gt 80 ]; then
    echo "ALERTA: Uso de memoria alto: ${MEM_USAGE}%"
fi
EOF

run_cmd "chmod +x /home/suti/monitor.sh" "Haciendo ejecutable script de monitoreo"
run_cmd "chown $USERNAME:$USERNAME /home/suti/monitor.sh" "Cambiando propiedad del script"

# ========================================
# 15. CONFIGURACIÓN FINAL
# ========================================
log "🔧 Configuración final..."

# Crear archivo de información del sistema
cat > /home/suti/server-info.txt << EOF
=== INFORMACIÓN DEL SERVIDOR ===
Fecha de configuración: $(date)
IP del servidor: $SERVER_IP
Usuario: $USERNAME
Directorio del proyecto: $PROJECT_DIR

=== COMANDOS ÚTILES ===
Verificar servicios: docker ps
Ver logs: docker-compose logs
Reiniciar servicios: docker-compose restart
Backup manual: /home/suti/backup-inventario.sh
Monitoreo: /home/suti/monitor.sh

=== PUERTOS ABIERTOS ===
22 - SSH
80 - HTTP
443 - HTTPS

=== DIRECTORIOS IMPORTANTES ===
Proyecto: $PROJECT_DIR
Backups: /home/suti/backups
Logs: $PROJECT_DIR/logs
EOF

run_cmd "chown $USERNAME:$USERNAME /home/suti/server-info.txt" "Cambiando propiedad del archivo de información"

# ========================================
# 16. MENSAJE FINAL
# ========================================
log "🎉 ¡Configuración del servidor completada!"
log "📋 Próximos pasos:"
log "   1. Copiar el código del proyecto a $PROJECT_DIR"
log "   2. Configurar variables de entorno en .env"
log "   3. Ejecutar: docker-compose up -d"
log "   4. Configurar certificados SSL con Certbot"
log ""
log "📖 Información del servidor guardada en: /home/suti/server-info.txt"
log "🔐 Usuario: $USERNAME"
log "🌐 IP: $SERVER_IP"
log ""
log "⚠️  IMPORTANTE: Reinicia el servidor para aplicar todos los cambios"
log "   sudo reboot"

# Mostrar estado final
log "📊 Estado final de servicios:"
systemctl is-active --quiet docker && log "✅ Docker: Activo" || error "❌ Docker: Inactivo"
systemctl is-active --quiet ufw && log "✅ UFW: Activo" || error "❌ UFW: Inactivo"
systemctl is-active --quiet fail2ban && log "✅ Fail2ban: Activo" || error "❌ Fail2ban: Inactivo"
systemctl is-active --quiet ntp && log "✅ NTP: Activo" || error "❌ NTP: Inactivo"

log "🎯 Configuración completada exitosamente!" 
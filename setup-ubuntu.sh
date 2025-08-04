#!/bin/bash

# ========================================
# SCRIPT DE CONFIGURACIÓN UBUNTU - SISTEMA INVENTARIO
# ========================================

set -e  # Salir si hay algún error

echo "🚀 Configurando servidor Ubuntu para Sistema de Inventario..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si se ejecuta como root
if [[ $EUID -eq 0 ]]; then
   print_error "Este script no debe ejecutarse como root"
   exit 1
fi

# Actualizar sistema
print_status "Actualizando sistema..."
sudo apt update && sudo apt upgrade -y
print_success "Sistema actualizado"

# Instalar PostgreSQL
print_status "Instalando PostgreSQL..."
sudo apt install postgresql postgresql-contrib -y
print_success "PostgreSQL instalado"

# Iniciar y habilitar PostgreSQL
print_status "Configurando PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql
print_success "PostgreSQL iniciado y habilitado"

# Crear usuario y base de datos
print_status "Creando usuario y base de datos..."
sudo -u postgres psql -c "CREATE USER inventario_user WITH PASSWORD 'inventario_pass_secure_2024';"
sudo -u postgres psql -c "CREATE DATABASE inventario_db OWNER inventario_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE inventario_db TO inventario_user;"
print_success "Usuario y base de datos creados"

# Configurar PostgreSQL para conexiones remotas (opcional)
print_status "Configurando PostgreSQL para conexiones remotas..."
sudo cp /etc/postgresql/*/main/postgresql.conf /etc/postgresql/*/main/postgresql.conf.backup
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf

# Configurar pg_hba.conf para permitir conexiones locales
sudo cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup
echo "host    inventario_db    inventario_user    127.0.0.1/32            md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
echo "host    inventario_db    inventario_user    ::1/128                 md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
print_success "PostgreSQL configurado para conexiones remotas"

# Crear directorio para scripts
print_status "Creando directorio para scripts..."
mkdir -p ~/inventario-scripts
print_success "Directorio creado"

# Crear script de migración de datos
print_status "Creando script de migración..."
cat > ~/inventario-scripts/migrate-database.sh << 'EOF'
#!/bin/bash

echo "🗄️ Ejecutando migración de base de datos..."

# Variables
DB_NAME="inventario_db"
DB_USER="inventario_user"
DB_HOST="localhost"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Función para ejecutar SQL
execute_sql() {
    local sql_file="$1"
    echo "Ejecutando: $sql_file"
    PGPASSWORD=inventario_pass_secure_2024 psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f "$sql_file"
}

# Ejecutar esquema
if [ -f "$SCRIPT_DIR/schema.sql" ]; then
    execute_sql "$SCRIPT_DIR/schema.sql"
    echo "✅ Esquema ejecutado"
else
    echo "❌ No se encontró schema.sql"
    exit 1
fi

# Ejecutar datos de inserción
if [ -f "$SCRIPT_DIR/insert_data.sql" ]; then
    execute_sql "$SCRIPT_DIR/insert_data.sql"
    echo "✅ Datos insertados"
else
    echo "❌ No se encontró insert_data.sql"
    exit 1
fi

echo "🎉 Migración completada exitosamente!"
echo ""
echo "📊 Para verificar la migración:"
echo "   PGPASSWORD=inventario_pass_secure_2024 psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c 'SELECT COUNT(*) FROM equipos;'"
echo "   PGPASSWORD=inventario_pass_secure_2024 psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c 'SELECT COUNT(*) FROM usuarios;'"
EOF

chmod +x ~/inventario-scripts/migrate-database.sh
print_success "Script de migración creado"

# Crear script de backup
print_status "Creando script de backup..."
cat > ~/inventario-scripts/backup-database.sh << 'EOF'
#!/bin/bash

# Variables
DB_NAME="inventario_db"
DB_USER="inventario_user"
DB_HOST="localhost"
BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/inventario_backup_$DATE.sql"

# Crear directorio de backup si no existe
mkdir -p "$BACKUP_DIR"

echo "💾 Creando backup de la base de datos..."
PGPASSWORD=inventario_pass_secure_2024 pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup creado: $BACKUP_FILE"
    
    # Comprimir backup
    gzip "$BACKUP_FILE"
    echo "✅ Backup comprimido: $BACKUP_FILE.gz"
    
    # Mantener solo los últimos 7 backups
    find "$BACKUP_DIR" -name "inventario_backup_*.sql.gz" -mtime +7 -delete
    echo "✅ Backups antiguos eliminados"
else
    echo "❌ Error al crear backup"
    exit 1
fi
EOF

chmod +x ~/inventario-scripts/backup-database.sh
print_success "Script de backup creado"

# Crear script de monitoreo
print_status "Creando script de monitoreo..."
cat > ~/inventario-scripts/monitor-system.sh << 'EOF'
#!/bin/bash

echo "📊 Estado del Sistema de Inventario"
echo "=================================="

# Verificar PostgreSQL
if systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL: ACTIVO"
else
    echo "❌ PostgreSQL: INACTIVO"
fi

# Verificar conexión a base de datos
if PGPASSWORD=inventario_pass_secure_2024 psql -h localhost -U inventario_user -d inventario_db -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Base de datos: CONECTADA"
    
    # Estadísticas básicas
    echo ""
    echo "📈 Estadísticas:"
    PGPASSWORD=inventario_pass_secure_2024 psql -h localhost -U inventario_user -d inventario_db -c "
    SELECT 
        'Equipos' as tipo, COUNT(*) as total FROM equipos
    UNION ALL
    SELECT 
        'Usuarios' as tipo, COUNT(*) as total FROM usuarios
    UNION ALL
    SELECT 
        'Historial' as tipo, COUNT(*) as total FROM historial_cambios;
    "
else
    echo "❌ Base de datos: NO CONECTADA"
fi

# Verificar uso de disco
echo ""
echo "💾 Uso de disco:"
df -h / | tail -1

# Verificar memoria
echo ""
echo "🧠 Uso de memoria:"
free -h | grep "Mem:"
EOF

chmod +x ~/inventario-scripts/monitor-system.sh
print_success "Script de monitoreo creado"

# Crear archivo de configuración
print_status "Creando archivo de configuración..."
cat > ~/inventario-scripts/config.env << 'EOF'
# Configuración del Sistema de Inventario
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventario_db
DB_USER=inventario_user
DB_PASSWORD=inventario_pass_secure_2024

# Configuración de la aplicación
NODE_ENV=production
PORT=3000

# Configuración de backup
BACKUP_RETENTION_DAYS=7
BACKUP_PATH=$HOME/backups
EOF

print_success "Archivo de configuración creado"

# Instalar herramientas adicionales
print_status "Instalando herramientas adicionales..."
sudo apt install htop tree curl wget -y
print_success "Herramientas instaladas"

# Configurar cron para backups automáticos
print_status "Configurando backups automáticos..."
(crontab -l 2>/dev/null; echo "0 2 * * * $HOME/inventario-scripts/backup-database.sh") | crontab -
print_success "Backup automático configurado (diario a las 2:00 AM)"

# Mostrar información final
echo ""
print_success "¡Configuración completada!"
echo ""
echo "📋 INFORMACIÓN IMPORTANTE:"
echo "   • Base de datos: inventario_db"
echo "   • Usuario: inventario_user"
echo "   • Contraseña: inventario_pass_secure_2024"
echo "   • Puerto: 5432"
echo ""
echo "📁 ARCHIVOS CREADOS:"
echo "   • ~/inventario-scripts/migrate-database.sh"
echo "   • ~/inventario-scripts/backup-database.sh"
echo "   • ~/inventario-scripts/monitor-system.sh"
echo "   • ~/inventario-scripts/config.env"
echo ""
echo "🚀 PRÓXIMOS PASOS:"
echo "   1. Copiar los archivos SQL a ~/inventario-scripts/"
echo "   2. Ejecutar: ~/inventario-scripts/migrate-database.sh"
echo "   3. Verificar: ~/inventario-scripts/monitor-system.sh"
echo ""
echo "🔧 COMANDOS ÚTILES:"
echo "   • Ver estado: ~/inventario-scripts/monitor-system.sh"
echo "   • Backup manual: ~/inventario-scripts/backup-database.sh"
echo "   • Conectar a DB: PGPASSWORD=inventario_pass_secure_2024 psql -h localhost -U inventario_user -d inventario_db"
echo "" 
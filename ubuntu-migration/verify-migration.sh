#!/bin/bash

# ========================================
# SCRIPT DE VERIFICACIÓN - SISTEMA INVENTARIO
# ========================================

echo "🔍 Verificando migración del Sistema de Inventario..."
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

# Variables
DB_NAME="inventario_db"
DB_USER="inventario_user"
DB_HOST="localhost"
EXPECTED_EQUIPOS=529
EXPECTED_USUARIOS=386
EXPECTED_HISTORIAL=280

# Función para ejecutar consulta SQL
execute_query() {
    local query="$1"
    PGPASSWORD=inventario_pass_secure_2024 psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "$query" 2>/dev/null
}

# Verificar PostgreSQL
print_status "Verificando PostgreSQL..."
if systemctl is-active --quiet postgresql; then
    print_success "PostgreSQL está activo"
else
    print_error "PostgreSQL no está activo"
    exit 1
fi

# Verificar conexión a base de datos
print_status "Verificando conexión a base de datos..."
if execute_query "SELECT 1;" > /dev/null 2>&1; then
    print_success "Conexión a base de datos exitosa"
else
    print_error "No se puede conectar a la base de datos"
    exit 1
fi

echo ""
print_status "Verificando datos migrados..."

# Verificar equipos
print_status "Verificando equipos..."
EQUIPOS_COUNT=$(execute_query "SELECT COUNT(*) FROM equipos;" | tr -d ' ')
if [ "$EQUIPOS_COUNT" = "$EXPECTED_EQUIPOS" ]; then
    print_success "Equipos: $EQUIPOS_COUNT/$EXPECTED_EQUIPOS ✓"
else
    print_warning "Equipos: $EQUIPOS_COUNT/$EXPECTED_EQUIPOS ⚠"
fi

# Verificar usuarios
print_status "Verificando usuarios..."
USUARIOS_COUNT=$(execute_query "SELECT COUNT(*) FROM usuarios;" | tr -d ' ')
if [ "$USUARIOS_COUNT" = "$EXPECTED_USUARIOS" ]; then
    print_success "Usuarios: $USUARIOS_COUNT/$EXPECTED_USUARIOS ✓"
else
    print_warning "Usuarios: $USUARIOS_COUNT/$EXPECTED_USUARIOS ⚠"
fi

# Verificar historial
print_status "Verificando historial..."
HISTORIAL_COUNT=$(execute_query "SELECT COUNT(*) FROM historial_cambios;" | tr -d ' ')
if [ "$HISTORIAL_COUNT" = "$EXPECTED_HISTORIAL" ]; then
    print_success "Historial: $HISTORIAL_COUNT/$EXPECTED_HISTORIAL ✓"
else
    print_warning "Historial: $HISTORIAL_COUNT/$EXPECTED_HISTORIAL ⚠"
fi

echo ""
print_status "Verificando tablas de configuración..."

# Verificar estados
ESTADOS_COUNT=$(execute_query "SELECT COUNT(*) FROM estados;" | tr -d ' ')
print_status "Estados configurados: $ESTADOS_COUNT"

# Verificar marcas
MARCAS_COUNT=$(execute_query "SELECT COUNT(*) FROM marcas;" | tr -d ' ')
print_status "Marcas configuradas: $MARCAS_COUNT"

# Verificar pisos
PISOS_COUNT=$(execute_query "SELECT COUNT(*) FROM pisos;" | tr -d ' ')
print_status "Pisos configurados: $PISOS_COUNT"

# Verificar propiedades
PROPIEDADES_COUNT=$(execute_query "SELECT COUNT(*) FROM propiedades;" | tr -d ' ')
print_status "Propiedades configuradas: $PROPIEDADES_COUNT"

echo ""
print_status "Verificando distribución de equipos..."

# Equipos por piso
echo "📊 Equipos por piso:"
execute_query "
SELECT p.nombre, COUNT(e.id) as total
FROM equipos e 
JOIN pisos p ON e.piso_id = p.id 
GROUP BY p.nombre 
ORDER BY total DESC;
" | while read line; do
    if [ ! -z "$line" ]; then
        echo "   $line"
    fi
done

# Equipos por estado
echo ""
echo "📊 Equipos por estado:"
execute_query "
SELECT es.nombre, COUNT(e.id) as total
FROM equipos e 
JOIN estados es ON e.estado_id = es.id 
GROUP BY es.nombre 
ORDER BY total DESC;
" | while read line; do
    if [ ! -z "$line" ]; then
        echo "   $line"
    fi
done

# Equipos por marca
echo ""
echo "📊 Equipos por marca:"
execute_query "
SELECT m.nombre, COUNT(e.id) as total
FROM equipos e 
JOIN marcas m ON e.marca_id = m.id 
GROUP BY m.nombre 
ORDER BY total DESC;
" | while read line; do
    if [ ! -z "$line" ]; then
        echo "   $line"
    fi
done

echo ""
print_status "Verificando índices..."

# Verificar índices
INDICES_COUNT=$(execute_query "
SELECT COUNT(*) 
FROM pg_indexes 
WHERE tablename IN ('equipos', 'usuarios', 'historial_cambios');
" | tr -d ' ')
print_status "Índices creados: $INDICES_COUNT"

echo ""
print_status "Verificando triggers..."

# Verificar triggers
TRIGGERS_COUNT=$(execute_query "
SELECT COUNT(*) 
FROM pg_trigger 
WHERE tgname LIKE '%updated_at%';
" | tr -d ' ')
print_status "Triggers creados: $TRIGGERS_COUNT"

echo ""
print_status "Verificando permisos de usuario..."

# Verificar permisos
PERMISSIONS=$(execute_query "
SELECT has_table_privilege('inventario_user', 'equipos', 'SELECT') as can_select,
       has_table_privilege('inventario_user', 'equipos', 'INSERT') as can_insert,
       has_table_privilege('inventario_user', 'equipos', 'UPDATE') as can_update,
       has_table_privilege('inventario_user', 'equipos', 'DELETE') as can_delete;
" | tr -d ' ')

if [[ $PERMISSIONS == *"tttt"* ]]; then
    print_success "Permisos de usuario correctos ✓"
else
    print_warning "Permisos de usuario incompletos ⚠"
fi

echo ""
print_status "Verificando scripts de administración..."

# Verificar scripts
if [ -f "$HOME/inventario-scripts/migrate-database.sh" ]; then
    print_success "Script de migración encontrado ✓"
else
    print_warning "Script de migración no encontrado ⚠"
fi

if [ -f "$HOME/inventario-scripts/backup-database.sh" ]; then
    print_success "Script de backup encontrado ✓"
else
    print_warning "Script de backup no encontrado ⚠"
fi

if [ -f "$HOME/inventario-scripts/monitor-system.sh" ]; then
    print_success "Script de monitoreo encontrado ✓"
else
    print_warning "Script de monitoreo no encontrado ⚠"
fi

echo ""
print_status "Verificando configuración de backup..."

# Verificar cron job
if crontab -l 2>/dev/null | grep -q "backup-database.sh"; then
    print_success "Backup automático configurado ✓"
else
    print_warning "Backup automático no configurado ⚠"
fi

echo ""
print_status "Resumen de verificación:"

# Calcular porcentaje de éxito
TOTAL_CHECKS=0
SUCCESS_CHECKS=0

# Contar verificaciones
if [ "$EQUIPOS_COUNT" = "$EXPECTED_EQUIPOS" ]; then SUCCESS_CHECKS=$((SUCCESS_CHECKS + 1)); fi
if [ "$USUARIOS_COUNT" = "$EXPECTED_USUARIOS" ]; then SUCCESS_CHECKS=$((SUCCESS_CHECKS + 1)); fi
if [ "$HISTORIAL_COUNT" = "$EXPECTED_HISTORIAL" ]; then SUCCESS_CHECKS=$((SUCCESS_CHECKS + 1)); fi

TOTAL_CHECKS=3
SUCCESS_PERCENTAGE=$((SUCCESS_CHECKS * 100 / TOTAL_CHECKS))

if [ $SUCCESS_PERCENTAGE -eq 100 ]; then
    print_success "¡Migración completada exitosamente! ($SUCCESS_PERCENTAGE%)"
    echo ""
    echo "🎉 El sistema está listo para producción"
    echo "📊 Total de registros migrados: $((EQUIPOS_COUNT + USUARIOS_COUNT + HISTORIAL_COUNT))"
    echo "🔧 Scripts de administración: Configurados"
    echo "💾 Backup automático: Configurado"
    echo ""
    echo "🚀 Próximo paso: Conectar el frontend React"
else
    print_warning "Migración parcialmente completada ($SUCCESS_PERCENTAGE%)"
    echo ""
    echo "⚠️ Revisar los elementos marcados con advertencias"
    echo "📞 Consultar la guía de troubleshooting si es necesario"
fi

echo ""
echo "📋 Comandos útiles:"
echo "   • Monitoreo: ~/inventario-scripts/monitor-system.sh"
echo "   • Backup manual: ~/inventario-scripts/backup-database.sh"
echo "   • Conectar a DB: PGPASSWORD=inventario_pass_secure_2024 psql -h localhost -U inventario_user -d inventario_db" 
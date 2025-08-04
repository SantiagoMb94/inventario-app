# 🚀 GUÍA DE MIGRACIÓN - SISTEMA DE INVENTARIO

## 📊 RESUMEN DE MIGRACIÓN

### **Estadísticas Generadas:**
- **Total Equipos:** 529
- **Total Usuarios:** 386
- **Total Historial:** 280 registros
- **Estados:** Stock, En Reparación, Disponible, Asignado
- **Marcas:** Lenovo (410), HP (106), Acer (4), Apple (9)
- **Pisos:** Stock (141), VIP (42), 7 (81), 10 (95), 12 (107), 16 (63)

## 📁 ARCHIVOS GENERADOS

### **En Windows (Preparación):**
```
📂 database/
├── 📄 schema.sql              # Esquema completo de PostgreSQL
├── 📄 insert_data.sql         # Datos de configuración
└── 📄 migration_report.json   # Reporte detallado de migración

📄 migrate-data.js             # Script de migración
📄 setup-ubuntu.sh             # Script de configuración Ubuntu
📄 MIGRATION_GUIDE.md          # Esta guía
```

### **En Ubuntu (Después de configuración):**
```
📂 ~/inventario-scripts/
├── 📄 migrate-database.sh     # Script de migración en Ubuntu
├── 📄 backup-database.sh      # Script de backup automático
├── 📄 monitor-system.sh       # Script de monitoreo
└── 📄 config.env              # Configuración del sistema
```

## 🎯 PLAN DE MIGRACIÓN ESCALONADO

### **FASE 1: PREPARACIÓN EN WINDOWS ✅**
- [x] Análisis de datos CSV
- [x] Generación de esquema SQL
- [x] Creación de scripts de migración
- [x] Validación de datos

### **FASE 2: CONFIGURACIÓN UBUNTU**
- [ ] Configurar servidor Ubuntu
- [ ] Instalar PostgreSQL
- [ ] Crear usuario y base de datos
- [ ] Configurar scripts de administración

### **FASE 3: MIGRACIÓN FINAL**
- [ ] Ejecutar migración de datos
- [ ] Validar resultados
- [ ] Conectar frontend a base de datos

## 🛠️ CONFIGURACIÓN UBUNTU

### **Paso 1: Preparar archivos**
```bash
# Copiar archivos SQL al servidor Ubuntu
scp database/schema.sql usuario@servidor:~/inventario-scripts/
scp database/insert_data.sql usuario@servidor:~/inventario-scripts/
scp setup-ubuntu.sh usuario@servidor:~/
```

### **Paso 2: Ejecutar configuración**
```bash
# En el servidor Ubuntu
chmod +x setup-ubuntu.sh
./setup-ubuntu.sh
```

### **Paso 3: Ejecutar migración**
```bash
# En el servidor Ubuntu
cd ~/inventario-scripts
./migrate-database.sh
```

## 📋 DETALLES TÉCNICOS

### **Esquema de Base de Datos:**
```sql
-- Tablas principales
equipos          # 529 registros
usuarios         # 386 registros
historial_cambios # 280 registros

-- Tablas de configuración
estados          # 4 estados
marcas           # 4 marcas
pisos            # 6 pisos
propiedades      # 2 propiedades
```

### **Configuración PostgreSQL:**
- **Base de datos:** `inventario_db`
- **Usuario:** `inventario_user`
- **Contraseña:** `inventario_pass_secure_2024`
- **Puerto:** `5432`
- **Host:** `localhost`

### **Índices Optimizados:**
- `idx_equipos_serial` - Búsqueda por serial
- `idx_equipos_estado` - Filtros por estado
- `idx_equipos_piso` - Filtros por piso
- `idx_equipos_agente` - Búsqueda por agente
- `idx_historial_fecha` - Historial por fecha
- `idx_historial_equipo` - Historial por equipo

## 🔧 SCRIPTS DE ADMINISTRACIÓN

### **Monitoreo del Sistema:**
```bash
~/inventario-scripts/monitor-system.sh
```
**Muestra:**
- Estado de PostgreSQL
- Conexión a base de datos
- Estadísticas de registros
- Uso de recursos del sistema

### **Backup Automático:**
```bash
~/inventario-scripts/backup-database.sh
```
**Características:**
- Backup diario automático (2:00 AM)
- Compresión automática
- Retención de 7 días
- Backup manual disponible

### **Migración de Datos:**
```bash
~/inventario-scripts/migrate-database.sh
```
**Funciones:**
- Ejecuta esquema SQL
- Inserta datos de configuración
- Valida migración
- Muestra estadísticas

## 📊 VALIDACIÓN DE MIGRACIÓN

### **Comandos de Verificación:**
```sql
-- Verificar total de equipos
SELECT COUNT(*) FROM equipos;

-- Verificar total de usuarios
SELECT COUNT(*) FROM usuarios;

-- Verificar total de historial
SELECT COUNT(*) FROM historial_cambios;

-- Verificar equipos por piso
SELECT p.nombre, COUNT(e.id) 
FROM equipos e 
JOIN pisos p ON e.piso_id = p.id 
GROUP BY p.nombre;

-- Verificar equipos por estado
SELECT es.nombre, COUNT(e.id) 
FROM equipos e 
JOIN estados es ON e.estado_id = es.id 
GROUP BY es.nombre;
```

### **Resultados Esperados:**
- **Equipos:** 529
- **Usuarios:** 386
- **Historial:** 280
- **Estados:** 4 (Stock, En Reparación, Disponible, Asignado)
- **Marcas:** 4 (Lenovo, HP, Acer, Apple)
- **Pisos:** 6 (Stock, VIP, 7, 10, 12, 16)

## 🚨 TROUBLESHOOTING

### **Problemas Comunes:**

#### **1. Error de conexión a PostgreSQL:**
```bash
# Verificar estado del servicio
sudo systemctl status postgresql

# Reiniciar servicio
sudo systemctl restart postgresql

# Verificar logs
sudo journalctl -u postgresql
```

#### **2. Error de permisos:**
```bash
# Verificar permisos de usuario
sudo -u postgres psql -c "\\du"

# Crear usuario si no existe
sudo -u postgres psql -c "CREATE USER inventario_user WITH PASSWORD 'inventario_pass_secure_2024';"
```

#### **3. Error de migración:**
```bash
# Verificar archivos SQL
ls -la ~/inventario-scripts/*.sql

# Ejecutar migración paso a paso
PGPASSWORD=inventario_pass_secure_2024 psql -h localhost -U inventario_user -d inventario_db -f schema.sql
```

## 🔐 SEGURIDAD

### **Configuraciones de Seguridad:**
- Contraseña segura para base de datos
- Acceso restringido a localhost
- Backups automáticos
- Logs de auditoría
- Usuario específico para la aplicación

### **Recomendaciones:**
- Cambiar contraseña por defecto
- Configurar firewall
- Mantener sistema actualizado
- Monitorear logs regularmente

## 📞 SOPORTE

### **Comandos de Diagnóstico:**
```bash
# Estado del sistema
~/inventario-scripts/monitor-system.sh

# Logs de PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log

# Uso de recursos
htop
df -h
free -h
```

### **Información de Contacto:**
- **Desarrollador:** Santiago Manco Bolaños
- **Empresa:** SUTI S.A.S
- **Versión:** 1.0.0

---

## 🎉 ¡MIGRACIÓN COMPLETADA!

Una vez que hayas seguido todos los pasos, tendrás:
- ✅ Base de datos PostgreSQL configurada
- ✅ Datos migrados completamente
- ✅ Scripts de administración funcionando
- ✅ Sistema listo para producción

**¡El sistema está listo para conectar el frontend React!** 🚀 
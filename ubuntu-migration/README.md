# 🚀 PAQUETE DE MIGRACIÓN UBUNTU - SISTEMA DE INVENTARIO

## 📋 CONTENIDO DEL PAQUETE

```
📂 ubuntu-migration/
├── 📄 schema.sql              # Esquema PostgreSQL optimizado
├── 📄 insert_data.sql         # Datos de configuración (411 líneas)
├── 📄 setup-ubuntu.sh         # Script de configuración Ubuntu
├── 📄 verify-migration.sh     # Script de verificación
├── 📄 migration_report.json   # Reporte de migración
├── 📄 transfer-to-ubuntu.md   # Guía de transferencia
└── 📄 README.md               # Esta guía
```

## 🎯 INFORMACIÓN DE MIGRACIÓN

### **Estadísticas Generadas:**
- **Total Equipos:** 529
- **Total Usuarios:** 386
- **Total Historial:** 280 registros
- **Estados:** Stock, En Reparación, Disponible, Asignado
- **Marcas:** Lenovo (410), HP (106), Acer (4), Apple (9)
- **Pisos:** Stock (141), VIP (42), 7 (81), 10 (95), 12 (107), 16 (63)

## 🛠️ INSTALACIÓN RÁPIDA

### **Paso 1: Transferir archivos**
```bash
# Desde Windows (PowerShell)
scp -r ubuntu-migration/* usuario@IP_SERVIDOR:~/

# O usar WinSCP para transferencia gráfica
```

### **Paso 2: Configurar Ubuntu**
```bash
# En Ubuntu
cd ~/ubuntu-migration
chmod +x setup-ubuntu.sh
./setup-ubuntu.sh
```

### **Paso 3: Ejecutar migración**
```bash
# En Ubuntu
cd ~/inventario-scripts
./migrate-database.sh
```

### **Paso 4: Verificar migración**
```bash
# En Ubuntu
chmod +x verify-migration.sh
./verify-migration.sh
```

## 📊 CONFIGURACIÓN DE BASE DE DATOS

### **Credenciales:**
- **Base de datos:** `inventario_db`
- **Usuario:** `inventario_user`
- **Contraseña:** `inventario_pass_secure_2024`
- **Puerto:** `5432`
- **Host:** `localhost`

### **Esquema:**
- **Tablas principales:** equipos, usuarios, historial_cambios
- **Tablas de configuración:** estados, marcas, pisos, propiedades
- **Índices optimizados:** Para búsquedas rápidas
- **Triggers:** Actualización automática de timestamps

## 🔧 SCRIPTS INCLUIDOS

### **setup-ubuntu.sh**
- Instala PostgreSQL
- Configura usuario y base de datos
- Crea scripts de administración
- Configura backup automático

### **verify-migration.sh**
- Verifica estado de PostgreSQL
- Valida datos migrados
- Muestra estadísticas
- Verifica permisos y configuración

### **Scripts de Administración (creados automáticamente):**
- `migrate-database.sh` - Ejecuta migración
- `backup-database.sh` - Backup manual/automático
- `monitor-system.sh` - Monitoreo del sistema

## 📈 RESULTADOS ESPERADOS

### **Después de la migración exitosa:**
- ✅ PostgreSQL instalado y configurado
- ✅ Base de datos creada con 529 equipos
- ✅ 386 usuarios migrados
- ✅ 280 registros de historial
- ✅ Scripts de administración funcionando
- ✅ Backup automático configurado

### **Comandos de verificación:**
```bash
# Verificar equipos
PGPASSWORD=inventario_pass_secure_2024 psql -h localhost -U inventario_user -d inventario_db -c "SELECT COUNT(*) FROM equipos;"

# Verificar usuarios
PGPASSWORD=inventario_pass_secure_2024 psql -h localhost -U inventario_user -d inventario_db -c "SELECT COUNT(*) FROM usuarios;"

# Verificar historial
PGPASSWORD=inventario_pass_secure_2024 psql -h localhost -U inventario_user -d inventario_db -c "SELECT COUNT(*) FROM historial_cambios;"
```

## 🚨 TROUBLESHOOTING

### **Problemas Comunes:**

#### **1. Error de permisos:**
```bash
sudo chmod +x *.sh
```

#### **2. PostgreSQL no inicia:**
```bash
sudo systemctl restart postgresql
sudo systemctl status postgresql
```

#### **3. Error de conexión:**
```bash
# Verificar configuración
sudo -u postgres psql -c "\\du"
```

#### **4. Datos no migrados:**
```bash
# Ejecutar migración manual
cd ~/inventario-scripts
./migrate-database.sh
```

## 🔐 SEGURIDAD

### **Configuraciones aplicadas:**
- Contraseña segura para base de datos
- Acceso restringido a localhost
- Usuario específico para la aplicación
- Backups automáticos con retención

### **Recomendaciones post-instalación:**
- Cambiar contraseña por defecto
- Configurar firewall
- Mantener sistema actualizado
- Monitorear logs regularmente

## 📞 SOPORTE

### **Comandos de diagnóstico:**
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

### **Información de contacto:**
- **Desarrollador:** Santiago Manco Bolaños
- **Empresa:** SUTI S.A.S
- **Versión:** 1.0.0

## 🎉 PRÓXIMOS PASOS

Una vez completada la migración:

1. **Conectar frontend React** a la nueva base de datos
2. **Actualizar variables de entorno** en la aplicación
3. **Probar funcionalidad completa**
4. **Configurar monitoreo** y alertas
5. **Documentar procedimientos** de mantenimiento

---

## 🚀 ¡LISTO PARA PRODUCCIÓN!

**Este paquete contiene todo lo necesario para migrar el Sistema de Inventario a Ubuntu con PostgreSQL.**

**¡Sigue las instrucciones paso a paso y tendrás un sistema robusto y escalable!** 🎯 
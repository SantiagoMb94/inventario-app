# 📁 TRANSFERENCIA A UBUNTU - SISTEMA DE INVENTARIO

## 🚀 PASOS PARA TRANSFERIR ARCHIVOS

### **Opción 1: Usando SCP (Recomendado)**

```bash
# Desde Windows, en PowerShell:
scp -r ubuntu-migration/* usuario@IP_SERVIDOR:~/

# Ejemplo:
scp -r ubuntu-migration/* santiago@192.168.1.100:~/
```

### **Opción 2: Usando WinSCP (Interfaz Gráfica)**

1. Descargar WinSCP desde: https://winscp.net/
2. Conectar al servidor Ubuntu
3. Arrastrar la carpeta `ubuntu-migration` al servidor

### **Opción 3: Usando USB/Archivo Compartido**

1. Copiar la carpeta `ubuntu-migration` a USB
2. Transferir al servidor Ubuntu
3. Descomprimir en el servidor

## 📋 ARCHIVOS INCLUIDOS

```
📂 ubuntu-migration/
├── 📄 schema.sql              # Esquema PostgreSQL
├── 📄 insert_data.sql         # Datos de configuración
├── 📄 setup-ubuntu.sh         # Script de configuración
├── 📄 migration_report.json   # Reporte de migración
└── 📄 transfer-to-ubuntu.md   # Esta guía
```

## 🛠️ CONFIGURACIÓN EN UBUNTU

### **Paso 1: Verificar archivos transferidos**
```bash
# En Ubuntu
ls -la ~/ubuntu-migration/
```

### **Paso 2: Ejecutar configuración**
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

## 🔧 VERIFICACIÓN

### **Comandos de verificación:**
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Verificar conexión
PGPASSWORD=inventario_pass_secure_2024 psql -h localhost -U inventario_user -d inventario_db -c "SELECT COUNT(*) FROM equipos;"

# Verificar scripts
ls -la ~/inventario-scripts/
```

## 📞 SOPORTE

Si tienes problemas con la transferencia:
1. Verificar conectividad de red
2. Verificar credenciales SSH
3. Verificar permisos de archivos
4. Revisar logs de transferencia

---

**¡Listo para transferir!** 🚀 
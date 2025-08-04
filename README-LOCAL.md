# 🏠 Ejecución Local - Sistema de Inventario

Esta guía te ayudará a ejecutar el sistema de inventario completo en tu máquina local **sin Docker**.

## 📋 Requisitos Previos

### 1. **Node.js**
- Versión 18 o superior
- Descargar desde: https://nodejs.org/

### 2. **PostgreSQL**
- Versión 13 o superior
- Descargar desde: https://www.postgresql.org/download/
- Asegúrate de que el servicio esté corriendo

### 3. **Git** (opcional)
- Para clonar el repositorio

## 🚀 Configuración Rápida

### **Opción 1: Scripts Automáticos (Recomendado)**

1. **Configurar Base de Datos:**
   ```powershell
   .\setup-database.bat
   ```

2. **Configurar Dependencias:**
   ```powershell
   .\setup-local.bat
   ```

3. **Iniciar Servicios:**
   ```powershell
   # Opción A: Solo Frontend y Gateway (SIN autenticación) - RECOMENDADO
   .\start-frontend-only.ps1
   
   # Opción B: Solo Frontend y Gateway (Batch)
   .\start-frontend-only.bat
   
   # Opción C: Todos los servicios (con autenticación)
   .\start-all-services.bat
   
   # Opción D: Todos los servicios (PowerShell)
   .\start-local.ps1
   ```

### **Opción 2: Configuración Manual**

#### **Paso 1: Configurar Base de Datos PostgreSQL**

1. Instala PostgreSQL
2. Crea un usuario y base de datos:
   ```sql
   CREATE USER inventario_user WITH PASSWORD 'inventario_pass_secure_2024';
   CREATE DATABASE inventario_db OWNER inventario_user;
   ```
3. Ejecuta el script de inicialización:
   ```bash
   psql -U inventario_user -d inventario_db -f database/init.sql
   ```

#### **Paso 2: Configurar Variables de Entorno**

1. Copia el archivo de configuración local:
   ```bash
   copy env.local .env
   ```

2. Edita el archivo `.env` con tus configuraciones:
   - Configura tu email SMTP si quieres usar envío de actas
   - Ajusta puertos si es necesario

#### **Paso 3: Instalar Dependencias**

```bash
# Gateway
cd gateway
npm install
cd ..

# Auth Service
cd services/auth-service
npm install
cd ../..

# Equipos Service
cd services/equipos-service
npm install
cd ../..

# Inventario Service
cd services/inventario-service
npm install
cd ../..

# Frontend
cd client
npm install
cd ..
```

#### **Paso 4: Iniciar Servicios**

**Terminal 1 - Gateway:**
```bash
cd gateway
npm run dev
```

**Terminal 2 - Auth Service:**
```bash
cd services/auth-service
npm run dev
```

**Terminal 3 - Equipos Service:**
```bash
cd services/equipos-service
npm run dev
```

**Terminal 4 - Inventario Service:**
```bash
cd services/inventario-service
npm run dev
```

**Terminal 5 - Frontend:**
```bash
cd client
npm start
```

## 🌐 URLs de Acceso

Una vez que todos los servicios estén corriendo:

- **Frontend:** http://localhost:3006
- **Gateway API:** http://localhost:3000
- **Auth Service:** http://localhost:3001
- **Equipos Service:** http://localhost:3002
- **Inventario Service:** http://localhost:3003

## 🔐 Credenciales por Defecto

- **Usuario:** admin
- **Contraseña:** admin123

## 📁 Estructura de Archivos

```
inventario-app/
├── client/                 # Frontend React (puerto 3006)
├── gateway/               # API Gateway (puerto 3000)
├── services/
│   ├── auth-service/      # Autenticación (puerto 3001)
│   ├── equipos-service/   # Gestión de equipos (puerto 3002)
│   └── inventario-service/ # Gestión de inventario (puerto 3003)
├── database/              # Scripts de base de datos
├── setup-database.bat     # Configurar base de datos
├── setup-local.bat        # Configurar dependencias
├── start-all-services.bat # Iniciar todos los servicios
└── env.local              # Configuración para desarrollo local
```

## 🛠️ Comandos Útiles

### **Verificar Estado de Servicios:**
```bash
# Verificar si los puertos están en uso
netstat -an | findstr :3000
netstat -an | findstr :3001
netstat -an | findstr :3002
netstat -an | findstr :3003
netstat -an | findstr :3006
```

### **Reiniciar un Servicio:**
```bash
# Detener el proceso (Ctrl+C) y volver a ejecutar
cd gateway && npm run dev
```

### **Ver Logs:**
Los logs aparecen directamente en las terminales donde ejecutas cada servicio.

## 🔧 Solución de Problemas

### **Error: Puerto ya en uso**
```bash
# Encontrar proceso que usa el puerto
netstat -ano | findstr :3000
# Matar el proceso (reemplaza PID con el número de proceso)
taskkill /PID PID /F
```

### **Error: No se puede conectar a PostgreSQL**
1. Verifica que PostgreSQL esté instalado
2. Verifica que el servicio esté corriendo
3. Verifica las credenciales en el archivo `.env`

### **Error: Módulo no encontrado**
```bash
# Reinstalar dependencias
cd [directorio-del-servicio]
rm -rf node_modules package-lock.json
npm install
```

### **Error: Base de datos no existe**
```bash
# Ejecutar script de configuración de base de datos
setup-database.bat
```

## 📝 Notas Importantes

1. **Puertos:** Asegúrate de que los puertos 3000-3006 estén libres
2. **Base de Datos:** PostgreSQL debe estar corriendo antes de iniciar los servicios
3. **Variables de Entorno:** El archivo `.env` debe estar configurado correctamente
4. **Orden de Inicio:** Los servicios backend deben iniciarse antes que el frontend
5. **Logs:** Cada servicio muestra sus logs en su propia terminal

## 🆘 Soporte

Si encuentras problemas:

1. Verifica que todos los requisitos estén instalados
2. Revisa los logs de cada servicio
3. Verifica la configuración del archivo `.env`
4. Asegúrate de que PostgreSQL esté corriendo
5. Verifica que los puertos no estén en uso

¡El sistema debería estar funcionando completamente en local! 🎉 
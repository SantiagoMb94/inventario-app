# 🏢 Sistema de Inventario - Microservicios

Sistema completo de gestión de inventario migrado desde Google Apps Script a una arquitectura de microservicios en Ubuntu.

## 📋 Características

- **Arquitectura de Microservicios**: Servicios independientes para cada funcionalidad
- **Base de Datos PostgreSQL**: Esquema optimizado con triggers y vistas
- **API Gateway**: Punto de entrada centralizado con autenticación
- **Frontend Moderno**: Interfaz web responsive
- **Nginx Reverse Proxy**: Con soporte SSL/HTTPS
- **Docker & Docker Compose**: Despliegue containerizado
- **Backup Automático**: Sistema de respaldos diarios
- **Monitoreo**: Scripts de monitoreo básico
- **Seguridad**: Firewall, Fail2ban, certificados SSL

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Nginx         │    │   PostgreSQL    │
│   (React)       │◄──►│   (Reverse      │◄──►│   (Database)    │
│                 │    │    Proxy)       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   API Gateway   │
                       │   (Express)     │
                       └─────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Auth        │    │ Equipos     │    │ Inventario  │
│ Service     │    │ Service     │    │ Service     │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 📁 Estructura del Proyecto

```
inventario-app/
├── docker-compose.yml          # Orquestación de servicios
├── env.example                 # Variables de entorno de ejemplo
├── scripts/
│   ├── setup-server.sh         # Configuración del servidor Ubuntu
│   ├── deploy.sh               # Despliegue de la aplicación
│   └── backup.sh               # Script de backup
├── nginx/                      # Configuración de Nginx
├── gateway/                    # API Gateway
├── services/                   # Microservicios
│   ├── auth-service/           # Autenticación
│   ├── equipos-service/        # Gestión de equipos
│   ├── inventario-service/     # Inventario
│   └── reportes-service/       # Reportes
├── client/                     # Frontend React
├── database/                   # Esquemas y migraciones
└── data/                       # Datos CSV
```

## 🚀 Instalación y Despliegue

### Prerrequisitos

- Servidor Ubuntu 24.04
- Acceso root
- Conexión a internet
- IP estática configurada

### 1. Configuración del Servidor

```bash
# Descargar y ejecutar el script de configuración
wget https://raw.githubusercontent.com/tu-repo/inventario-app/main/scripts/setup-server.sh
chmod +x setup-server.sh
sudo ./setup-server.sh
```

### 2. Clonar el Proyecto

```bash
cd /home/suti
git clone https://github.com/tu-repo/inventario-app.git
cd inventario-app
```

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar variables
nano .env
```

**Variables importantes a configurar:**
- `POSTGRES_PASSWORD`: Contraseña segura para PostgreSQL
- `JWT_SECRET`: Clave secreta para JWT
- `SMTP_USER` y `SMTP_PASS`: Credenciales de email para actas
- `SSL_EMAIL`: Email para certificados SSL

### 4. Desplegar la Aplicación

```bash
# Ejecutar script de despliegue
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 5. Verificar Despliegue

```bash
# Verificar servicios
docker-compose ps

# Ver logs
docker-compose logs -f

# Verificar conectividad
curl http://10.55.55.20/health
```

## 🔧 Comandos Útiles

### Gestión de Servicios

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f [servicio]

# Reiniciar servicios
docker-compose restart

# Parar todos los servicios
docker-compose down

# Reconstruir y levantar
docker-compose up -d --build
```

### Base de Datos

```bash
# Conectar a PostgreSQL
docker-compose exec postgres psql -U inventario_user -d inventario_db

# Backup manual
/home/suti/backup-inventario.sh

# Restaurar backup
docker-compose exec -T postgres psql -U inventario_user -d inventario_db < backup.sql
```

### Monitoreo

```bash
# Verificar estado del sistema
/home/suti/monitor.sh

# Ver uso de recursos
docker stats

# Ver logs del sistema
journalctl -u docker
```

## 🔒 Seguridad

### Firewall (UFW)
- Puerto 22 (SSH)
- Puerto 80 (HTTP)
- Puerto 443 (HTTPS)

### Fail2ban
- Protección contra ataques de fuerza bruta
- Configuración automática en setup

### SSL/HTTPS
- Certificados Let's Encrypt automáticos
- Redirección HTTP a HTTPS
- Headers de seguridad configurados

## 📊 API Endpoints

### Gateway (Puerto 3000)
- `GET /health` - Health check
- `GET /api/equipos` - Listar equipos
- `POST /api/equipos` - Crear equipo
- `PUT /api/equipos/:id` - Actualizar equipo
- `DELETE /api/equipos/:id` - Eliminar equipo

### Servicios Individuales
- Auth Service: `http://auth-service:3001`
- Equipos Service: `http://equipos-service:3002`
- Inventario Service: `http://inventario-service:3003`
- Reportes Service: `http://reportes-service:3004`

## 🗄️ Base de Datos

### Tablas Principales
- `equipos` - Información de equipos
- `usuarios` - Usuarios/agentes
- `historial` - Registro de cambios
- `actas` - Actas de entrega/devolución
- `configuracion` - Configuración del sistema
- `pisos` - Ubicaciones/pisos

### Vistas Útiles
- `vista_equipos_completa` - Equipos con información completa
- `vista_estadisticas` - Estadísticas del dashboard
- `vista_actividad_reciente` - Actividad reciente

## 🔄 Migración desde Google Apps Script

### Datos a Migrar
1. **Equipos**: Exportar desde Google Sheets a CSV
2. **Configuración**: Listas de estados, marcas, pisos
3. **Historial**: Registro de cambios
4. **Usuarios**: Información de agentes

### Script de Importación
```bash
# Ejecutar script de migración
docker-compose exec equipos-service node src/scripts/import-data.js
```

## 🛠️ Desarrollo

### Estructura de un Microservicio

```
service-name/
├── Dockerfile
├── package.json
├── src/
│   ├── index.js              # Punto de entrada
│   ├── routes/               # Rutas API
│   ├── controllers/          # Controladores
│   ├── models/               # Modelos de datos
│   ├── services/             # Lógica de negocio
│   └── middleware/           # Middlewares
└── .env                      # Variables de entorno
```

### Agregar Nuevo Servicio

1. Crear directorio en `services/`
2. Crear `Dockerfile` y `package.json`
3. Implementar lógica en `src/`
4. Agregar al `docker-compose.yml`
5. Configurar rutas en el gateway

## 📈 Monitoreo y Mantenimiento

### Logs
- **Aplicación**: `docker-compose logs -f`
- **Sistema**: `journalctl -f`
- **Nginx**: `/var/log/nginx/`

### Backups
- **Automático**: Diario a las 2:00 AM
- **Manual**: `/home/suti/backup-inventario.sh`
- **Ubicación**: `/home/suti/backups/`

### Actualizaciones
```bash
# Actualizar código
git pull origin main

# Reconstruir y desplegar
docker-compose down
docker-compose up -d --build
```

## 🆘 Solución de Problemas

### Servicios No Inician
```bash
# Verificar logs
docker-compose logs [servicio]

# Verificar configuración
docker-compose config

# Reiniciar servicio específico
docker-compose restart [servicio]
```

### Problemas de Base de Datos
```bash
# Verificar conexión
docker-compose exec postgres pg_isready -U inventario_user

# Verificar logs de PostgreSQL
docker-compose logs postgres
```

### Problemas de Red
```bash
# Verificar puertos
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# Verificar firewall
sudo ufw status
```

## 📞 Soporte

- **Documentación**: Este README
- **Logs**: `docker-compose logs`
- **Estado del servidor**: `/home/suti/server-info.txt`
- **Backups**: `/home/suti/backups/`

## 📄 Licencia

MIT License - Ver archivo LICENSE para detalles.

---

**Desarrollado por Suti**  
**Versión**: 1.0.0  
**Fecha**: 2024 
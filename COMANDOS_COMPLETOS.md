# 🚀 Comandos Completos - Configuración del Servidor Ubuntu

## 📋 Resumen de Pasos

1. **Preparar Ubuntu** (apt update, usuarios, UFW, netplan)
2. **Instalar Docker y Docker Compose**
3. **Crear carpetas/repos y clonar código**
4. **Correr docker compose up -d**
5. **Generar y renovar certificados con Certbot**
6. **Comprobaciones: curl, docker ps, docker logs**

---

## 🔧 PASO 1: PREPARAR UBUNTU

### 1.1 Actualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
sudo apt autoremove -y
```

### 1.2 Instalar Paquetes Básicos
```bash
sudo apt install -y curl wget git vim htop ufw fail2ban ntp ntpdate
```

### 1.3 Configurar Usuario
```bash
# Crear usuario si no existe
sudo useradd -m -s /bin/bash suti
echo "suti:Meteoro2021*+" | sudo chpasswd

# Agregar al grupo sudo
sudo usermod -aG sudo suti
```

### 1.4 Configurar Red (IP Estática)
```bash
sudo nano /etc/netplan/01-netcfg.yaml
```

**Contenido del archivo:**
```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      dhcp4: false
      addresses:
        - 10.55.55.20/24
      gateway4: 10.55.55.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
```

**Aplicar configuración:**
```bash
sudo netplan apply
```

### 1.5 Configurar Firewall (UFW)
```bash
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

---

## 🐳 PASO 2: INSTALAR DOCKER Y DOCKER COMPOSE

### 2.1 Instalar Docker
```bash
# Instalar dependencias
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Agregar clave GPG de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Agregar repositorio
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Actualizar e instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Agregar usuario al grupo docker
sudo usermod -aG docker suti

# Iniciar y habilitar Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### 2.2 Instalar Docker Compose
```bash
# Descargar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Hacer ejecutable
sudo chmod +x /usr/local/bin/docker-compose
```

### 2.3 Verificar Instalación
```bash
# Verificar Docker
docker --version

# Verificar Docker Compose
docker-compose --version

# Verificar que el usuario puede usar Docker
sudo su - suti
docker ps
exit
```

---

## 📁 PASO 3: CREAR CARPETAS Y CLONAR CÓDIGO

### 3.1 Crear Directorios
```bash
sudo mkdir -p /home/suti/inventario-app
sudo mkdir -p /home/suti/backups
sudo chown -R suti:suti /home/suti/inventario-app
sudo chown -R suti:suti /home/suti/backups
```

### 3.2 Clonar Proyecto
```bash
cd /home/suti
sudo su - suti
git clone https://github.com/tu-repo/inventario-app.git
cd inventario-app
```

### 3.3 Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar variables
nano .env
```

**Variables importantes a configurar en .env:**
```bash
# Base de Datos
POSTGRES_PASSWORD=tu_password_super_seguro_2024

# JWT
JWT_SECRET=tu_super_secreto_jwt_key_muy_seguro_2024

# Email para actas
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password

# SSL
SSL_EMAIL=admin@tudominio.com
SSL_DOMAIN=10.55.55.20
```

---

## 🚀 PASO 4: DESPLEGAR CON DOCKER COMPOSE

### 4.1 Crear Directorios Necesarios
```bash
mkdir -p logs
mkdir -p data
mkdir -p nginx/ssl
mkdir -p database/migrations
mkdir -p database/seeds
```

### 4.2 Construir y Levantar Servicios
```bash
# Construir imágenes
docker-compose build --no-cache

# Levantar servicios
docker-compose up -d

# Verificar estado
docker-compose ps
```

### 4.3 Verificar Logs
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f postgres
docker-compose logs -f gateway
docker-compose logs -f nginx
```

---

## 🔒 PASO 5: CONFIGURAR CERTIFICADOS SSL

### 5.1 Instalar Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 5.2 Generar Certificado para IP (Temporal)
```bash
# Crear directorio para certificados
sudo mkdir -p /home/suti/inventario-app/nginx/ssl/live/10.55.55.20

# Generar certificado autofirmado
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /home/suti/inventario-app/nginx/ssl/live/10.55.55.20/privkey.pem \
    -out /home/suti/inventario-app/nginx/ssl/live/10.55.55.20/fullchain.pem \
    -subj "/C=ES/ST=Madrid/L=Madrid/O=Inventario/OU=IT/CN=10.55.55.20"

# Cambiar propiedad
sudo chown -R suti:suti /home/suti/inventario-app/nginx/ssl
```

### 5.3 Para Dominio Real (Opcional)
```bash
# Si tienes un dominio real, usar Let's Encrypt
sudo docker-compose exec nginx certbot --nginx -d tudominio.com --email tu-email@dominio.com --agree-tos --non-interactive
```

---

## ✅ PASO 6: COMPROBACIONES Y VERIFICACIONES

### 6.1 Verificar Servicios Docker
```bash
# Ver todos los servicios
docker-compose ps

# Verificar que todos estén corriendo
docker-compose ps | grep "Up"
```

### 6.2 Verificar Conectividad
```bash
# Health check del gateway
curl http://localhost:3000/health

# Verificar Nginx HTTP
curl http://localhost

# Verificar Nginx HTTPS (con certificado autofirmado)
curl -k https://localhost

# Verificar desde IP externa
curl http://10.55.55.20/health
```

### 6.3 Verificar Base de Datos
```bash
# Conectar a PostgreSQL
docker-compose exec postgres psql -U inventario_user -d inventario_db

# Verificar tablas
\dt

# Verificar datos
SELECT COUNT(*) FROM equipos;
SELECT COUNT(*) FROM usuarios;

# Salir
\q
```

### 6.4 Verificar Logs del Sistema
```bash
# Ver logs de Docker
sudo journalctl -u docker -f

# Ver logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Ver logs de la aplicación
docker-compose logs -f --tail=50
```

---

## 🔧 PASO 7: CONFIGURACIÓN ADICIONAL

### 7.1 Configurar Backup Automático
```bash
# Crear script de backup
sudo nano /home/suti/backup-inventario.sh
```

**Contenido del script:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/suti/backups"
PROJECT_DIR="/home/suti/inventario-app"

# Backup de base de datos
docker exec inventario_postgres pg_dump -U inventario_user inventario_db > $BACKUP_DIR/db_backup_$DATE.sql

# Backup de configuración
tar -czf $BACKUP_DIR/config_backup_$DATE.tar.gz -C $PROJECT_DIR .env* docker-compose.yml

# Limpiar backups antiguos (30 días)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completado: $DATE"
```

**Hacer ejecutable y configurar cron:**
```bash
sudo chmod +x /home/suti/backup-inventario.sh
sudo chown suti:suti /home/suti/backup-inventario.sh

# Agregar a cron (backup diario a las 2:00 AM)
echo "0 2 * * * /home/suti/backup-inventario.sh" | sudo crontab -u suti -
```

### 7.2 Configurar Monitoreo
```bash
# Crear script de monitoreo
sudo nano /home/suti/monitor.sh
```

**Contenido del script:**
```bash
#!/bin/bash
echo "=== MONITOREO DEL SISTEMA ==="
echo "Fecha: $(date)"
echo ""

# Verificar servicios Docker
echo "=== SERVICIOS DOCKER ==="
docker-compose ps

echo ""
# Verificar recursos
echo "=== RECURSOS DEL SISTEMA ==="
echo "Uso de CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "Uso de memoria: $(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
echo "Uso de disco: $(df / | awk 'NR==2 {print $5}')"

echo ""
# Verificar conectividad
echo "=== CONECTIVIDAD ==="
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Gateway API: OK"
else
    echo "❌ Gateway API: ERROR"
fi

if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Nginx HTTP: OK"
else
    echo "❌ Nginx HTTP: ERROR"
fi
```

**Hacer ejecutable:**
```bash
sudo chmod +x /home/suti/monitor.sh
sudo chown suti:suti /home/suti/monitor.sh
```

### 7.3 Configurar Logrotate
```bash
sudo nano /etc/logrotate.d/inventario-app
```

**Contenido:**
```
/home/suti/inventario-app/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 suti suti
    postrotate
        systemctl reload nginx
    endscript
}
```

---

## 🎯 PASO 8: VERIFICACIÓN FINAL

### 8.1 Comandos de Verificación
```bash
# Verificar todos los servicios
docker-compose ps

# Verificar conectividad externa
curl -I http://10.55.55.20
curl -k -I https://10.55.55.20

# Verificar base de datos
docker-compose exec postgres pg_isready -U inventario_user

# Verificar logs sin errores
docker-compose logs --tail=20 | grep -i error

# Ejecutar monitoreo
/home/suti/monitor.sh
```

### 8.2 Información del Sistema
```bash
# Crear archivo de información
sudo nano /home/suti/server-info.txt
```

**Contenido:**
```
=== INFORMACIÓN DEL SERVIDOR ===
Fecha de configuración: $(date)
IP del servidor: 10.55.55.20
Usuario: suti
Directorio del proyecto: /home/suti/inventario-app

=== COMANDOS ÚTILES ===
Verificar servicios: docker-compose ps
Ver logs: docker-compose logs -f
Reiniciar servicios: docker-compose restart
Backup manual: /home/suti/backup-inventario.sh
Monitoreo: /home/suti/monitor.sh

=== PUERTOS ABIERTOS ===
22 - SSH
80 - HTTP
443 - HTTPS

=== DIRECTORIOS IMPORTANTES ===
Proyecto: /home/suti/inventario-app
Backups: /home/suti/backups
Logs: /home/suti/inventario-app/logs
```

---

## 🚨 COMANDOS DE EMERGENCIA

### Reiniciar Todo el Sistema
```bash
# Parar todos los servicios
docker-compose down

# Reiniciar servidor
sudo reboot

# Después del reinicio, levantar servicios
cd /home/suti/inventario-app
docker-compose up -d
```

### Restaurar desde Backup
```bash
# Restaurar base de datos
docker-compose exec -T postgres psql -U inventario_user -d inventario_db < /home/suti/backups/db_backup_YYYYMMDD_HHMMSS.sql

# Restaurar configuración
tar -xzf /home/suti/backups/config_backup_YYYYMMDD_HHMMSS.tar.gz -C /home/suti/inventario-app
```

### Verificar y Reparar
```bash
# Verificar estado de Docker
sudo systemctl status docker

# Reiniciar Docker si es necesario
sudo systemctl restart docker

# Verificar espacio en disco
df -h

# Limpiar Docker si es necesario
docker system prune -a
```

---

## 📞 COMANDOS DE DIAGNÓSTICO

### Verificar Logs Específicos
```bash
# Logs de PostgreSQL
docker-compose logs postgres | tail -50

# Logs del Gateway
docker-compose logs gateway | tail -50

# Logs de Nginx
docker-compose logs nginx | tail -50

# Logs del sistema
sudo journalctl -f
```

### Verificar Red
```bash
# Verificar puertos abiertos
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
sudo netstat -tulpn | grep :3000

# Verificar firewall
sudo ufw status

# Verificar conectividad
ping 8.8.8.8
nslookup google.com
```

### Verificar Recursos
```bash
# Uso de CPU y memoria
htop

# Uso de disco
df -h

# Uso de Docker
docker stats

# Procesos del sistema
ps aux | grep docker
```

---

## ✅ CHECKLIST FINAL

- [ ] Ubuntu actualizado y configurado
- [ ] Usuario suti creado y configurado
- [ ] IP estática configurada (10.55.55.20)
- [ ] Firewall UFW activado
- [ ] Docker instalado y funcionando
- [ ] Docker Compose instalado
- [ ] Proyecto clonado en /home/suti/inventario-app
- [ ] Variables de entorno configuradas (.env)
- [ ] Servicios Docker corriendo
- [ ] Base de datos PostgreSQL funcionando
- [ ] Gateway API accesible
- [ ] Nginx funcionando como reverse proxy
- [ ] Certificados SSL configurados
- [ ] Backup automático configurado
- [ ] Monitoreo configurado
- [ ] Logs funcionando
- [ ] Conectividad externa verificada

**¡Sistema listo para producción! 🎉** 
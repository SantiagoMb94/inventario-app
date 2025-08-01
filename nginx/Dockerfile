FROM nginx:alpine

# Instalar certbot y dependencias
RUN apk add --no-cache certbot certbot-nginx

# Copiar configuración
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Crear directorios necesarios
RUN mkdir -p /var/www/certbot
RUN mkdir -p /etc/nginx/ssl

# Exponer puertos
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"] 
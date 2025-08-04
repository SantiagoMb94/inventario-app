# 🏢 Sistema de Inventario - React

Sistema moderno de gestión de inventario desarrollado en React con Material-UI y diseño futurista.

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- npm o yarn

### Instalación
```bash
# Instalar dependencias
cd client
npm install

# Iniciar el sistema
npm start
```

### Script de Inicio
```powershell
# Usar el script de inicio (PowerShell)
.\start.ps1
```

## 🌐 Acceso
- **URL:** http://localhost:3006
- **Dashboard:** http://localhost:3006/dashboard
- **Equipment:** http://localhost:3006/equipos
- **Reports:** http://localhost:3006/reportes
- **Settings:** http://localhost:3006/configuracion

## ✨ Características

### 🎨 Diseño
- **Tema futurista** con Glassmorphism
- **Paleta de colores** azul oscuro profesional
- **Sidebar fija** con navegación intuitiva
- **Responsive** para todos los dispositivos

### 📊 Funcionalidades
- **Dashboard** con KPIs y estadísticas
- **Gestión de Equipment** con filtros avanzados
- **Sistema de Reportes** con exportación CSV
- **Configuración** de estados, pisos y marcas

### 🔧 Tecnologías
- **React 18** con Hooks
- **Material-UI** para componentes
- **React Router** para navegación
- **React Query** para gestión de estado

## 📁 Estructura del Proyecto

```
client/
├── src/
│   ├── components/
│   │   └── Layout.js          # Layout principal con sidebar
│   ├── pages/
│   │   ├── Dashboard.js       # Dashboard principal
│   │   ├── Equipos.js         # Gestión de equipment
│   │   ├── Reportes.js        # Sistema de reportes
│   │   └── Configuracion.js   # Configuración del sistema
│   ├── App.js                 # Componente principal
│   ├── index.js               # Punto de entrada
│   └── theme.js               # Tema personalizado
├── public/                    # Archivos estáticos
└── package.json               # Dependencias
```

## 🎯 Características Principales

### Dashboard
- Estadísticas en tiempo real
- Alertas del sistema
- Actividad reciente
- KPIs visuales

### Equipment
- Tabla con datos completos
- Filtros por estado, marca, propiedad
- Búsqueda general
- Acciones por elemento

### Reports
- Generación de reportes
- Filtros personalizables
- Exportación a CSV
- Estadísticas detalladas

### Settings
- Gestión de estados
- Configuración de pisos
- Administración de marcas
- Interfaz intuitiva

## 🛠️ Desarrollo

### Comandos Útiles
```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo
npm start

# Construir para producción
npm run build

# Ejecutar tests
npm test
```

### Estructura de Datos
El sistema utiliza datos de ejemplo que incluyen:
- Equipos con serial, marca, estado
- Usuarios y agentes
- Estados del sistema
- Configuraciones personalizables

## 📝 Notas
- El sistema funciona completamente en el frontend
- No requiere base de datos para funcionar
- Datos de ejemplo incluidos
- Diseño responsive y moderno

## 🆘 Soporte
Para problemas o preguntas:
1. Verificar que Node.js esté instalado
2. Revisar la consola del navegador
3. Asegurar que el puerto 3006 esté libre

---

**Desarrollado por:** Santiago Manco Bolaños  
**Empresa:** SUTI S.A.S  
**Versión:** 1.0.0 
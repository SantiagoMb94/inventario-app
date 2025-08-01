const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const equiposRoutes = require('./routes/equipos');
const { initializeDatabase } = require('./database/connection');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware de seguridad
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'equipos-service'
  });
});

// Rutas
app.use('/equipos', equiposRoutes);

// Ruta por defecto
app.get('/', (req, res) => {
  res.json({
    message: 'Servicio de Equipos - Inventario API',
    version: '1.0.0',
    endpoints: {
      equipos: '/equipos'
    }
  });
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error en Servicio de Equipos:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Inicializar base de datos y arrancar servidor
async function startServer() {
  try {
    await initializeDatabase();
    console.log('✅ Base de datos inicializada correctamente');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servicio de Equipos corriendo en puerto ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

startServer(); 
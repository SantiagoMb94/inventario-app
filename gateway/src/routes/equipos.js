const express = require('express');
const axios = require('axios');
const router = express.Router();

const EQUIPOS_SERVICE_URL = process.env.EQUIPOS_SERVICE_URL || 'http://equipos-service:3002';

// Middleware para verificar autenticación
const authenticateToken = require('../middleware/auth');

// Proxy para todas las rutas de equipos
router.use('/', async (req, res, next) => {
  try {
    const targetUrl = `${EQUIPOS_SERVICE_URL}${req.path}`;
    const method = req.method;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': req.headers.authorization
    };

    let response;
    switch (method) {
      case 'GET':
        response = await axios.get(targetUrl, { 
          headers,
          params: req.query,
          timeout: 10000
        });
        break;
      case 'POST':
        response = await axios.post(targetUrl, req.body, { 
          headers,
          timeout: 10000
        });
        break;
      case 'PUT':
        response = await axios.put(targetUrl, req.body, { 
          headers,
          timeout: 10000
        });
        break;
      case 'DELETE':
        response = await axios.delete(targetUrl, { 
          headers,
          timeout: 10000
        });
        break;
      default:
        return res.status(405).json({ error: 'Método no permitido' });
    }

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error en proxy de equipos:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Servicio de equipos no disponible',
        message: 'El servicio está temporalmente fuera de línea'
      });
    }
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'Error al comunicarse con el servicio de equipos'
    });
  }
});

module.exports = router; 
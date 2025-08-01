const express = require('express');
const axios = require('axios');
const router = express.Router();

const REPORTES_SERVICE_URL = process.env.REPORTES_SERVICE_URL || 'http://reportes-service:3004';

// Proxy para todas las rutas de reportes
router.use('/', async (req, res, next) => {
  try {
    const targetUrl = `${REPORTES_SERVICE_URL}/reportes${req.path}`;
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
    console.error('Error en proxy de reportes:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Servicio de reportes no disponible',
        message: 'El servicio está temporalmente fuera de línea'
      });
    }
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'Error al comunicarse con el servicio de reportes'
    });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');

// Rutas de equipos
router.get('/equipos', inventarioController.getEquipos);
router.get('/equipos/:id', inventarioController.getEquipoById);
router.post('/equipos', inventarioController.crearEquipo);
router.put('/equipos/:id', inventarioController.actualizarEquipo);
router.delete('/equipos/:id', inventarioController.eliminarEquipo);

// Rutas de dashboard
router.get('/dashboard/stats', inventarioController.getDashboardStats);
router.get('/dashboard/activity', inventarioController.getRecentActivity);

// Rutas de reportes
router.post('/reportes/avanzado', inventarioController.getAdvancedReport);

// Rutas de configuración
router.get('/config/lists', inventarioController.getConfigurationLists);
router.post('/config/lists/:listName', inventarioController.addConfigItem);
router.delete('/config/lists/:listName/:value', inventarioController.deleteConfigItem);
router.put('/config/pisos/:oldValue', inventarioController.renamePiso);

// Rutas de actas
router.post('/actas/upload', inventarioController.uploadActa);
router.post('/actas/resend', inventarioController.reenviarActa);

module.exports = router; 
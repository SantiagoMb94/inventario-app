const express = require('express');
const router = express.Router();
const equiposController = require('../controllers/equiposController');

// Rutas para equipos
router.get('/', equiposController.getFilteredEquipment);
router.get('/stock', equiposController.getStockEquipment);
router.get('/dashboard', equiposController.getDashboardData);
router.get('/config', equiposController.getConfigurationLists);
router.get('/history/:serial', equiposController.getIndividualHistory);
router.get('/reports', equiposController.getAdvancedReportData);

// Operaciones CRUD
router.post('/', equiposController.agregarEquipo);
router.put('/:id', equiposController.guardarCambiosEquipo);
router.delete('/:id', equiposController.eliminarEquipo);

// Operaciones especiales
router.post('/assign', equiposController.assignItemFromStock);
router.post('/reenviar-acta', equiposController.reenviarActa);
router.post('/upload-certificate', equiposController.uploadSignedCertificate);

// Configuración
router.post('/config/add', equiposController.addConfigItem);
router.delete('/config/delete', equiposController.deleteConfigItem);
router.put('/config/rename-piso', equiposController.renamePiso);

module.exports = router; 
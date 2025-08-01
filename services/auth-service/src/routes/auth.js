const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');

// Validaciones
const loginValidation = [
    body('email').isEmail().withMessage('Email válido requerido'),
    body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres')
];

const registerValidation = [
    body('nombre').notEmpty().withMessage('Nombre requerido'),
    body('email').isEmail().withMessage('Email válido requerido'),
    body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
    body('rol').isIn(['admin', 'agente']).withMessage('Rol debe ser admin o agente')
];

// Rutas de autenticación
router.post('/login', loginValidation, authController.login);
router.post('/register', registerValidation, authController.register);
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);
router.post('/refresh', authController.refreshToken);

module.exports = router; 
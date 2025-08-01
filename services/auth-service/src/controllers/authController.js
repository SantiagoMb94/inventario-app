const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { query } = require('../database/connection');

// Login
async function login(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Buscar usuario
        const result = await query(
            'SELECT * FROM usuarios WHERE email = $1 AND activo = true',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email, 
                rol: user.rol 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Remover password_hash de la respuesta
        delete user.password_hash;

        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            user
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Registro
async function register(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nombre, email, password, rol = 'agente' } = req.body;

        // Verificar si el email ya existe
        const existingUser = await query(
            'SELECT id FROM usuarios WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Encriptar contraseña
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Crear usuario
        const result = await query(`
            INSERT INTO usuarios (nombre, email, password_hash, rol)
            VALUES ($1, $2, $3, $4)
            RETURNING id, nombre, email, rol, created_at
        `, [nombre, email, passwordHash, rol]);

        const newUser = result.rows[0];

        // Generar token
        const token = jwt.sign(
            { 
                userId: newUser.id, 
                email: newUser.email, 
                rol: newUser.rol 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            token,
            user: newUser
        });

    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Logout
async function logout(req, res) {
    try {
        // En una implementación más robusta, aquí invalidarías el token
        res.json({
            success: true,
            message: 'Logout exitoso'
        });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Obtener usuario actual
async function getCurrentUser(req, res) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const result = await query(
            'SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = $1 AND activo = true',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }
        
        console.error('Error en getCurrentUser:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Refresh token
async function refreshToken(req, res) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificar que el usuario aún existe y está activo
        const result = await query(
            'SELECT id, email, rol FROM usuarios WHERE id = $1 AND activo = true',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const user = result.rows[0];

        // Generar nuevo token
        const newToken = jwt.sign(
            { 
                userId: user.id, 
                email: user.email, 
                rol: user.rol 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            success: true,
            message: 'Token renovado',
            token: newToken
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }
        
        console.error('Error en refreshToken:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = {
    login,
    register,
    logout,
    getCurrentUser,
    refreshToken
}; 
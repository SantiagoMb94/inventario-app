#!/usr/bin/env node

/**
 * Script de migración de datos desde Google Sheets a PostgreSQL
 * Uso: node scripts/migrate-data.js
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'inventario_db',
  user: process.env.POSTGRES_USER || 'inventario_user',
  password: process.env.POSTGRES_PASSWORD || 'inventario_pass_secure_2024',
});

// Función para leer archivo CSV
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Función para migrar equipos
async function migrateEquipos() {
  try {
    console.log('🔄 Migrando equipos...');
    
    const equiposPath = path.join(__dirname, '../data/equipos.csv');
    if (!fs.existsSync(equiposPath)) {
      console.log('⚠️ Archivo equipos.csv no encontrado, saltando...');
      return;
    }

    const equipos = await readCSV(equiposPath);
    console.log(`📊 Encontrados ${equipos.length} equipos para migrar`);

    for (const equipo of equipos) {
      // Mapear campos del CSV a la base de datos
      const equipoData = {
        serial: equipo.Serial || equipo.serial,
        nombre: equipo.Nombre || equipo.nombre,
        marca: equipo.Marca || equipo.marca,
        modelo: equipo.Modelo || equipo.modelo,
        tipo: equipo.Tipo || equipo.tipo,
        estado: equipo.Estado || equipo.estado || 'Stock',
        ubicacion: equipo.Ubicacion || equipo.ubicacion || 'Stock',
        piso: equipo.Piso || equipo.piso,
        agente_nombre: equipo.Agente || equipo.agente_nombre,
        agente_email: equipo['Email Agente'] || equipo.agente_email,
        propiedad: equipo.Propiedad || equipo.propiedad,
        fecha_ingreso: equipo['Fecha de Ingreso'] || equipo.fecha_ingreso || new Date().toISOString().split('T')[0],
        observaciones: equipo.Observaciones || equipo.observaciones
      };

      // Insertar o actualizar equipo
      await pool.query(`
        INSERT INTO equipos (
          serial, nombre, marca, modelo, tipo, estado, ubicacion, piso,
          agente_nombre, agente_email, propiedad, fecha_ingreso, observaciones
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (serial) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          marca = EXCLUDED.marca,
          modelo = EXCLUDED.modelo,
          tipo = EXCLUDED.tipo,
          estado = EXCLUDED.estado,
          ubicacion = EXCLUDED.ubicacion,
          piso = EXCLUDED.piso,
          agente_nombre = EXCLUDED.agente_nombre,
          agente_email = EXCLUDED.agente_email,
          propiedad = EXCLUDED.propiedad,
          fecha_ingreso = EXCLUDED.fecha_ingreso,
          observaciones = EXCLUDED.observaciones,
          updated_at = CURRENT_TIMESTAMP
      `, [
        equipoData.serial, equipoData.nombre, equipoData.marca, equipoData.modelo,
        equipoData.tipo, equipoData.estado, equipoData.ubicacion, equipoData.piso,
        equipoData.agente_nombre, equipoData.agente_email, equipoData.propiedad,
        equipoData.fecha_ingreso, equipoData.observaciones
      ]);
    }

    console.log('✅ Equipos migrados correctamente');

  } catch (error) {
    console.error('❌ Error migrando equipos:', error);
    throw error;
  }
}

// Función para migrar configuración
async function migrateConfiguracion() {
  try {
    console.log('🔄 Migrando configuración...');
    
    const configPath = path.join(__dirname, '../data/configuracion.csv');
    if (!fs.existsSync(configPath)) {
      console.log('⚠️ Archivo configuracion.csv no encontrado, usando configuración por defecto...');
      return;
    }

    const config = await readCSV(configPath);
    console.log(`📊 Encontrados ${config.length} elementos de configuración`);

    for (const item of config) {
      await pool.query(`
        INSERT INTO configuracion (categoria, valor, descripcion)
        VALUES ($1, $2, $3)
        ON CONFLICT (categoria, valor) DO NOTHING
      `, [
        item.categoria || item.Categoria,
        item.valor || item.Valor,
        item.descripcion || item.Descripcion || `Valor de ${item.categoria || item.Categoria}`
      ]);
    }

    console.log('✅ Configuración migrada correctamente');

  } catch (error) {
    console.error('❌ Error migrando configuración:', error);
    throw error;
  }
}

// Función para migrar usuarios
async function migrateUsuarios() {
  try {
    console.log('🔄 Migrando usuarios...');
    
    const usuariosPath = path.join(__dirname, '../data/usuarios.csv');
    if (!fs.existsSync(usuariosPath)) {
      console.log('⚠️ Archivo usuarios.csv no encontrado, creando usuario por defecto...');
      
      // Crear usuario administrador por defecto
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      await pool.query(`
        INSERT INTO usuarios (nombre, email, password_hash, rol)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO NOTHING
      `, ['Administrador', 'admin@inventario.com', passwordHash, 'admin']);
      
      console.log('✅ Usuario administrador creado (admin@inventario.com / admin123)');
      return;
    }

    const usuarios = await readCSV(usuariosPath);
    console.log(`📊 Encontrados ${usuarios.length} usuarios`);

    const bcrypt = require('bcryptjs');
    
    for (const usuario of usuarios) {
      const passwordHash = await bcrypt.hash(usuario.password || 'password123', 10);
      
      await pool.query(`
        INSERT INTO usuarios (nombre, email, password_hash, rol)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          password_hash = EXCLUDED.password_hash,
          rol = EXCLUDED.rol,
          updated_at = CURRENT_TIMESTAMP
      `, [
        usuario.nombre || usuario.Nombre,
        usuario.email || usuario.Email,
        passwordHash,
        usuario.rol || usuario.Rol || 'agente'
      ]);
    }

    console.log('✅ Usuarios migrados correctamente');

  } catch (error) {
    console.error('❌ Error migrando usuarios:', error);
    throw error;
  }
}

// Función para migrar historial
async function migrateHistorial() {
  try {
    console.log('🔄 Migrando historial...');
    
    const historialPath = path.join(__dirname, '../data/historial.csv');
    if (!fs.existsSync(historialPath)) {
      console.log('⚠️ Archivo historial.csv no encontrado, saltando...');
      return;
    }

    const historial = await readCSV(historialPath);
    console.log(`📊 Encontrados ${historial.length} registros de historial`);

    for (const registro of historial) {
      await pool.query(`
        INSERT INTO historial (fecha, serial, accion, detalles)
        VALUES ($1, $2, $3, $4)
      `, [
        registro.fecha || registro.Fecha || new Date().toISOString(),
        registro.serial || registro.Serial,
        registro.accion || registro.Accion,
        registro.detalles || registro.Detalles
      ]);
    }

    console.log('✅ Historial migrado correctamente');

  } catch (error) {
    console.error('❌ Error migrando historial:', error);
    throw error;
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando migración de datos...');
  console.log('📁 Buscando archivos CSV en /data/...');

  try {
    // Verificar conexión a la base de datos
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL establecida');

    // Ejecutar migraciones
    await migrateUsuarios();
    await migrateConfiguracion();
    await migrateEquipos();
    await migrateHistorial();

    console.log('🎉 Migración completada exitosamente!');
    console.log('');
    console.log('📋 Resumen:');
    console.log('- Usuarios: Migrados');
    console.log('- Configuración: Migrada');
    console.log('- Equipos: Migrados');
    console.log('- Historial: Migrado');
    console.log('');
    console.log('🔐 Credenciales por defecto:');
    console.log('- Email: admin@inventario.com');
    console.log('- Contraseña: admin123');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  migrateEquipos,
  migrateConfiguracion,
  migrateUsuarios,
  migrateHistorial
}; 
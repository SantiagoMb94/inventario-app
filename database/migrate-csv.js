const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const csv = require('csv-parser');

// Configuración de la base de datos
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'inventario_db',
  user: process.env.POSTGRES_USER || 'inventario_user',
  password: process.env.POSTGRES_PASSWORD || 'inventario_pass_secure_2024',
});

// Función para leer archivo CSV
const readCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

// Función para limpiar y normalizar datos
const cleanData = (data) => {
  return Object.keys(data).reduce((acc, key) => {
    const value = data[key];
    if (value && value.trim() !== '') {
      acc[key] = value.trim();
    }
    return acc;
  }, {});
};

// Función para obtener o crear usuario
const getOrCreateUser = async (nombre, email = null) => {
  if (!nombre || nombre === '') return null;
  
  try {
    // Buscar usuario existente
    const existingUser = await pool.query(
      'SELECT id FROM usuarios WHERE nombre = $1',
      [nombre]
    );
    
    if (existingUser.rows.length > 0) {
      return existingUser.rows[0].id;
    }
    
    // Crear nuevo usuario
    const newUser = await pool.query(
      'INSERT INTO usuarios (nombre, email) VALUES ($1, $2) RETURNING id',
      [nombre, email]
    );
    
    return newUser.rows[0].id;
  } catch (error) {
    console.error(`Error al procesar usuario ${nombre}:`, error.message);
    return null;
  }
};

// Función para obtener ID de referencia
const getReferenceId = async (table, field, value) => {
  if (!value || value === '') return null;
  
  try {
    const result = await pool.query(
      `SELECT id FROM ${table} WHERE ${field} = $1`,
      [value]
    );
    
    return result.rows.length > 0 ? result.rows[0].id : null;
  } catch (error) {
    console.error(`Error al buscar ${table}.${field} = ${value}:`, error.message);
    return null;
  }
};

// Función para procesar equipos de un archivo CSV
const processEquiposFile = async (filePath, pisoNombre) => {
  console.log(`Procesando archivo: ${path.basename(filePath)}`);
  
  try {
    const data = await readCSV(filePath);
    const pisoId = await getReferenceId('pisos', 'nombre', pisoNombre);
    
    if (!pisoId) {
      console.error(`Piso no encontrado: ${pisoNombre}`);
      return;
    }
    
    let processed = 0;
    let errors = 0;
    
    for (const row of data) {
      try {
        const cleanRow = cleanData(row);
        
        // Obtener IDs de referencia
        const marcaId = await getReferenceId('marcas', 'nombre', cleanRow.Marca);
        const propiedadId = await getReferenceId('propiedades', 'nombre', cleanRow.Propiedad);
        const estadoId = await getReferenceId('estados', 'nombre', cleanRow.Estado);
        const usuarioId = await getOrCreateUser(cleanRow.Agente);
        
        // Insertar equipo
        const equipoResult = await pool.query(`
          INSERT INTO equipos (
            serial, nombre, marca_id, propiedad_id, estado_id, piso_id, 
            usuario_id, mac_lan, mac_wifi, fecha_ingreso
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (serial) DO UPDATE SET
            nombre = EXCLUDED.nombre,
            marca_id = EXCLUDED.marca_id,
            propiedad_id = EXCLUDED.propiedad_id,
            estado_id = EXCLUDED.estado_id,
            piso_id = EXCLUDED.piso_id,
            usuario_id = EXCLUDED.usuario_id,
            mac_lan = EXCLUDED.mac_lan,
            mac_wifi = EXCLUDED.mac_wifi,
            fecha_ingreso = EXCLUDED.fecha_ingreso,
            updated_at = CURRENT_TIMESTAMP
          RETURNING id
        `, [
          cleanRow.Serial,
          cleanRow['Nombre del elemento'],
          marcaId,
          propiedadId,
          estadoId,
          pisoId,
          usuarioId,
          cleanRow['Mac Lan'] || null,
          cleanRow['Mac Wifi'] || null,
          cleanRow['Fecha de Ingreso'] ? new Date(cleanRow['Fecha de Ingreso']) : null
        ]);
        
        const equipoId = equipoResult.rows[0].id;
        
        // Procesar acta si existe
        if (cleanRow['Acta Firmada'] && cleanRow['Acta Firmada'].includes('drive.google.com')) {
          await pool.query(`
            INSERT INTO actas (equipo_id, usuario_id, url_acta, tipo_acta)
            VALUES ($1, $2, $3, 'entrega')
            ON CONFLICT DO NOTHING
          `, [equipoId, usuarioId, cleanRow['Acta Firmada']]);
        }
        
        processed++;
        
        if (processed % 10 === 0) {
          console.log(`  Procesados: ${processed} equipos`);
        }
        
      } catch (error) {
        console.error(`Error procesando equipo ${row.Serial}:`, error.message);
        errors++;
      }
    }
    
    console.log(`✅ ${path.basename(filePath)}: ${processed} equipos procesados, ${errors} errores`);
    
  } catch (error) {
    console.error(`❌ Error procesando archivo ${filePath}:`, error.message);
  }
};

// Función para procesar historial
const processHistorial = async (filePath) => {
  console.log(`Procesando historial: ${path.basename(filePath)}`);
  
  try {
    const data = await readCSV(filePath);
    let processed = 0;
    let errors = 0;
    
    for (const row of data) {
      try {
        const cleanRow = cleanData(row);
        
        // Buscar equipo por serial
        const equipoResult = await pool.query(
          'SELECT id FROM equipos WHERE serial = $1',
          [cleanRow.Serial]
        );
        
        if (equipoResult.rows.length === 0) {
          console.warn(`Equipo no encontrado para historial: ${cleanRow.Serial}`);
          continue;
        }
        
        const equipoId = equipoResult.rows[0].id;
        
        // Extraer usuario del historial si es posible
        let usuarioId = null;
        if (cleanRow.Detalles) {
          const match = cleanRow.Detalles.match(/Assigned to (.+?)(?: on| as|\.|$)/);
          if (match) {
            usuarioId = await getOrCreateUser(match[1].trim());
          }
        }
        
        // Insertar registro de historial
        await pool.query(`
          INSERT INTO historial_cambios (equipo_id, usuario_id, accion, detalles, fecha_cambio)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `, [
          equipoId,
          usuarioId,
          cleanRow.Acción,
          cleanRow.Detalles,
          cleanRow.Fecha ? new Date(cleanRow.Fecha) : new Date()
        ]);
        
        processed++;
        
        if (processed % 50 === 0) {
          console.log(`  Procesados: ${processed} registros de historial`);
        }
        
      } catch (error) {
        console.error(`Error procesando historial para ${row.Serial}:`, error.message);
        errors++;
      }
    }
    
    console.log(`✅ Historial: ${processed} registros procesados, ${errors} errores`);
    
  } catch (error) {
    console.error(`❌ Error procesando historial:`, error.message);
  }
};

// Función principal de migración
const migrateData = async () => {
  console.log('🚀 Iniciando migración de datos CSV a PostgreSQL...\n');
  
  try {
    // Verificar conexión
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL establecida\n');
    
    const csvDir = path.join(__dirname, '..', 'csv');
    
    // Procesar archivos de equipos por piso
    const equiposFiles = [
      { file: 'equipment inventory - Piso 7.csv', piso: '7' },
      { file: 'equipment inventory - Piso 10.csv', piso: '10' },
      { file: 'equipment inventory - Piso 12.csv', piso: '12' },
      { file: 'equipment inventory - Piso 16.csv', piso: '16' },
      { file: 'equipment inventory - Piso VIP.csv', piso: 'VIP' },
      { file: 'equipment inventory - Stock.csv', piso: 'Stock' }
    ];
    
    for (const { file, piso } of equiposFiles) {
      const filePath = path.join(csvDir, file);
      if (fs.existsSync(filePath)) {
        await processEquiposFile(filePath, piso);
      } else {
        console.warn(`⚠️ Archivo no encontrado: ${file}`);
      }
    }
    
    // Procesar historial
    const historialFile = path.join(csvDir, 'equipment inventory - Historial.csv');
    if (fs.existsSync(historialFile)) {
      await processHistorial(historialFile);
    } else {
      console.warn('⚠️ Archivo de historial no encontrado');
    }
    
    console.log('\n🎉 Migración completada exitosamente!');
    
    // Mostrar estadísticas finales
    const stats = await pool.query('SELECT * FROM vista_estadisticas');
    console.log('\n📊 Estadísticas finales:');
    console.log(stats.rows[0]);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData }; 
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'inventario_db',
  user: process.env.POSTGRES_USER || 'inventario_user',
  password: process.env.POSTGRES_PASSWORD || 'inventario_pass_secure_2024',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    // Verificar conexión
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida');
    
    // Verificar que las tablas existan
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('equipos', 'usuarios', 'historial', 'actas', 'configuracion')
    `);
    
    console.log(`📊 Tablas encontradas: ${result.rows.length}`);
    client.release();
    
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error.message);
    throw error;
  }
}

// Función para ejecutar consultas
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📝 Query ejecutada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Error en query:', error);
    throw error;
  }
}

// Función para obtener un cliente
async function getClient() {
  return await pool.connect();
}

module.exports = {
  pool,
  query,
  getClient,
  initializeDatabase
}; 
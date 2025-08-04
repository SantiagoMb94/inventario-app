const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

class DataMigrator {
  constructor() {
    this.equipos = [];
    this.usuarios = new Map();
    this.historial = [];
    this.estados = new Set();
    this.marcas = new Set();
    this.pisos = new Set();
    this.propiedades = new Set();
  }

  // Leer archivo CSV
  async readCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  // Procesar equipos de un CSV
  processEquipos(data, piso) {
    data.forEach(row => {
      // Normalizar datos
      const equipo = {
        serial: row.Serial?.trim(),
        nombre: row['Nombre del elemento']?.trim(),
        marca: row.Marca?.trim(),
        propiedad: row.Propiedad?.trim(),
        fecha_ingreso: row['Fecha de Ingreso']?.trim(),
        agente: row.Agente?.trim(),
        estado: row.Estado?.trim(),
        piso: piso,
        mac_lan: row['Mac Lan']?.trim(),
        mac_wifi: row['Mac Wifi']?.trim(),
        acta_firmada: row['Acta Firmada']?.trim()
      };

      // Validar que tenga serial
      if (equipo.serial && equipo.serial !== '') {
        this.equipos.push(equipo);
        
        // Agregar a sets de configuración
        if (equipo.estado) this.estados.add(equipo.estado);
        if (equipo.marca) this.marcas.add(equipo.marca);
        if (equipo.piso) this.pisos.add(equipo.piso);
        if (equipo.propiedad) this.propiedades.add(equipo.propiedad);
        
        // Agregar usuario si existe
        if (equipo.agente && equipo.agente !== '') {
          this.usuarios.set(equipo.agente, {
            nombre: equipo.agente,
            email: this.extractEmail(equipo.agente),
            departamento: this.extractDepartment(equipo.agente)
          });
        }
      }
    });
  }

  // Procesar historial
  processHistorial(data) {
    data.forEach(row => {
      const historial = {
        fecha: row.Fecha?.trim(),
        serial: row.Serial?.trim(),
        accion: row.Acción?.trim(),
        detalles: row.Detalles?.trim()
      };

      if (historial.serial && historial.serial !== '') {
        this.historial.push(historial);
      }
    });
  }

  // Extraer email del nombre del agente
  extractEmail(agente) {
    // Buscar patrones de email en el nombre
    const emailMatch = agente.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return emailMatch ? emailMatch[0] : null;
  }

  // Extraer departamento del nombre del agente
  extractDepartment(agente) {
    // Buscar departamentos comunes
    const departments = ['IT', 'HHRR', 'VIP'];
    for (const dept of departments) {
      if (agente.includes(dept)) {
        return dept;
      }
    }
    return null;
  }

  // Generar esquema SQL
  generateSQLSchema() {
    const sql = [];

    // Crear tablas de configuración
    sql.push(`
-- ========================================
-- ESQUEMA DE BASE DE DATOS - SISTEMA INVENTARIO
-- ========================================

-- Crear base de datos
CREATE DATABASE inventario_db;
\\c inventario_db;

-- Tabla de estados
CREATE TABLE estados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(20) DEFAULT '#1976d2',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de marcas
CREATE TABLE marcas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de pisos
CREATE TABLE pisos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de propiedades
CREATE TABLE propiedades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    departamento VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de equipos
CREATE TABLE equipos (
    id SERIAL PRIMARY KEY,
    serial VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    marca_id INTEGER REFERENCES marcas(id),
    propiedad_id INTEGER REFERENCES propiedades(id),
    fecha_ingreso TIMESTAMP,
    agente_id INTEGER REFERENCES usuarios(id),
    estado_id INTEGER REFERENCES estados(id),
    piso_id INTEGER REFERENCES pisos(id),
    mac_lan VARCHAR(17),
    mac_wifi VARCHAR(17),
    acta_firmada_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de historial de cambios
CREATE TABLE historial_cambios (
    id SERIAL PRIMARY KEY,
    fecha TIMESTAMP NOT NULL,
    equipo_id INTEGER REFERENCES equipos(id),
    accion VARCHAR(50) NOT NULL,
    detalles TEXT,
    usuario_id INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_equipos_serial ON equipos(serial);
CREATE INDEX idx_equipos_estado ON equipos(estado_id);
CREATE INDEX idx_equipos_piso ON equipos(piso_id);
CREATE INDEX idx_equipos_agente ON equipos(agente_id);
CREATE INDEX idx_historial_fecha ON historial_cambios(fecha);
CREATE INDEX idx_historial_equipo ON historial_cambios(equipo_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_equipos_updated_at BEFORE UPDATE ON equipos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`);

    return sql.join('\n');
  }

  // Generar datos de inserción
  generateInsertData() {
    const inserts = [];

    // Insertar estados
    inserts.push('-- Insertar estados');
    this.estados.forEach(estado => {
      inserts.push(`INSERT INTO estados (nombre) VALUES ('${estado}');`);
    });

    // Insertar marcas
    inserts.push('\n-- Insertar marcas');
    this.marcas.forEach(marca => {
      inserts.push(`INSERT INTO marcas (nombre) VALUES ('${marca}');`);
    });

    // Insertar pisos
    inserts.push('\n-- Insertar pisos');
    this.pisos.forEach(piso => {
      inserts.push(`INSERT INTO pisos (nombre) VALUES ('${piso}');`);
    });

    // Insertar propiedades
    inserts.push('\n-- Insertar propiedades');
    this.propiedades.forEach(propiedad => {
      inserts.push(`INSERT INTO propiedades (nombre) VALUES ('${propiedad}');`);
    });

    // Insertar usuarios
    inserts.push('\n-- Insertar usuarios');
    this.usuarios.forEach(usuario => {
      const email = usuario.email ? `'${usuario.email}'` : 'NULL';
      const dept = usuario.departamento ? `'${usuario.departamento}'` : 'NULL';
      inserts.push(`INSERT INTO usuarios (nombre, email, departamento) VALUES ('${usuario.nombre}', ${email}, ${dept});`);
    });

    return inserts.join('\n');
  }

  // Generar reporte de estadísticas
  generateReport() {
    const report = {
      totalEquipos: this.equipos.length,
      totalUsuarios: this.usuarios.size,
      totalHistorial: this.historial.length,
      estados: Array.from(this.estados),
      marcas: Array.from(this.marcas),
      pisos: Array.from(this.pisos),
      propiedades: Array.from(this.propiedades),
      equiposPorPiso: {},
      equiposPorEstado: {},
      equiposPorMarca: {}
    };

    // Estadísticas por piso
    this.equipos.forEach(equipo => {
      report.equiposPorPiso[equipo.piso] = (report.equiposPorPiso[equipo.piso] || 0) + 1;
      report.equiposPorEstado[equipo.estado] = (report.equiposPorEstado[equipo.estado] || 0) + 1;
      report.equiposPorMarca[equipo.marca] = (report.equiposPorMarca[equipo.marca] || 0) + 1;
    });

    return report;
  }

  // Ejecutar migración completa
  async migrate() {
    console.log('🚀 Iniciando migración de datos...\n');

    try {
      // Leer archivos CSV
      const csvFiles = [
        'csv/equipment inventory - Stock.csv',
        'csv/equipment inventory - Piso VIP.csv',
        'csv/equipment inventory - Piso 7.csv',
        'csv/equipment inventory - Piso 10.csv',
        'csv/equipment inventory - Piso 12.csv',
        'csv/equipment inventory - Piso 16.csv'
      ];

      // Procesar equipos
      for (const file of csvFiles) {
        if (fs.existsSync(file)) {
          console.log(`📁 Procesando: ${file}`);
          const data = await this.readCSV(file);
          const piso = file.includes('Stock') ? 'Stock' : 
                      file.includes('VIP') ? 'VIP' :
                      file.match(/Piso (\d+)/)?.[1] || 'Desconocido';
          this.processEquipos(data, piso);
        }
      }

      // Procesar historial
      if (fs.existsSync('csv/equipment inventory - Historial.csv')) {
        console.log('📁 Procesando: Historial');
        const historialData = await this.readCSV('csv/equipment inventory - Historial.csv');
        this.processHistorial(historialData);
      }

      // Generar archivos
      console.log('\n📝 Generando archivos...');

      // Esquema SQL
      const schema = this.generateSQLSchema();
      fs.writeFileSync('database/schema.sql', schema);
      console.log('✅ Esquema SQL generado: database/schema.sql');

      // Datos de inserción
      const inserts = this.generateInsertData();
      fs.writeFileSync('database/insert_data.sql', inserts);
      console.log('✅ Datos de inserción generados: database/insert_data.sql');

      // Reporte
      const report = this.generateReport();
      fs.writeFileSync('database/migration_report.json', JSON.stringify(report, null, 2));
      console.log('✅ Reporte de migración generado: database/migration_report.json');

      // Mostrar estadísticas
      console.log('\n📊 ESTADÍSTICAS DE MIGRACIÓN:');
      console.log(`   • Total equipos: ${report.totalEquipos}`);
      console.log(`   • Total usuarios: ${report.totalUsuarios}`);
      console.log(`   • Total registros de historial: ${report.totalHistorial}`);
      console.log(`   • Estados: ${report.estados.join(', ')}`);
      console.log(`   • Marcas: ${report.marcas.join(', ')}`);
      console.log(`   • Pisos: ${report.pisos.join(', ')}`);
      console.log(`   • Propiedades: ${report.propiedades.join(', ')}`);

      console.log('\n🎉 ¡Migración completada exitosamente!');
      console.log('\n📋 PRÓXIMOS PASOS:');
      console.log('   1. Revisar database/schema.sql');
      console.log('   2. Revisar database/insert_data.sql');
      console.log('   3. Revisar database/migration_report.json');
      console.log('   4. Configurar PostgreSQL en Ubuntu');
      console.log('   5. Ejecutar los scripts SQL');

    } catch (error) {
      console.error('❌ Error durante la migración:', error);
    }
  }
}

// Ejecutar migración
const migrator = new DataMigrator();
migrator.migrate(); 
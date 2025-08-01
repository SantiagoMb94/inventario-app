const { query } = require('../database/connection');
const { generarActaYEnviarCorreo, reenviarActa: reenviarActaService } = require('../services/emailService');

// ===============================================================
// CONTROLADOR PRINCIPAL - MIGRADO DESDE GOOGLE APPS SCRIPT
// ===============================================================

// Obtener equipos con filtros y paginación
const getEquipos = async (req, res) => {
  try {
    const { 
      pagina = 1, 
      itemsPorPagina = 30, 
      filtros = {}, 
      hoja = 'Stock' 
    } = req.query;

    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    // Filtro por ubicación
    if (hoja && hoja !== 'All Locations') {
      whereConditions.push(`ubicacion = $${paramIndex++}`);
      params.push(hoja);
    }

    // Filtros específicos
    if (filtros.Estado) {
      whereConditions.push(`estado = $${paramIndex++}`);
      params.push(filtros.Estado);
    }
    if (filtros.Marca) {
      whereConditions.push(`marca = $${paramIndex++}`);
      params.push(filtros.Marca);
    }
    if (filtros.Propiedad) {
      whereConditions.push(`propiedad = $${paramIndex++}`);
      params.push(filtros.Propiedad);
    }
    if (filtros.general) {
      whereConditions.push(`(
        serial ILIKE $${paramIndex} OR 
        nombre ILIKE $${paramIndex} OR 
        agente ILIKE $${paramIndex}
      )`);
      params.push(`%${filtros.general}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Contar total
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM equipos 
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const totalItems = parseInt(countResult.rows[0].total);

    // Calcular paginación
    const offset = (pagina - 1) * itemsPorPagina;
    const totalPaginas = Math.ceil(totalItems / itemsPorPagina);

    // Obtener datos paginados
    const dataQuery = `
      SELECT * FROM equipos 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    params.push(itemsPorPagina, offset);

    const dataResult = await query(dataQuery, params);

    res.json({
      datos: dataResult.rows,
      paginaActual: parseInt(pagina),
      totalPaginas,
      itemsPorPagina: parseInt(itemsPorPagina),
      totalItems
    });

  } catch (error) {
    console.error('Error en getEquipos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener estadísticas del dashboard
const getDashboardStats = async (req, res) => {
  try {
    // Estadísticas básicas
    const statsQuery = `
      SELECT 
        COUNT(*) as totalEquipos,
        COUNT(CASE WHEN estado = 'Asignado' THEN 1 END) as totalAsignados,
        COUNT(CASE WHEN estado = 'Stock' THEN 1 END) as totalStock,
        COUNT(CASE WHEN estado = 'En Reparación' THEN 1 END) as enReparacion,
        COUNT(CASE WHEN estado = 'De Baja' THEN 1 END) as deBaja
      FROM equipos
    `;
    const statsResult = await query(statsQuery);
    const stats = statsResult.rows[0];

    // Equipos por ubicación
    const ubicacionQuery = `
      SELECT ubicacion, COUNT(*) as cantidad
      FROM equipos 
      GROUP BY ubicacion 
      ORDER BY cantidad DESC
    `;
    const ubicacionResult = await query(ubicacionQuery);
    const equiposPorUbicacion = [
      ['Ubicación', 'Cantidad'],
      ...ubicacionResult.rows.map(row => [row.ubicacion, parseInt(row.cantidad)])
    ];

    // Equipos por estado
    const estadoQuery = `
      SELECT estado, COUNT(*) as cantidad
      FROM equipos 
      GROUP BY estado 
      ORDER BY cantidad DESC
    `;
    const estadoResult = await query(estadoQuery);
    const equiposPorEstado = [
      ['Estado', 'Cantidad'],
      ...estadoResult.rows.map(row => [row.estado, parseInt(row.cantidad)])
    ];

    // Alertas
    const alertas = await getAlertas();

    res.json({
      stats,
      equiposPorUbicacion,
      equiposPorEstado,
      alertas
    });

  } catch (error) {
    console.error('Error en getDashboardStats:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener actividad reciente
const getRecentActivity = async (req, res) => {
  try {
    const activityQuery = `
      SELECT 
        fecha_cambio,
        serial,
        accion,
        detalles
      FROM historial_cambios 
      ORDER BY fecha_cambio DESC 
      LIMIT 20
    `;
    const result = await query(activityQuery);
    
    const activities = result.rows.map(row => [
      new Date(row.fecha_cambio).toLocaleString('es-CO'),
      row.serial,
      row.accion,
      row.detalles
    ]);

    res.json(activities);

  } catch (error) {
    console.error('Error en getRecentActivity:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener listas de configuración
const getConfigurationLists = async (req, res) => {
  try {
    const query = `
      SELECT list_name, item_value 
      FROM config_lists 
      ORDER BY list_name, item_value
    `;
    const result = await query(query);
    
    const config = {};
    result.rows.forEach(row => {
      if (!config[row.list_name]) {
        config[row.list_name] = [];
      }
      config[row.list_name].push(row.item_value);
    });

    res.json(config);

  } catch (error) {
    console.error('Error en getConfigurationLists:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Agregar item de configuración
const addConfigItem = async (req, res) => {
  try {
    const { listName } = req.params;
    const { value } = req.body;

    if (!value || !value.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'El valor es requerido' 
      });
    }

    await query(
      'INSERT INTO config_lists (list_name, item_value) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [listName, value.trim()]
    );

    res.json({ 
      success: true, 
      message: `Item agregado a ${listName} correctamente` 
    });

  } catch (error) {
    console.error('Error en addConfigItem:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// Eliminar item de configuración
const deleteConfigItem = async (req, res) => {
  try {
    const { listName, value } = req.params;

    await query(
      'DELETE FROM config_lists WHERE list_name = $1 AND item_value = $2',
      [listName, value]
    );

    res.json({ 
      success: true, 
      message: `Item eliminado de ${listName} correctamente` 
    });

  } catch (error) {
    console.error('Error en deleteConfigItem:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// Renombrar piso
const renamePiso = async (req, res) => {
  try {
    const { oldValue } = req.params;
    const { newValue } = req.body;

    if (!newValue || !newValue.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'El nuevo valor es requerido' 
      });
    }

    // Actualizar en config_lists
    await query(
      'UPDATE config_lists SET item_value = $1 WHERE list_name = $2 AND item_value = $3',
      [newValue.trim(), 'pisos', oldValue]
    );

    // Actualizar en equipos
    await query(
      'UPDATE equipos SET piso = $1, ubicacion = $1 WHERE piso = $2',
      [newValue.trim(), oldValue]
    );

    res.json({ 
      success: true, 
      message: `Piso renombrado de "${oldValue}" a "${newValue.trim()}"` 
    });

  } catch (error) {
    console.error('Error en renamePiso:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// Reporte avanzado
const getAdvancedReport = async (req, res) => {
  try {
    const { filterType, filterValues } = req.body;

    if (!filterType || !filterValues || filterValues.length === 0) {
      return res.status(400).json({ error: 'Filtros requeridos' });
    }

    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    // Construir condiciones según el tipo de filtro
    switch (filterType) {
      case 'Estado':
        whereConditions.push(`estado = ANY($${paramIndex++})`);
        params.push(filterValues);
        break;
      case 'Marca':
        whereConditions.push(`marca = ANY($${paramIndex++})`);
        params.push(filterValues);
        break;
      case 'Piso':
        whereConditions.push(`piso = ANY($${paramIndex++})`);
        params.push(filterValues);
        break;
      case 'Agente':
        whereConditions.push(`agente = ANY($${paramIndex++})`);
        params.push(filterValues);
        break;
      case 'Propiedad':
        whereConditions.push(`propiedad = ANY($${paramIndex++})`);
        params.push(filterValues);
        break;
      default:
        return res.status(400).json({ error: 'Tipo de filtro no válido' });
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Obtener resultados
    const dataQuery = `
      SELECT * FROM equipos 
      ${whereClause}
      ORDER BY created_at DESC
    `;
    const dataResult = await query(dataQuery, params);

    // Calcular estadísticas
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN estado = 'Asignado' THEN 1 END) as asignado,
        COUNT(CASE WHEN estado = 'Stock' THEN 1 END) as stock,
        COUNT(CASE WHEN estado = 'En Reparación' THEN 1 END) as reparacion
      FROM equipos 
      ${whereClause}
    `;
    const statsResult = await query(statsQuery, params);

    res.json({
      results: dataResult.rows,
      stats: statsResult.rows[0]
    });

  } catch (error) {
    console.error('Error en getAdvancedReport:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Subir acta
const uploadActa = async (req, res) => {
  try {
    const { idFila, sheetName, fileData } = req.body;

    // Aquí implementarías la lógica de subida de archivos
    // Por ahora simulamos la respuesta
    const actaUrl = `https://drive.google.com/file/d/example-${Date.now()}`;

    // Actualizar el equipo con la URL del acta
    await query(
      'UPDATE equipos SET acta_firmada_url = $1 WHERE id = $2',
      [actaUrl, idFila]
    );

    // Registrar en historial
    await query(
      'INSERT INTO historial_cambios (serial, accion, detalles) VALUES ($1, $2, $3)',
      ['N/A', 'Subida de Acta', `Acta subida para equipo ID: ${idFila}`]
    );

    res.json({ 
      success: true, 
      message: 'Acta subida correctamente',
      url: actaUrl
    });

  } catch (error) {
    console.error('Error en uploadActa:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// Reenviar acta
const reenviarActaController = async (req, res) => {
  try {
    const { sheetName, idFila, agentId, agentEmail } = req.body;

    // Obtener datos del equipo
    const equipoQuery = 'SELECT * FROM equipos WHERE id = $1';
    const equipoResult = await query(equipoQuery, [idFila]);
    
    if (equipoResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Equipo no encontrado' 
      });
    }

    const equipo = equipoResult.rows[0];

    // Reenviar acta usando el servicio de email
    await reenviarActaService(equipo, agentEmail);

    res.json({ 
      success: true, 
      message: 'Acta reenviada correctamente' 
    });

  } catch (error) {
    console.error('Error en reenviarActa:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// Función auxiliar para obtener alertas
const getAlertas = async () => {
  try {
    const alertas = {};

    // Equipos sin serial
    const sinSerialQuery = `
      SELECT nombre, ubicacion 
      FROM equipos 
      WHERE serial IS NULL OR serial = ''
    `;
    const sinSerialResult = await query(sinSerialQuery);
    alertas.equiposSinSerial = sinSerialResult.rows;

    // Seriales duplicados
    const serialesDuplicadosQuery = `
      SELECT serial, COUNT(*) as count
      FROM equipos 
      WHERE serial IS NOT NULL AND serial != ''
      GROUP BY serial 
      HAVING COUNT(*) > 1
    `;
    const serialesDuplicadosResult = await query(serialesDuplicadosQuery);
    alertas.serialesDuplicados = serialesDuplicadosResult.rows.map(row => ({
      value: row.serial,
      count: parseInt(row.count)
    }));

    // MACs duplicadas
    const macLanDuplicadasQuery = `
      SELECT "mac_lan", COUNT(*) as count
      FROM equipos 
      WHERE "mac_lan" IS NOT NULL AND "mac_lan" != ''
      GROUP BY "mac_lan" 
      HAVING COUNT(*) > 1
    `;
    const macLanDuplicadasResult = await query(macLanDuplicadasQuery);
    alertas.macLanDuplicadas = macLanDuplicadasResult.rows.map(row => ({
      value: row.mac_lan,
      count: parseInt(row.count)
    }));

    const macWifiDuplicadasQuery = `
      SELECT "mac_wifi", COUNT(*) as count
      FROM equipos 
      WHERE "mac_wifi" IS NOT NULL AND "mac_wifi" != ''
      GROUP BY "mac_wifi" 
      HAVING COUNT(*) > 1
    `;
    const macWifiDuplicadasResult = await query(macWifiDuplicadasQuery);
    alertas.macWifiDuplicadas = macWifiDuplicadasResult.rows.map(row => ({
      value: row.mac_wifi,
      count: parseInt(row.count)
    }));

    return alertas;

  } catch (error) {
    console.error('Error en getAlertas:', error);
    return {};
  }
};

// Funciones adicionales para completar la migración
const getEquipoById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM equipos WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en getEquipoById:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const crearEquipo = async (req, res) => {
  try {
    const equipoData = req.body;
    const result = await query(
      `INSERT INTO equipos (
        serial, nombre, marca, modelo, tipo, propiedad, 
        estado, piso, mac_lan, mac_wifi, ubicacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *`,
      [
        equipoData.serial, equipoData.nombre, equipoData.marca,
        equipoData.modelo, equipoData.tipo, equipoData.propiedad,
        equipoData.estado || 'Stock', equipoData.piso,
        equipoData.mac_lan, equipoData.mac_wifi, equipoData.ubicacion || 'Stock'
      ]
    );

    // Registrar en historial
    await query(
      'INSERT INTO historial_cambios (serial, accion, detalles) VALUES ($1, $2, $3)',
      [equipoData.serial, 'Creación', 'Equipo creado']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error en crearEquipo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const actualizarEquipo = async (req, res) => {
  try {
    const { id } = req.params;
    const equipoData = req.body;
    
    const result = await query(
      `UPDATE equipos SET 
        serial = $1, nombre = $2, marca = $3, modelo = $4, 
        tipo = $5, propiedad = $6, estado = $7, piso = $8,
        mac_lan = $9, mac_wifi = $10, ubicacion = $11,
        agente = $12, updated_at = CURRENT_TIMESTAMP
      WHERE id = $13 RETURNING *`,
      [
        equipoData.serial, equipoData.nombre, equipoData.marca,
        equipoData.modelo, equipoData.tipo, equipoData.propiedad,
        equipoData.estado, equipoData.piso, equipoData.mac_lan,
        equipoData.mac_wifi, equipoData.ubicacion, equipoData.agente, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    // Registrar en historial
    await query(
      'INSERT INTO historial_cambios (serial, accion, detalles) VALUES ($1, $2, $3)',
      [equipoData.serial, 'Modificación', 'Equipo actualizado']
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en actualizarEquipo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const eliminarEquipo = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener datos antes de eliminar para el historial
    const equipoResult = await query('SELECT serial FROM equipos WHERE id = $1', [id]);
    
    if (equipoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    const serial = equipoResult.rows[0].serial;

    // Eliminar equipo
    await query('DELETE FROM equipos WHERE id = $1', [id]);

    // Registrar en historial
    await query(
      'INSERT INTO historial_cambios (serial, accion, detalles) VALUES ($1, $2, $3)',
      [serial, 'Eliminación', 'Equipo eliminado']
    );

    res.json({ message: 'Equipo eliminado correctamente' });
  } catch (error) {
    console.error('Error en eliminarEquipo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getEquipos,
  getEquipoById,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo,
  getDashboardStats,
  getRecentActivity,
  getConfigurationLists,
  addConfigItem,
  deleteConfigItem,
  renamePiso,
  getAdvancedReport,
  uploadActa,
  reenviarActa: reenviarActaController
}; 
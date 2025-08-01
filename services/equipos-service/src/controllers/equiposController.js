const { query, getClient } = require('../database/connection');
const emailService = require('../services/emailService');
const { validationResult } = require('express-validator');

// Constantes globales (equivalente a G. en Google Apps Script)
const G = {
    HOJA_STOCK: 'Stock',
    HOJA_HISTORIAL: 'Historial',
    HOJA_CONFIG: '_Config',
    COLUMNA_SERIAL: 'Serial',
    COLUMNA_NOMBRE: 'Nombre',
    COLUMNA_ESTADO: 'Estado',
    COLUMNA_AGENTE: 'Agente',
    COLUMNA_PISO: 'Piso',
    COLUMNA_MARCA: 'Marca',
    COLUMNA_PROPIEDAD: 'Propiedad',
    COLUMNA_FECHA_INGRESO: 'Fecha de Ingreso',
    ITEMS_PER_PAGE: 30
};

// Obtener equipos filtrados y paginados
async function getFilteredEquipment(req, res) {
    try {
        const { hoja, pagina = 1, filtros = {}, itemsPorPagina = G.ITEMS_PER_PAGE } = req.query;
        
        let whereClause = '';
        const params = [];
        let paramIndex = 1;

        // Construir filtros
        if (filtros.Estado) {
            whereClause += ` AND e.estado = $${paramIndex}`;
            params.push(filtros.Estado);
            paramIndex++;
        }

        if (filtros.Marca) {
            whereClause += ` AND e.marca = $${paramIndex}`;
            params.push(filtros.Marca);
            paramIndex++;
        }

        if (filtros.Propiedad) {
            whereClause += ` AND e.propiedad = $${paramIndex}`;
            params.push(filtros.Propiedad);
            paramIndex++;
        }

        if (filtros.general) {
            whereClause += ` AND (e.nombre ILIKE $${paramIndex} OR e.serial ILIKE $${paramIndex} OR e.marca ILIKE $${paramIndex})`;
            params.push(`%${filtros.general}%`);
            paramIndex++;
        }

        // Filtro por ubicación
        if (hoja && hoja !== 'All Locations' && hoja !== 'Todas las Ubicaciones') {
            whereClause += ` AND e.ubicacion = $${paramIndex}`;
            params.push(hoja);
            paramIndex++;
        }

        // Contar total de registros
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM equipos e 
            WHERE 1=1 ${whereClause}
        `;
        const countResult = await query(countQuery, params);
        const totalItems = parseInt(countResult.rows[0].total);

        // Calcular paginación
        const totalPaginas = Math.max(1, Math.ceil(totalItems / itemsPorPagina));
        const startIndex = (pagina - 1) * itemsPorPagina;

        // Obtener datos paginados
        const dataQuery = `
            SELECT e.*, u.nombre as agente_nombre_completo
            FROM equipos e
            LEFT JOIN usuarios u ON e.agente_id = u.id
            WHERE 1=1 ${whereClause}
            ORDER BY e.created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        params.push(itemsPorPagina, startIndex);
        
        const dataResult = await query(dataQuery, params);

        res.json({
            datos: dataResult.rows,
            paginaActual: parseInt(pagina),
            totalPaginas: totalPaginas,
            itemsPorPagina: parseInt(itemsPorPagina),
            totalItems: totalItems
        });

    } catch (error) {
        console.error('Error en getFilteredEquipment:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Obtener equipos en stock
async function getStockEquipment(req, res) {
    try {
        const result = await query(`
            SELECT serial, nombre 
            FROM equipos 
            WHERE estado = 'Stock' 
            ORDER BY nombre
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error en getStockEquipment:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Obtener datos del dashboard
async function getDashboardData(req, res) {
    try {
        const statsResult = await query(`
            SELECT 
                COUNT(*) as total_equipos,
                COUNT(CASE WHEN estado = 'Stock' THEN 1 END) as en_stock,
                COUNT(CASE WHEN estado = 'Asignado' THEN 1 END) as asignados,
                COUNT(CASE WHEN estado = 'En Reparación' THEN 1 END) as en_reparacion,
                COUNT(CASE WHEN estado = 'Disponible' THEN 1 END) as disponibles,
                COUNT(DISTINCT agente_id) as total_agentes,
                COUNT(DISTINCT ubicacion) as total_ubicaciones
            FROM equipos
        `);

        const activityResult = await query(`
            SELECT h.fecha, h.serial, h.accion, h.detalles, e.nombre as equipo_nombre
            FROM historial h
            LEFT JOIN equipos e ON h.serial = e.serial
            ORDER BY h.fecha DESC
            LIMIT 10
        `);

        res.json({
            stats: statsResult.rows[0],
            activity: activityResult.rows
        });

    } catch (error) {
        console.error('Error en getDashboardData:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Obtener listas de configuración
async function getConfigurationLists(req, res) {
    try {
        const estadosResult = await query(`
            SELECT valor FROM configuracion 
            WHERE categoria = 'estado' AND activo = true 
            ORDER BY valor
        `);

        const marcasResult = await query(`
            SELECT valor FROM configuracion 
            WHERE categoria = 'marca' AND activo = true 
            ORDER BY valor
        `);

        const pisosResult = await query(`
            SELECT nombre FROM pisos WHERE activo = true ORDER BY nombre
        `);

        const agentesResult = await query(`
            SELECT DISTINCT agente_nombre FROM equipos 
            WHERE agente_nombre IS NOT NULL 
            ORDER BY agente_nombre
        `);

        const propiedadesResult = await query(`
            SELECT DISTINCT propiedad FROM equipos 
            WHERE propiedad IS NOT NULL 
            ORDER BY propiedad
        `);

        res.json({
            estados: estadosResult.rows.map(r => r.valor),
            marcas: marcasResult.rows.map(r => r.valor),
            pisos: pisosResult.rows.map(r => r.nombre),
            agentes: agentesResult.rows.map(r => r.agente_nombre),
            propiedades: propiedadesResult.rows.map(r => r.propiedad)
        });

    } catch (error) {
        console.error('Error en getConfigurationLists:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Obtener historial individual
async function getIndividualHistory(req, res) {
    try {
        const { serial } = req.params;
        
        const result = await query(`
            SELECT fecha, accion, detalles, datos_anteriores, datos_nuevos
            FROM historial 
            WHERE serial = $1 
            ORDER BY fecha DESC
        `, [serial]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error en getIndividualHistory:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Obtener reportes avanzados
async function getAdvancedReportData(req, res) {
    try {
        const { tipo, fechaInicio, fechaFin } = req.query;
        
        let queryStr = '';
        const params = [];

        switch (tipo) {
            case 'asignaciones':
                queryStr = `
                    SELECT e.serial, e.nombre, e.agente_nombre, e.fecha_asignacion
                    FROM equipos e
                    WHERE e.fecha_asignacion BETWEEN $1 AND $2
                    ORDER BY e.fecha_asignacion DESC
                `;
                params.push(fechaInicio, fechaFin);
                break;

            case 'devoluciones':
                queryStr = `
                    SELECT e.serial, e.nombre, e.agente_nombre, e.fecha_devolucion
                    FROM equipos e
                    WHERE e.fecha_devolucion BETWEEN $1 AND $2
                    ORDER BY e.fecha_devolucion DESC
                `;
                params.push(fechaInicio, fechaFin);
                break;

            case 'por_estado':
                queryStr = `
                    SELECT estado, COUNT(*) as cantidad
                    FROM equipos
                    GROUP BY estado
                    ORDER BY cantidad DESC
                `;
                break;

            case 'por_marca':
                queryStr = `
                    SELECT marca, COUNT(*) as cantidad
                    FROM equipos
                    WHERE marca IS NOT NULL
                    GROUP BY marca
                    ORDER BY cantidad DESC
                `;
                break;

            default:
                return res.status(400).json({ error: 'Tipo de reporte no válido' });
        }

        const result = await query(queryStr, params);
        res.json(result.rows);

    } catch (error) {
        console.error('Error en getAdvancedReportData:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Agregar equipo
async function agregarEquipo(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            serial, nombre, marca, modelo, tipo, estado, ubicacion, piso,
            agente_nombre, agente_email, propiedad, observaciones
        } = req.body;

        // Verificar si el serial ya existe
        const existingResult = await query(
            'SELECT id FROM equipos WHERE serial = $1',
            [serial]
        );

        if (existingResult.rows.length > 0) {
            return res.status(400).json({ error: 'El serial ya existe en el sistema' });
        }

        // Insertar nuevo equipo
        const result = await query(`
            INSERT INTO equipos (
                serial, nombre, marca, modelo, tipo, estado, ubicacion, piso,
                agente_nombre, agente_email, propiedad, observaciones
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `, [serial, nombre, marca, modelo, tipo, estado, ubicacion, piso,
            agente_nombre, agente_email, propiedad, observaciones]);

        res.status(201).json({
            success: true,
            message: 'Equipo agregado correctamente',
            equipo: result.rows[0]
        });

    } catch (error) {
        console.error('Error en agregarEquipo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Asignar equipo desde stock
async function assignItemFromStock(req, res) {
    try {
        const { serial, agent, agentId, agentEmail, floor } = req.body;

        if (!serial || !agent || !floor || !agentId || !agentEmail) {
            return res.status(400).json({ 
                success: false, 
                message: "Faltan campos requeridos para la asignación." 
            });
        }

        const client = await getClient();
        
        try {
            await client.query('BEGIN');

            // Verificar que el equipo esté en stock
            const stockResult = await client.query(`
                SELECT * FROM equipos 
                WHERE serial = $1 AND estado = 'Stock'
            `, [serial]);

            if (stockResult.rows.length === 0) {
                throw new Error(`Equipo con serial "${serial}" no encontrado en Stock.`);
            }

            const equipo = stockResult.rows[0];

            // Actualizar equipo
            await client.query(`
                UPDATE equipos 
                SET estado = 'Asignado', agente_nombre = $1, piso = $2, 
                    fecha_asignacion = CURRENT_DATE
                WHERE serial = $3
            `, [agent, floor, serial]);

            // Generar y enviar acta
            await emailService.generarActaYEnviarCorreo({
                serial, agent, agentId, agentEmail, floor
            }, equipo);

            await client.query('COMMIT');

            res.json({
                success: true,
                message: `Equipo ${serial} asignado. Acta de entrega enviada a ${agentEmail}.`
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error en assignItemFromStock:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
}

// Guardar cambios de equipo
async function guardarCambiosEquipo(req, res) {
    try {
        const { id } = req.params;
        const datosNuevos = req.body;

        const result = await query(`
            UPDATE equipos 
            SET nombre = $1, marca = $2, modelo = $3, tipo = $4, estado = $5,
                ubicacion = $6, piso = $7, agente_nombre = $8, agente_email = $9,
                propiedad = $10, observaciones = $11, updated_at = CURRENT_TIMESTAMP
            WHERE id = $12
            RETURNING *
        `, [
            datosNuevos.nombre, datosNuevos.marca, datosNuevos.modelo,
            datosNuevos.tipo, datosNuevos.estado, datosNuevos.ubicacion,
            datosNuevos.piso, datosNuevos.agente_nombre, datosNuevos.agente_email,
            datosNuevos.propiedad, datosNuevos.observaciones, id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }

        res.json({
            success: true,
            message: 'Equipo actualizado correctamente',
            equipo: result.rows[0]
        });

    } catch (error) {
        console.error('Error en guardarCambiosEquipo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Eliminar equipo
async function eliminarEquipo(req, res) {
    try {
        const { id } = req.params;

        const result = await query(`
            DELETE FROM equipos WHERE id = $1 RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }

        res.json({
            success: true,
            message: 'Equipo eliminado correctamente'
        });

    } catch (error) {
        console.error('Error en eliminarEquipo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Reenviar acta
async function reenviarActa(req, res) {
    try {
        const { sheetName, idFila, agentId, agentEmail } = req.body;

        if (!sheetName || !idFila || !agentId || !agentEmail) {
            return res.status(400).json({ 
                success: false, 
                message: "Faltan datos para reenviar el acta." 
            });
        }

        // Obtener datos del equipo
        const equipoResult = await query(`
            SELECT * FROM equipos WHERE id = $1
        `, [idFila]);

        if (equipoResult.rows.length === 0) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }

        const equipo = equipoResult.rows[0];

        // Reenviar acta
        await emailService.reenviarActa(equipo, agentEmail);

        res.json({
            success: true,
            message: `Acta reenviada a ${agentEmail}`
        });

    } catch (error) {
        console.error('Error en reenviarActa:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Subir certificado firmado
async function uploadSignedCertificate(req, res) {
    try {
        const { idFila, sheetName, fileData } = req.body;

        // Aquí implementarías la lógica para guardar el archivo
        // Por ahora solo actualizamos el estado
        await query(`
            UPDATE actas 
            SET estado = 'firmada', archivo_firmado = $1
            WHERE equipo_id = $2
        `, [fileData, idFila]);

        res.json({
            success: true,
            message: 'Certificado subido correctamente'
        });

    } catch (error) {
        console.error('Error en uploadSignedCertificate:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Agregar elemento de configuración
async function addConfigItem(req, res) {
    try {
        const { listName, itemValue } = req.body;

        await query(`
            INSERT INTO configuracion (categoria, valor, descripcion)
            VALUES ($1, $2, $3)
            ON CONFLICT (categoria, valor) DO NOTHING
        `, [listName, itemValue, `Valor agregado a ${listName}`]);

        res.json({
            success: true,
            message: `Elemento agregado a ${listName}`
        });

    } catch (error) {
        console.error('Error en addConfigItem:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Eliminar elemento de configuración
async function deleteConfigItem(req, res) {
    try {
        const { listName, itemValue } = req.body;

        await query(`
            UPDATE configuracion 
            SET activo = false 
            WHERE categoria = $1 AND valor = $2
        `, [listName, itemValue]);

        res.json({
            success: true,
            message: `Elemento eliminado de ${listName}`
        });

    } catch (error) {
        console.error('Error en deleteConfigItem:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Renombrar piso
async function renamePiso(req, res) {
    try {
        const { oldPiso, newPiso } = req.body;

        const client = await getClient();
        
        try {
            await client.query('BEGIN');

            // Actualizar tabla de pisos
            await client.query(`
                UPDATE pisos SET nombre = $1 WHERE nombre = $2
            `, [newPiso, oldPiso]);

            // Actualizar equipos en ese piso
            await client.query(`
                UPDATE equipos SET piso = $1 WHERE piso = $2
            `, [newPiso, oldPiso]);

            await client.query('COMMIT');

            res.json({
                success: true,
                message: `Piso renombrado de "${oldPiso}" a "${newPiso}"`
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error en renamePiso:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = {
    getFilteredEquipment,
    getStockEquipment,
    getDashboardData,
    getConfigurationLists,
    getIndividualHistory,
    getAdvancedReportData,
    agregarEquipo,
    assignItemFromStock,
    guardarCambiosEquipo,
    eliminarEquipo,
    reenviarActa,
    uploadSignedCertificate,
    addConfigItem,
    deleteConfigItem,
    renamePiso
}; 
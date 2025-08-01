const nodemailer = require('nodemailer');

// Configurar transporter de email
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Generar acta de asignación y enviar correo
async function generarActaYEnviarCorreo(assignmentDetails, itemData) {
    try {
        const { serial, agent, agentId, agentEmail, floor } = assignmentDetails;
        
        // Generar contenido del acta
        const actaContent = generarContenidoActa(assignmentDetails, itemData);
        
        // Enviar email
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: agentEmail,
            subject: `Acta de Entrega - Equipo ${serial}`,
            html: actaContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Acta enviada a ${agentEmail} para equipo ${serial}`);

        // Guardar acta en base de datos
        await guardarActaEnBD(assignmentDetails, itemData, 'asignacion');

    } catch (error) {
        console.error('❌ Error al enviar acta:', error);
        throw error;
    }
}

// Generar contenido del acta
function generarContenidoActa(assignmentDetails, itemData) {
    const { serial, agent, floor } = assignmentDetails;
    const fecha = new Date().toLocaleDateString('es-ES');
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Acta de Entrega - Equipo ${serial}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { background-color: #f0f0f0; padding: 20px; text-align: center; }
                .content { margin: 20px 0; }
                .equipment-info { border: 1px solid #ddd; padding: 15px; margin: 15px 0; }
                .signature { margin-top: 30px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>ACTA DE ENTREGA DE EQUIPO</h1>
                <p>Fecha: ${fecha}</p>
            </div>
            
            <div class="content">
                <h2>Información del Equipo</h2>
                <div class="equipment-info">
                    <table>
                        <tr>
                            <th>Serial</th>
                            <td>${serial}</td>
                        </tr>
                        <tr>
                            <th>Nombre</th>
                            <td>${itemData.nombre || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Marca</th>
                            <td>${itemData.marca || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Modelo</th>
                            <td>${itemData.modelo || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Tipo</th>
                            <td>${itemData.tipo || 'N/A'}</td>
                        </tr>
                    </table>
                </div>
                
                <h2>Información de Entrega</h2>
                <div class="equipment-info">
                    <table>
                        <tr>
                            <th>Agente Responsable</th>
                            <td>${agent}</td>
                        </tr>
                        <tr>
                            <th>Piso/Ubicación</th>
                            <td>${floor}</td>
                        </tr>
                        <tr>
                            <th>Fecha de Entrega</th>
                            <td>${fecha}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="signature">
                    <p><strong>Condiciones de Uso:</strong></p>
                    <ul>
                        <li>El equipo debe ser utilizado únicamente para fines laborales</li>
                        <li>El agente es responsable del cuidado y mantenimiento del equipo</li>
                        <li>En caso de daño o pérdida, debe reportarse inmediatamente</li>
                        <li>Al finalizar el uso, el equipo debe ser devuelto en las mismas condiciones</li>
                    </ul>
                    
                    <p><strong>Firma del Agente:</strong></p>
                    <p>_________________________________</p>
                    <p>Nombre: ${agent}</p>
                    <p>Fecha: ${fecha}</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Reenviar acta
async function reenviarActa(equipo, agentEmail) {
    try {
        const actaContent = generarContenidoActa({
            serial: equipo.serial,
            agent: equipo.agente,
            agentEmail: agentEmail,
            floor: equipo.piso
        }, equipo);

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: agentEmail,
            subject: `Acta de Entrega - Equipo ${equipo.serial} (Reenvío)`,
            html: actaContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Acta reenviada a ${agentEmail}`);

    } catch (error) {
        console.error('❌ Error al reenviar acta:', error);
        throw error;
    }
}

// Guardar acta en base de datos
async function guardarActaEnBD(assignmentDetails, itemData, tipo) {
    try {
        const { query } = require('../database/connection');
        
        await query(`
            INSERT INTO actas (
                tipo, equipo_id, serial, agente_nombre, agente_email,
                fecha_entrega, estado
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
            tipo,
            itemData.id,
            assignmentDetails.serial,
            assignmentDetails.agent,
            assignmentDetails.agentEmail,
            new Date(),
            'pendiente'
        ]);

        console.log('✅ Acta guardada en base de datos');

    } catch (error) {
        console.error('❌ Error al guardar acta en BD:', error);
        throw error;
    }
}

module.exports = {
    generarActaYEnviarCorreo,
    reenviarActa,
    guardarActaEnBD
}; 
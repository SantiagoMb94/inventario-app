// ===============================================================
// ARCHIVO: DB.gs (Versión Corregida)
// ROL: Lógica de interacción con la base de datos (Google Sheets).
//      Todas las funciones que leen o escriben directamente en las hojas.
// ===============================================================

/**
 * Lee todas las hojas de inventario (Stock y Pisos) y devuelve una lista unificada de equipos.
 * @return {Array<Object>} Un array con todos los objetos de equipo del inventario.
 */
function getAllInventoryData_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hojas = ss.getSheets();
  let todosLosEquipos = [];
  hojas.forEach(hoja => {
    const nombreHoja = hoja.getName();
    if (nombreHoja === G.HOJA_STOCK || nombreHoja.startsWith("Piso")) {
        const sheetData = getInventoryFromSheet_(hoja);
        todosLosEquipos = todosLosEquipos.concat(sheetData);
    }
  });
  return todosLosEquipos;
}

/**
 * Convierte los datos de una hoja de cálculo en un array de objetos JavaScript.
 * @param {Sheet} sheet La hoja de cálculo de la que se leerán los datos.
 * @return {Array<Object>} Un array de objetos, donde cada objeto representa una fila.
 */
function getInventoryFromSheet_(sheet) {
    const sheetName = sheet.getName();
    const rangoDatos = sheet.getDataRange();
    if (rangoDatos.getNumRows() <= 1) return [];
    
    const allValues = rangoDatos.getValues();
    const cabeceras = allValues.shift(); // Extrae la primera fila (cabeceras)
    
    return allValues.map((fila, index) => {
        let obj = { idFila: index + 2, sheetName: sheetName }; // idFila es el número de fila real en la hoja
        cabeceras.forEach((cabecera, i) => {
          if (cabecera) {
            obj[cabecera] = fila[i];
          }
        });
        return obj;
    });
}

/**
 * Verifica si un serial ya existe en el inventario.
 * @param {string} serial El serial a verificar.
 * @param {string} [originalSerialToIgnore] Opcional. Un serial original para ignorar durante la edición.
 * @return {boolean} True si el serial está duplicado, false en caso contrario.
 */
function isSerialDuplicate_(serial, originalSerialToIgnore) {
    if (!serial) return false;
    const todosLosEquipos = getCachedAllInventoryData_();
    
    return todosLosEquipos.some(equipo => {
      // CORRECCIÓN: Usar G.COLUMNA_SERIAL para acceder a la propiedad.
      const serialActual = String(equipo[G.COLUMNA_SERIAL] || '').toLowerCase();
      const serialBuscado = String(serial).toLowerCase();
      
      if (serialActual !== serialBuscado) {
        return false;
      }
      
      // Si estamos editando, no contamos el serial original como un duplicado
      if (originalSerialToIgnore && serialActual === String(originalSerialToIgnore).toLowerCase()) {
        return false;
      }
      
      return true;
    });
}

/**
 * Registra un cambio en la hoja de Historial.
 * @param {string} action La acción realizada (e.g., 'Creación', 'Modificación').
 * @param {string} serial El serial del equipo afectado.
 * @param {string} details Los detalles del cambio.
 */
function logChange_(action, serial, details) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // CORRECCIÓN: Usar G.HOJA_HISTORIAL
    let historialSheet = ss.getSheetByName(G.HOJA_HISTORIAL);
    if (!historialSheet) {
      // CORRECCIÓN: Usar G.HOJA_HISTORIAL
      historialSheet = ss.insertSheet(G.HOJA_HISTORIAL, 0);
      historialSheet.appendRow(['Fecha', 'Serial', 'Acción', 'Detalles']);
      historialSheet.setColumnWidth(1, 150);
      historialSheet.setColumnWidth(2, 150);
      historialSheet.setColumnWidth(3, 100);
      historialSheet.setColumnWidth(4, 400);
    }
    const timestamp = new Date();
    const newRow = [timestamp, serial || "N/A", action, details];
    
    // Inserta la nueva fila al principio para mantener el historial más reciente arriba.
    historialSheet.insertRowsAfter(1, 1);
    historialSheet.getRange(2, 1, 1, newRow.length).setValues([newRow]);
  } catch (e) {
    console.error("Error al registrar en el historial: " + e.message);
  }
}


// --- FUNCIONES DE UTILIDAD ---

/**
 * Formatea un objeto de fecha a un string legible.
 * @param {Date} date El objeto de fecha a formatear.
 * @return {string} La fecha formateada como string.
 */
function formatDate_(date) {
  if (!date || !(date instanceof Date) || isNaN(date)) {
    return 'Invalid Date';
  }
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "MMM d, yyyy, h:mm a");
}

// ===============================================================
// ARCHIVO: Config.gs (Versión Corregida)
// ROL: Lógica para leer y gestionar los datos de la hoja _Config.
// ===============================================================

/**
 * Obtiene las listas de configuración desde la hoja _Config o las crea si no existen.
 * @return {Object} Un objeto con todas las listas para los dropdowns de la UI.
 */
function getConfigurationLists_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let configSheet = ss.getSheetByName(G.HOJA_CONFIG);
  
  // Si la hoja de configuración no existe, la crea con valores por defecto.
  if (!configSheet) {
    configSheet = ss.insertSheet(G.HOJA_CONFIG);
    configSheet.hideSheet();
    configSheet.getRange("A1:C1").setValues([['Estados', 'Pisos', 'Marcas']]);
    const defaultData = [['Asignado', '7', 'Dell'],['Stock', '10', 'HP'],['Disponible', '12', 'Lenovo'],['En Reparación', '16', 'Apple']];
    configSheet.getRange(2, 1, defaultData.length, defaultData[0].length).setValues(defaultData);
  }
  
  const hojas = ss.getSheets();
  
  // Obtiene todas las ubicaciones (Stock y hojas de Pisos)
  const ubicaciones = hojas.map(hoja => hoja.getName())
                           .filter(nombre => nombre === G.HOJA_STOCK || nombre.startsWith("Piso"))
                           .sort((a, b) => a === G.HOJA_STOCK ? -1 : b === G.HOJA_STOCK ? 1 : a.localeCompare(b, undefined, { numeric: true }));
  
  // Obtiene solo los números/nombres de los pisos
  const pisos = ubicaciones.filter(nombre => nombre !== G.HOJA_STOCK)
                           .map(nombre => nombre.replace("Piso ", "").trim())
                           .filter(String)
                           .sort((a,b) => a.localeCompare(b, undefined, { numeric: true }));

  const lastRow = configSheet.getLastRow();
  if (lastRow < 1) return { estados: [], pisos: [], marcas: [], ubicaciones: [], agentes: [], propiedades: [] };

  // Lee las listas desde la hoja de configuración
  const estados = configSheet.getRange(2, 1, lastRow > 1 ? lastRow - 1 : 1, 1).getValues().flat().filter(String);
  const marcas = configSheet.getRange(2, 3, lastRow > 1 ? lastRow - 1 : 1, 1).getValues().flat().filter(String);
  
  // Obtiene listas dinámicas desde los datos de inventario
  const todosLosEquipos = getCachedAllInventoryData_();
  // CORRECCIÓN: Usa G.COLUMNA_AGENTE para obtener los agentes de forma segura
  const agentes = [...new Set(todosLosEquipos.map(e => e[G.COLUMNA_AGENTE]).filter(String))].sort();
  // CORRECCIÓN: Usa G.COLUMNA_PROPIEDAD para obtener las propiedades
  const propiedades = [...new Set(todosLosEquipos.map(e => e[G.COLUMNA_PROPIEDAD]).filter(String))].sort();


  return { 
      estados: [...new Set(estados)].sort(), 
      pisos: pisos, 
      marcas: [...new Set(marcas)].sort(),
      ubicaciones: ubicaciones,
      agentes: agentes,
      propiedades: propiedades
  };
}

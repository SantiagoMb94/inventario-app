// ===============================================================
// ARCHIVO: Globals.gs (Versión para Actas)
// ROL: Contiene todas las constantes y variables globales.
// ===============================================================

const G = {
  // ID de la plantilla de Google Docs para el acta de entrega
  ID_PLANTILLA_ACTA: "18nOTsU6UWzrZHnQ7F0CIZVFrbBze7wYfRGLs1UBZ9jQ",

  ID_CARPETA_ACTAS_GENERADAS: "1EuFB77nWgqYz8QeoXIUt4i3-iR-n0wK5",
  
  // --- INICIO DE LA MODIFICACIÓN ---
  // ID de la carpeta donde se guardarán las actas firmadas
  ID_CARPETA_ACTAS_FIRMAdAS: "1ZS5WsZKgGFPBBEsvsuD8wkG6VpifQLmx", // <-- REEMPLAZA ESTO CON EL ID DE TU CARPETA
  
  // Constantes de la hoja de cálculo
  COLUMNA_ACTA_FIRMADA: "Acta Firmada",
  // --- FIN DE LA MODIFICACIÓN ---

  COLUMNA_ESTADO: "Estado",
  COLUMNA_PISO: "Piso",
  COLUMNA_NOMBRE: "Nombre del elemento",
  COLUMNA_SERIAL: "Serial",
  COLUMNA_AGENTE: "Agente",
  COLUMNA_PROPIEDAD: "Propiedad",
  COLUMNA_FECHA_INGRESO: "Fecha de Ingreso",
  COLUMNA_MARCA: "Marca",
  COLUMNA_MAC_LAN: "Mac Lan",
  COLUMNA_MAC_WIFI: "Mac Wifi",
  HOJA_STOCK: "Stock",
  HOJA_HISTORIAL: "Historial",
  HOJA_CONFIG: "_Config",
  VALOR_ESTADO_STOCK: "Stock",
  
  // Configuraciones de la aplicación
  ITEMS_PER_PAGE: 30,
  CACHE_EXPIRATION_SECONDS: 300 
};

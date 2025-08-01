// ===============================================================
// ARCHIVO: Cache.gs (Versión Corregida)
// ROL: Gestiona el almacenamiento y la recuperación de datos en caché
//      para mejorar el rendimiento y reducir las llamadas a la hoja de cálculo.
// ===============================================================

/**
 * Limpia claves específicas de la caché. Se llama cuando se modifican los datos.
 */
function clearCache_() {
  const cache = CacheService.getScriptCache();
  // Se mantiene la limpieza de la caché de configuración
  const keysToRemove = ['configuration_lists'];
  cache.removeAll(keysToRemove);
  Logger.log('Cache cleared for keys: ' + keysToRemove.join(', '));
}

/**
 * Obtiene todos los datos del inventario.
 * MODIFICADO: Se elimina la lógica de caché para esta función para evitar el error "Argument too large".
 * @return {Array<Object>} El array de todos los equipos.
 */
function getCachedAllInventoryData_() {
  // Ahora siempre lee directamente de la hoja de cálculo.
  Logger.log('Bypassing cache for all_inventory_data to avoid size limit errors. Reading from Sheets.');
  return getAllInventoryData_(); // Llama directamente a la función en DB.gs
}

/**
 * Obtiene las listas de configuración, usando la caché si está disponible.
 * @return {Object} El objeto con todas las listas de configuración.
 */
function getCachedConfigurationLists_() {
  const cache = CacheService.getScriptCache();
  const cachedKey = 'configuration_lists';
  const cachedData = cache.get(cachedKey);

  if (cachedData != null) {
    Logger.log('Cache HIT for ' + cachedKey);
    return JSON.parse(cachedData);
  }

  Logger.log('Cache MISS for ' + cachedKey + '. Reading from Sheets.');
  const configData = getConfigurationLists_(); // Llama a la función en Config.gs
  try {
    cache.put(cachedKey, JSON.stringify(configData), G.CACHE_EXPIRATION_SECONDS);
  } catch (e) {
    Logger.log('Failed to cache configuration_lists, likely due to size limit. Error: ' + e.toString());
  }
  return configData;
}

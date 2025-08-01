// ===============================================================
// ARCHIVO: Main.gs (Versión Completa con Lógica de Devolución)
// ROL: Punto de entrada principal y toda la lógica de la aplicación web.
// ===============================================================

/**
 * @OnlyCurrentDoc
 * Sirve la página principal de la aplicación web.
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Portal de Inventario')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


// ===============================================================
// SECCIÓN 1: LÓGICA DE ASIGNACIÓN Y GENERACIÓN/ENVÍO DE ACTAS
// ===============================================================

function assignItemFromStock(assignmentDetails) {
  const { serial, agent, agentId, agentEmail, floor } = assignmentDetails;
  if (!serial || !agent || !floor || !agentId || !agentEmail) {
    return { success: false, message: "Missing required fields for assignment." };
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const stockSheet = ss.getSheetByName(G.HOJA_STOCK);
    if (!stockSheet) throw new Error(`Sheet "${G.HOJA_STOCK}" not found.`);

    const stockHeaders = stockSheet.getRange(1, 1, 1, stockSheet.getLastColumn()).getValues()[0];
    const serialColIndex = stockHeaders.indexOf(G.COLUMNA_SERIAL);
    const stockData = stockSheet.getRange(2, 1, stockSheet.getLastRow() - 1, stockSheet.getLastColumn()).getValues();

    let rowIndex = -1;
    let itemData = {};
    for (let i = 0; i < stockData.length; i++) {
      if (stockData[i][serialColIndex] === serial) {
        rowIndex = i + 2;
        stockHeaders.forEach((header, index) => {
          itemData[header] = stockData[i][index];
        });
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Item with serial "${serial}" not found in Stock.`);
    }

    const rowData = stockSheet.getRange(rowIndex, 1, 1, stockHeaders.length).getValues()[0];
    
    rowData[stockHeaders.indexOf(G.COLUMNA_ESTADO)] = "Asignado";
    rowData[stockHeaders.indexOf(G.COLUMNA_AGENTE)] = agent;
    rowData[stockHeaders.indexOf(G.COLUMNA_PISO)] = floor;

    const floorSheetName = `Piso ${floor}`;
    let floorSheet = ss.getSheetByName(floorSheetName);
    if (!floorSheet) {
      floorSheet = ss.insertSheet(floorSheetName);
      floorSheet.getRange(1, 1, 1, stockHeaders.length).setValues([stockHeaders]);
    }
    floorSheet.appendRow(rowData);
    stockSheet.deleteRow(rowIndex);

    logChange_('Assignment', serial, `Assigned to ${agent} on Floor ${floor}.`);
    clearCache_();

    _generarActaYEnviarCorreo(assignmentDetails, itemData);

    return { success: true, message: `Item ${serial} assigned. Delivery certificate sent to ${agentEmail}.` };

  } catch (error) {
    Logger.log(`Error in assignItemFromStock: ${error.toString()}`);
    return { success: false, message: error.message };
  }
}

/**
 * Lógica para reenviar un acta. Es llamada por la función en API.gs.
 * @private
 */
function reenviarActa_(sheetName, idFila, agentId, agentEmail) {
  try {
    if (!sheetName || !idFila || !agentId || !agentEmail) {
      return { success: false, message: "Faltan datos para reenviar el acta." };
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error(`Hoja "${sheetName}" no encontrada.`);

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const values = sheet.getRange(idFila, 1, 1, headers.length).getValues()[0];
    
    const itemData = {};
    headers.forEach((header, index) => {
      itemData[header] = values[index];
    });

    const assignmentDetails = {
      agent: itemData[G.COLUMNA_AGENTE],
      agentId: agentId,
      agentEmail: agentEmail,
      floor: itemData[G.COLUMNA_PISO]
    };

    _generarActaYEnviarCorreo(assignmentDetails, itemData);
    logChange_('Reenvío de Acta', itemData[G.COLUMNA_SERIAL], `Acta reenviada a ${agentEmail}.`);

    return { success: true, message: `Acta para ${itemData[G.COLUMNA_SERIAL]} reenviada a ${agentEmail}.` };
  } catch (e) {
    Logger.log(`Error en reenviarActa_: ${e.toString()}`);
    return { success: false, message: `Error al reenviar el acta: ${e.message}` };
  }
}

/**
 * HELPER: Genera el acta desde una plantilla, la convierte a PDF y la envía por correo.
 * @private
 */
function _generarActaYEnviarCorreo(assignmentDetails, itemData) {
  try {
    const { agent, agentId, agentEmail, floor } = assignmentDetails;
    
    const fechaEnIngles = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const serialCompleto = itemData[G.COLUMNA_SERIAL] || '';
    const ultimosCuatroSerial = serialCompleto.slice(-4);
    const numeroInventario = `Twh-col-${floor}-${ultimosCuatroSerial}`;
    const entregadoPor = "Jose Raul";

    const templateFile = DriveApp.getFileById(G.ID_PLANTILLA_ACTA);
    const destinationFolder = DriveApp.getFolderById(G.ID_CARPETA_ACTAS_GENERADAS);
    
    const newFileName = `Acta de Entrega - ${agent} - ${fechaEnIngles}.pdf`;
    const newFile = templateFile.makeCopy(`${agent} - ${fechaEnIngles}`, destinationFolder);
    
    const doc = DocumentApp.openById(newFile.getId());
    const body = doc.getBody();

    body.replaceText("{{FECHA}}", fechaEnIngles);
    body.replaceText("{{NOMBRE_EMPLEADO}}", agent);
    body.replaceText("{{ID_EMPLEADO}}", agentId);
    body.replaceText("{{NUMERO_INVENTARIO}}", numeroInventario);
    body.replaceText("{{RECIBIDO_POR}}", agent);
    body.replaceText("{{ENTREGADO_POR}}", entregadoPor);
    body.replaceText("{{DESC_EQUIPO}}", itemData[G.COLUMNA_NOMBRE] || 'N/A');
    body.replaceText("{{SERIAL_EQUIPO}}", itemData[G.COLUMNA_SERIAL] || 'N/A');
    body.replaceText("{{MARCA_EQUIPO}}", itemData[G.COLUMNA_MARCA] || 'N/A');
    
    doc.saveAndClose();

    const pdfBlob = newFile.getAs('application/pdf');
    pdfBlob.setName(newFileName);

    MailApp.sendEmail({
      to: agentEmail,
      subject: `Acta de Entrega de Equipo: ${itemData[G.COLUMNA_NOMBRE]}`,
      body: `Hola ${agent},\n\nAdjunto encontrarás el acta de entrega del equipo que te ha sido asignado.\n\nPor favor, revísala, fírmala y devuélvela al departamento de TI.\n\nSaludos,\nEquipo de TI.`,
      attachments: [pdfBlob]
    });

    DriveApp.getFileById(newFile.getId()).setTrashed(true);
    Logger.log(`Acta generada y enviada a ${agentEmail}`);

  } catch (e) {
    Logger.log(`Error al generar o enviar el acta: ${e.toString()}`);
  }
}

/**
 * HELPER: Reenvía un acta existente para solicitar la firma de devolución.
 * @private
 */
function _enviarActaParaDevolucion(returnEmail, itemData) {
    try {
        const actaUrl = itemData[G.COLUMNA_ACTA_FIRMADA];
        if (!actaUrl) {
            Logger.log(`No se encontró acta para reenviar para el serial ${itemData[G.COLUMNA_SERIAL]}`);
            return;
        }

        const fileIdMatch = actaUrl.match(/[-\w]{25,}/);
        if (!fileIdMatch) {
            throw new Error("No se pudo extraer el ID del archivo de la URL del acta.");
        }
        const fileId = fileIdMatch[0];

        const file = DriveApp.getFileById(fileId);
        const agentName = itemData[G.COLUMNA_AGENTE] || 'el agente';

        MailApp.sendEmail({
            to: returnEmail,
            subject: `Pendiente: Firma de Devolución de Equipo - ${itemData[G.COLUMNA_NOMBRE]}`,
            body: `Hola,\n\nSe ha iniciado el proceso de devolución para el equipo ${itemData[G.COLUMNA_NOMBRE]} con serial ${itemData[G.COLUMNA_SERIAL]}, anteriormente asignado a ${agentName}.\n\nAdjunto encontrarás el acta de entrega original. Por favor, imprímela, obtén la firma en la sección de DEVOLUCIÓN y entrégala al departamento de TI para finalizar el proceso.\n\nSaludos,\nEquipo de TI.`,
            attachments: [file.getAs(MimeType.PDF)]
        });

        Logger.log(`Acta de devolución enviada a ${returnEmail} para el serial ${itemData[G.COLUMNA_SERIAL]}`);

    } catch (e) {
        Logger.log(`Error al enviar el acta para devolución: ${e.toString()}`);
    }
}


// ===============================================================
// SECCIÓN 2: FUNCIONES CRUD Y DE DATOS
// ===============================================================

function guardarCambiosEquipo_(hojaOrigenNombre, idFila, datosNuevos, swapInfo, returnInfo, reassignmentInfo) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hojaOrigen = ss.getSheetByName(hojaOrigenNombre);
    if (!hojaOrigen) throw new Error("Source sheet not found.");

    const cabeceras = hojaOrigen.getRange(1, 1, 1, hojaOrigen.getLastColumn()).getValues()[0];
    const valoresOriginales = hojaOrigen.getRange(idFila, 1, 1, cabeceras.length).getValues()[0];
    const itemDataOriginal = {};
    cabeceras.forEach((h, i) => itemDataOriginal[h] = valoresOriginales[i]);

    const serialOriginal = itemDataOriginal[G.COLUMNA_SERIAL];

    // Lógica de reasignación para generar nueva acta
    if (reassignmentInfo && reassignmentInfo.agentEmail) {
      const itemDataParaActa = { ...itemDataOriginal, ...datosNuevos };
      _generarActaYEnviarCorreo(reassignmentInfo, itemDataParaActa);
      logChange_('Re-Assignment', serialOriginal, `Re-assigned to ${reassignmentInfo.agent}. New certificate sent to ${reassignmentInfo.agentEmail}.`);
    }

    if (returnInfo && returnInfo.returnEmail) {
        _enviarActaParaDevolucion(returnInfo.returnEmail, itemDataOriginal);
    }
    
    if (swapInfo && swapInfo.motivoCambio) {
      const agenteOriginal = itemDataOriginal[G.COLUMNA_AGENTE];
      const hojaStock = ss.getSheetByName(G.HOJA_STOCK);
      if (!hojaStock) throw new Error("The Stock sheet does not exist.");

      const filaViejaActualizada = cabeceras.map((cabecera) => {
        if (cabecera === G.COLUMNA_ESTADO) return datosNuevos[G.COLUMNA_ESTADO];
        if (cabecera === G.COLUMNA_AGENTE) return "";
        if (cabecera === G.COLUMNA_PISO) return "";
        return itemDataOriginal[cabecera];
      });
      hojaStock.appendRow(filaViejaActualizada);
      hojaOrigen.deleteRow(idFila);
      logChange_('Return', serialOriginal, `Item returned by ${agenteOriginal}. Reason: ${swapInfo.motivoCambio}. New status: ${datosNuevos[G.COLUMNA_ESTADO]}`);

      if (swapInfo.nuevoEquipoSerial) {
        const cabecerasStock = hojaStock.getRange(1, 1, 1, hojaStock.getLastColumn()).getValues()[0];
        const stockData = hojaStock.getDataRange().getValues();
        let idFilaNuevo = -1;
        let nuevoItemData = {};

        for (let i = 1; i < stockData.length; i++) {
          if (stockData[i][cabecerasStock.indexOf(G.COLUMNA_SERIAL)] === swapInfo.nuevoEquipoSerial) {
            idFilaNuevo = i + 1;
            cabecerasStock.forEach((header, index) => {
              nuevoItemData[header] = stockData[i][index];
            });
            break;
          }
        }
        if (idFilaNuevo === -1) throw new Error(`Replacement item with serial ${swapInfo.nuevoEquipoSerial} not found in Stock.`);
        
        const pisoDestino = hojaOrigen.getName().replace("Piso ", "").trim();
        
        const filaNuevaActualizada = cabecerasStock.map(c => {
          if (c === G.COLUMNA_ESTADO) return "Asignado";
          if (c === G.COLUMNA_AGENTE) return agenteOriginal;
          if (c === G.COLUMNA_PISO) return pisoDestino;
          return nuevoItemData[c];
        });

        hojaOrigen.appendRow(filaNuevaActualizada);
        hojaStock.deleteRow(idFilaNuevo);
        logChange_('Assignment', swapInfo.nuevoEquipoSerial, `Assigned to ${agenteOriginal} as a replacement for ${serialOriginal}.`);

        const nuevaActaDetails = {
          agent: agenteOriginal,
          agentId: swapInfo.agentId,
          agentEmail: swapInfo.agentEmail,
          floor: pisoDestino
        };
        _generarActaYEnviarCorreo(nuevaActaDetails, nuevoItemData);
      }
      clearCache_();
      return { success: true, message: 'Item replacement completed successfully. A new certificate has been sent if applicable.' };
    } else {
      const serialNuevo = datosNuevos[G.COLUMNA_SERIAL];
      if (serialNuevo && serialNuevo !== serialOriginal && isSerialDuplicate_(serialNuevo, serialOriginal)) {
        return { success: false, message: `Error: Serial "${serialNuevo}" already belongs to another item.` };
      }

      let logDetails = [];
      cabeceras.forEach((cabecera, index) => {
        if (cabecera === G.COLUMNA_FECHA_INGRESO) return;
        const valorOriginal = itemDataOriginal[cabecera];
        const valorNuevo = datosNuevos[cabecera];
        if (String(valorOriginal || "") !== String(valorNuevo || "")) {
          if (cabecera === G.COLUMNA_AGENTE) {
            if (!valorOriginal && valorNuevo) {
              logDetails.push(`Assigned to: ${valorNuevo}`);
            } else if (valorOriginal && !valorNuevo) {
              logDetails.push(`Returned by: ${valorOriginal}`);
            } else {
              logDetails.push(`Re-assigned from: ${valorOriginal} to: ${valorNuevo}`);
            }
          } else {
            logDetails.push(`${cabecera}: '${valorOriginal || 'empty'}' -> '${valorNuevo || 'empty'}'`);
          }
        }
      });

      const pisoNuevo = datosNuevos[G.COLUMNA_PISO];
      const estadoNuevo = datosNuevos[G.COLUMNA_ESTADO];
      let hojaDestinoNombre = hojaOrigenNombre;
      let requiereMovimiento = false;

      if ((estadoNuevo === 'Stock' || estadoNuevo === 'Disponible' || estadoNuevo === 'En Reparación' || estadoNuevo === 'De Baja') && hojaOrigenNombre !== G.HOJA_STOCK) {
        requiereMovimiento = true;
        hojaDestinoNombre = G.HOJA_STOCK;
      } else if (pisoNuevo && `Piso ${pisoNuevo}` !== hojaOrigenNombre) {
        requiereMovimiento = true;
        hojaDestinoNombre = `Piso ${pisoNuevo}`;
      }

      const filaActualizada = cabeceras.map(cabecera => 
        datosNuevos[cabecera] !== undefined ? datosNuevos[cabecera] : itemDataOriginal[cabecera]
      );

      if (requiereMovimiento) {
        let hojaDestino = ss.getSheetByName(hojaDestinoNombre);
        if (!hojaDestino) {
          hojaDestino = ss.insertSheet(hojaDestinoNombre);
          hojaDestino.getRange(1, 1, 1, cabeceras.length).setValues([cabeceras]);
        }
        if (hojaDestinoNombre === G.HOJA_STOCK) {
          filaActualizada[cabeceras.indexOf(G.COLUMNA_PISO)] = "";
          filaActualizada[cabeceras.indexOf(G.COLUMNA_AGENTE)] = "";
        }
        hojaDestino.appendRow(filaActualizada);
        hojaOrigen.deleteRow(idFila);
        const logAction = logDetails.length > 0 ? 'Modification & Movement' : 'Movement';
        logChange_(logAction, serialNuevo, `Moved to ${hojaDestinoNombre}. ${logDetails.join('. ')}`);
        clearCache_();
        return { success: true, message: `Item updated and moved.` };
      } else {
        const rangoFila = hojaOrigen.getRange(idFila, 1, 1, hojaOrigen.getLastColumn());
        rangoFila.setValues([filaActualizada]);
        if (logDetails.length > 0) {
          logChange_('Modification', serialNuevo || serialOriginal, logDetails.join('. '));
        }
        clearCache_();
        return { success: true, message: "Item updated." };
      }
    }
  } catch (error) {
    return { success: false, message: `Error while saving: ${error.toString()}` };
  }
}

// (Aquí va el resto de las funciones: agregarEquipo, getFilteredEquipment, getDashboardStats, etc. No cambian)

function agregarEquipo(datosEquipo) {
  try {
    const serial = datosEquipo[G.COLUMNA_SERIAL];
    if (serial && isSerialDuplicate_(serial)) {
        return {success: false, message: `Error: Serial "${serial}" already exists.`};
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hojaDestino = ss.getSheetByName(G.HOJA_STOCK);
    if (!hojaDestino) {
        throw new Error(`The "${G.HOJA_STOCK}" sheet was not found.`);
    }
    
    const cabeceras = hojaDestino.getRange(1, 1, 1, hojaDestino.getLastColumn()).getValues()[0];
    
    datosEquipo[G.COLUMNA_FECHA_INGRESO] = new Date();
    datosEquipo[G.COLUMNA_ESTADO] = G.VALOR_ESTADO_STOCK;
    datosEquipo[G.COLUMNA_AGENTE] = "";
    datosEquipo[G.COLUMNA_PISO] = "";

    const nuevaFila = cabeceras.map(cabecera => datosEquipo[cabecera] || "");
    hojaDestino.appendRow(nuevaFila);
    logChange_('Creation', serial, `Item "${datosEquipo[G.COLUMNA_NOMBRE]}" added to Stock.`);
    clearCache_();
    return { success: true, message: "Item added to Stock successfully." };
  } catch (error) { 
    Logger.log(`Error in agregarEquipo: ${error.toString()}`);
    return { success: false, message: error.message }; 
  }
}

function getFilteredEquipment(request) {
  const { hoja, pagina = 1, filtros = {}, itemsPorPagina = G.ITEMS_PER_PAGE } = request;
  try {
    let allDataObjects;
    if (hoja === 'All Locations' || hoja === 'Todas las Ubicaciones') {
      allDataObjects = getCachedAllInventoryData_();
    } else {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(hoja);
      if (!sheet) throw new Error(`Sheet "${hoja}" not found.`);
      allDataObjects = getInventoryFromSheet_(sheet);
    }
    
    const filteredData = allDataObjects.filter(item => {
        const generalSearch = (filtros.general || '').toLowerCase();
        const estadoFilter = (filtros.Estado || '').toLowerCase();
        const marcaFilter = (filtros.Marca || '').toLowerCase();
        const propiedadFilter = (filtros.Propiedad || '').toLowerCase();
        const matchesEstado = !estadoFilter || (item[G.COLUMNA_ESTADO] || '').toLowerCase() === estadoFilter;
        const matchesMarca = !marcaFilter || (item[G.COLUMNA_MARCA] || '').toLowerCase() === marcaFilter;
        const matchesPropiedad = !propiedadFilter || (item[G.COLUMNA_PROPIEDAD] || '').toLowerCase() === propiedadFilter;
        let matchesGeneral = true;
        if(generalSearch) {
            matchesGeneral = Object.values(item).some(val => String(val).toLowerCase().includes(generalSearch));
        }
        return matchesEstado && matchesMarca && matchesPropiedad && matchesGeneral;
    });

    const totalPaginas = Math.max(1, Math.ceil(filteredData.length / itemsPorPagina));
    const startIndex = (pagina - 1) * itemsPorPagina;
    const datosPaginados = filteredData.slice(startIndex, startIndex + itemsPorPagina);

    const formattedData = datosPaginados.map(item => {
      const newItem = {...item};
      if (newItem[G.COLUMNA_FECHA_INGRESO] && newItem[G.COLUMNA_FECHA_INGRESO] instanceof Date) {
        newItem[G.COLUMNA_FECHA_INGRESO] = newItem[G.COLUMNA_FECHA_INGRESO].toISOString();
      }
      return newItem;
    });

    return {
      datos: formattedData,
      paginaActual: parseInt(pagina),
      totalPaginas: totalPaginas,
      itemsPorPagina: parseInt(itemsPorPagina)
    };
  } catch (error) {
    Logger.log(`Error in getFilteredEquipment: ${error.toString()}`);
    return { error: `An unexpected server error occurred: ${error.message}` };
  }
}

function getStockEquipment() {
  try {
    const stockSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(G.HOJA_STOCK);
    if (!stockSheet || stockSheet.getLastRow() < 2) return [];
    const data = getInventoryFromSheet_(stockSheet); 
    return data.map(item => ({
      serial: item[G.COLUMNA_SERIAL],
      nombre: item[G.COLUMNA_NOMBRE]
    }));
  } catch (e) {
    Logger.log(`Error in getStockEquipment: ${e.toString()}`);
    return [];
  }
}

function getDashboardStats() {
  const todosLosEquipos = getCachedAllInventoryData_();
  
  const _findDuplicates = (items, columnName) => {
    if (!columnName) return [];
    const counts = items.reduce((acc, item) => {
      const value = item[columnName];
      if (value && String(value).trim() !== '') {
        acc[value] = (acc[value] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(counts)
      .filter(([value, count]) => count > 1)
      .map(([value, count]) => ({ value, count }));
  };

  const totalEquipos = todosLosEquipos.length;
  const totalStock = todosLosEquipos.filter(e => e[G.COLUMNA_ESTADO] === G.VALOR_ESTADO_STOCK).length;
  const totalAsignados = todosLosEquipos.filter(e => e[G.COLUMNA_ESTADO] === 'Asignado').length;

  const equiposSinSerial = todosLosEquipos
    .filter(e => !e[G.COLUMNA_SERIAL])
    .map(e => ({
      nombre: e[G.COLUMNA_NOMBRE] || 'Item sin nombre',
      ubicacion: e.sheetName || 'Ubicación no definida',
      idFila: e.idFila
    }));

  const serialesDuplicados = _findDuplicates(todosLosEquipos, G.COLUMNA_SERIAL);
  const macLanDuplicadas = _findDuplicates(todosLosEquipos, G.COLUMNA_MAC_LAN);
  const macWifiDuplicadas = _findDuplicates(todosLosEquipos, G.COLUMNA_MAC_WIFI);

  const equiposPorUbicacion = [['Location', 'Quantity']];
  const conteoUbicacion = todosLosEquipos.reduce((acc, equipo) => {
    let ubicacion = equipo.sheetName || 'Undefined';
    acc[ubicacion] = (acc[ubicacion] || 0) + 1;
    return acc;
  }, {});
  Object.keys(conteoUbicacion).sort().forEach(key => equiposPorUbicacion.push([key, conteoUbicacion[key]]));

  const equiposPorEstado = [['Status', 'Quantity']];
  const conteoEstado = todosLosEquipos.reduce((acc, equipo) => {
    let estado = equipo[G.COLUMNA_ESTADO] || 'No Status';
    acc[estado] = (acc[estado] || 0) + 1;
    return acc;
  }, {});
  Object.keys(conteoEstado).sort().forEach(key => equiposPorEstado.push([key, conteoEstado[key]]));

  return {
    totalEquipos,
    totalStock,
    totalAsignados,
    equiposPorUbicacion,
    equiposPorEstado,
    alertas: {
      equiposSinSerial,
      serialesDuplicados,
      macLanDuplicadas,
      macWifiDuplicadas
    }
  };
}

function getRecentActivity() {
  const historialSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(G.HOJA_HISTORIAL);
  if (!historialSheet || historialSheet.getLastRow() < 2) {
    return [];
  }

  const numRowsToFetch = Math.min(5, historialSheet.getLastRow() - 1);
  if (numRowsToFetch < 1) {
    return [];
  }

  const recentActivities = historialSheet.getRange(2, 1, numRowsToFetch, 4).getValues();

  return recentActivities.map(row => {
    const newRow = [...row];
    newRow[0] = formatDate_(newRow[0]);
    return newRow;
  });
}

function getIndividualHistory(serial) {
  if (!serial) return [];
  const historialSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(G.HOJA_HISTORIAL);
  if (!historialSheet || historialSheet.getLastRow() < 2) return [];
  const allHistory = historialSheet.getRange(2, 1, historialSheet.getLastRow() - 1, 4).getValues();
  
  const filteredHistory = allHistory.filter(row => {
    const historySerial = String(row[1]).trim().toLowerCase();
    const searchSerial = String(serial).trim().toLowerCase();
    return historySerial === searchSerial;
  });

  const formattedHistory = filteredHistory.map(row => {
    const newRow = [...row];
    newRow[0] = formatDate_(newRow[0]);
    return newRow;
  });
  
  return formattedHistory.reverse();
}

function getAdvancedReportData(request) {
  const { filterType, filterValues } = request;
  if (!filterType || !filterValues || !filterValues.length) {
    return { error: 'A filter type and at least one value are required.' };
  }

  try {
    const allData = getCachedAllInventoryData_();
    const lowercasedFilterValues = filterValues.map(v => String(v).toLowerCase());
    
    const results = allData.filter(item => {
      if (filterType === 'Piso') {
        const itemFloor = (item['sheetName'] || '').replace("Piso ", "").trim().toLowerCase();
        return lowercasedFilterValues.includes(itemFloor);
      }
      const itemValue = item[filterType] ? String(item[filterType]).toLowerCase() : '';
      return lowercasedFilterValues.includes(itemValue);
    });

    const formattedResults = results.map(item => {
      const newItem = {...item};
      if (newItem[G.COLUMNA_FECHA_INGRESO] && newItem[G.COLUMNA_FECHA_INGRESO] instanceof Date) {
        newItem[G.COLUMNA_FECHA_INGRESO] = newItem[G.COLUMNA_FECHA_INGRESO].toISOString();
      }
      return newItem;
    });

    const stats = {
        total: formattedResults.length,
        asignado: formattedResults.filter(r => r.Estado === 'Asignado').length,
        stock: formattedResults.filter(r => r.Estado === 'Stock').length,
        disponible: formattedResults.filter(r => r.Estado === 'Disponible').length,
        reparacion: formattedResults.filter(r => r.Estado === 'En Reparación').length,
    };

    return { results: formattedResults, stats };
  } catch (e) {
    Logger.log(`Error in getAdvancedReportData: ${e.toString()}`);
    return { error: `An unexpected server error occurred: ${e.message}` };
  }
}

// CÓDIGO DE GOOGLE APPS SCRIPT (BACKEND)
// Copia y pega esto en: Extensiones > Apps Script

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const rawData = e.postData.contents;
    const json = JSON.parse(rawData);
    const data = json.data;
    
    // 1. Guardar Sedes
    saveSheet(doc, 'Campuses', ['Nombre Sede'], data.campuses ? data.campuses.map(c => [c]) : []);

    // 2. Guardar Unidades
    const unitRows = data.units ? data.units.map(u => [
      u.id, u.campus, u.name, u.type, u.status, JSON.stringify(u)
    ]) : [];
    saveSheet(doc, 'Units', ['ID', 'Sede', 'Nombre', 'Tipo', 'Estado', 'JSON_DATA'], unitRows);

    // 3. Guardar Herramientas
    const toolRows = data.tools ? data.tools.map(t => [
      t.id, t.name, t.status, t.assignedTo || '', t.assignedDate || '', JSON.stringify(t)
    ]) : [];
    saveSheet(doc, 'Tools', ['ID', 'Nombre', 'Estado', 'Asignado A', 'Fecha', 'JSON_DATA'], toolRows);

    // 4. Guardar Almacén
    const whRows = data.warehouse ? data.warehouse.map(w => [
      w.id, w.name, w.category, w.quantity, w.unit, JSON.stringify(w)
    ]) : [];
    saveSheet(doc, 'Warehouse', ['ID', 'Nombre', 'Categoría', 'Cantidad', 'Unidad', 'JSON_DATA'], whRows);

    // 5. Guardar Auth (Contraseñas)
    const authRows = data.auth ? Object.entries(data.auth).map(([role, pass]) => [role, pass]) : [];
    saveSheet(doc, 'Auth', ['Rol', 'Password'], authRows);

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Datos y seguridad guardados en la nube.' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    
    // Leer Campuses
    const sheetCampuses = doc.getSheetByName('Campuses');
    const campuses = sheetCampuses ? getColumnData(sheetCampuses, 1) : [];
    
    // Leer Units
    const sheetUnits = doc.getSheetByName('Units');
    const units = sheetUnits ? getJsonColumnData(sheetUnits, 6) : [];
    
    // Leer Tools
    const sheetTools = doc.getSheetByName('Tools');
    const tools = sheetTools ? getJsonColumnData(sheetTools, 6) : [];
    
    // Leer Warehouse
    const sheetWarehouse = doc.getSheetByName('Warehouse');
    const warehouse = sheetWarehouse ? getJsonColumnData(sheetWarehouse, 6) : [];

    // Leer Auth (Contraseñas)
    const sheetAuth = doc.getSheetByName('Auth');
    const authData = {};
    if (sheetAuth && sheetAuth.getLastRow() > 1) {
       const rows = sheetAuth.getRange(2, 1, sheetAuth.getLastRow() - 1, 2).getValues();
       rows.forEach(r => { if(r[0]) authData[r[0]] = r[1]; });
    }

    const response = {
      status: 'success',
      data: {
        campuses: campuses,
        units: units,
        tools: tools,
        warehouse: warehouse,
        auth: authData
      }
    };

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (e) {
     return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function saveSheet(doc, sheetName, headers, rows) {
  let sheet = doc.getSheetByName(sheetName);
  if (!sheet) { sheet = doc.insertSheet(sheetName); }
  sheet.clear();
  sheet.appendRow(headers);
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
}

function getColumnData(sheet, colIndex) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const values = sheet.getRange(2, colIndex, lastRow - 1, 1).getValues();
  return values.flat().filter(v => v !== '');
}

function getJsonColumnData(sheet, colIndex) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const values = sheet.getRange(2, colIndex, lastRow - 1, 1).getValues();
  return values.flat().filter(v => v !== '').map(jsonStr => {
    try { return JSON.parse(jsonStr); } catch(e) { return null; }
  }).filter(obj => obj !== null);
}
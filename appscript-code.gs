const SPREADSHEET_ID = '12YfPNcYea4gtWu8tO4WwNcdMXzENvwttygcZ57UG4KU';
const FOLDER_ID = '1JbLoJCROnVhzveF9HCKQFt030tojx8bp';

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getSuratMasuk') {
    return ContentService.createTextOutput(JSON.stringify(getSuratMasuk())).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'getDisposisi') {
    return ContentService.createTextOutput(JSON.stringify(getDisposisi())).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Action not found' })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'addSuratMasuk') {
      return ContentService.createTextOutput(JSON.stringify(addSuratMasuk(data.payload))).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'addDisposisi') {
      return ContentService.createTextOutput(JSON.stringify(addDisposisi(data.payload))).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Action not found' })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getSuratMasuk() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Surat_Masuk');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const result = [];
  
  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    result.push(obj);
  }
  return result;
}

function addSuratMasuk(payload) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Surat_Masuk');
  
  let fileUrl = "";
  if (payload.fileData && payload.fileName) {
    fileUrl = uploadFileToDrive(payload.fileName, payload.fileData, payload.mimeType);
  }
  
  const newRow = [
    payload.id,
    payload.nomorSurat,
    payload.tanggalSurat,
    new Date().toISOString(),
    payload.pengirim,
    payload.perihal,
    payload.sifat,
    payload.kategori,
    payload.status,
    fileUrl,
    payload.currentHandlerRole,
    new Date().toISOString()
  ];
  
  sheet.appendRow(newRow);
  return { status: 'success', data: newRow };
}

function getDisposisi() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Disposisi');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const result = [];
  
  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    result.push(obj);
  }
  return result;
}

function addDisposisi(payload) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Disposisi');
  
  let fileUrl = "";
  if (payload.fileData && payload.fileName) {
    fileUrl = uploadFileToDrive(payload.fileName, payload.fileData, payload.mimeType);
  }
  
  const newRow = [
    payload.id,
    payload.suratId,
    payload.dariUser,
    payload.keUser,
    payload.instruksi,
    payload.catatanTambahan,
    new Date().toISOString(),
    payload.statusAksi,
    fileUrl
  ];
  
  sheet.appendRow(newRow);
  
  // Update status surat masuk
  updateSuratMasukStatus(payload.suratId, payload.statusSuratBaru, payload.keUserRoleBaru);
  
  return { status: 'success', data: newRow };
}

function updateSuratMasukStatus(suratId, newStatus, newHandlerRole) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Surat_Masuk');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === suratId) {
      sheet.getRange(i + 1, 9).setValue(newStatus); // Kolom Status (I)
      sheet.getRange(i + 1, 11).setValue(newHandlerRole); // Kolom Handler Role (K)
      sheet.getRange(i + 1, 12).setValue(new Date().toISOString()); // Kolom Last Action Date (L)
      break;
    }
  }
}

function uploadFileToDrive(fileName, base64Data, mimeType) {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const data = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(data, mimeType, fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

// SETUP FUNCTION TO CREATE HEADERS
function setupSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  let sheetMasuk = ss.getSheetByName('Surat_Masuk');
  if (!sheetMasuk) {
    sheetMasuk = ss.insertSheet('Surat_Masuk');
    sheetMasuk.appendRow(['id', 'nomorSurat', 'tanggalSurat', 'tanggalDiterima', 'pengirim', 'perihal', 'sifat', 'kategori', 'status', 'lampiranUrl', 'currentHandlerRole', 'lastActionDate']);
  }
  
  let sheetDisposisi = ss.getSheetByName('Disposisi');
  if (!sheetDisposisi) {
    sheetDisposisi = ss.insertSheet('Disposisi');
    sheetDisposisi.appendRow(['id', 'suratId', 'dariUser', 'keUser', 'instruksi', 'catatanTambahan', 'timestamp', 'statusAksi', 'buktiSerahTerimaUrl']);
  }
  
  let sheetKeluar = ss.getSheetByName('Surat_Keluar');
  if (!sheetKeluar) {
    sheetKeluar = ss.insertSheet('Surat_Keluar');
    sheetKeluar.appendRow(['id', 'suratMasukId', 'nomorSurat', 'perihal', 'status', 'draftUrl']);
  }
}

// Tambahkan kode untuk mengizinkan request OPTIONS untuk CORS
function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(headers);
}

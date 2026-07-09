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

  if (action === 'getSuratKeluar') {
    return ContentService.createTextOutput(JSON.stringify(getSuratKeluar())).setMimeType(ContentService.MimeType.JSON);
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

    if (action === 'addSuratKeluar') {
      return ContentService.createTextOutput(JSON.stringify(addSuratKeluar(data.payload))).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Action not found' })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function setupSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  let sheetSurat = ss.getSheetByName('Surat_Masuk');
  if (!sheetSurat) {
    sheetSurat = ss.insertSheet('Surat_Masuk');
    sheetSurat.appendRow(['id', 'nomorSurat', 'tanggalSurat', 'tanggalDiterima', 'pengirim', 'perihal', 'sifat', 'kategori', 'status', 'lampiranUrl', 'currentHandlerRole', 'lastActionDate']);
  }
  
  let sheetDisposisi = ss.getSheetByName('Disposisi');
  if (!sheetDisposisi) {
    sheetDisposisi = ss.insertSheet('Disposisi');
    sheetDisposisi.appendRow(['id', 'suratId', 'dariUser', 'keUser', 'instruksi', 'catatanTambahan', 'timestamp', 'statusAksi', 'lampiranUrl']);
  }

  let sheetKeluar = ss.getSheetByName('Surat_Keluar');
  if (!sheetKeluar) {
    sheetKeluar = ss.insertSheet('Surat_Keluar');
    sheetKeluar.appendRow(['id', 'suratMasukId', 'nomorSurat', 'perihal', 'status', 'draftUrl']);
  }
}

function uploadFileToDrive(fileName, base64Data, mimeType) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const decodedFile = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decodedFile, mimeType, fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (e) {
    return "";
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
      if (header === 'dariUser' || header === 'keUser') {
        try {
          obj[header] = JSON.parse(row[index]);
        } catch(e) {
          obj[header] = null;
        }
      } else {
        obj[header] = row[index];
      }
    });
    result.push(obj);
  }
  return result;
}

function getSuratKeluar() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Surat_Keluar');
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

function addDisposisi(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const dispSheet = ss.getSheetByName('Disposisi');
  const suratSheet = ss.getSheetByName('Surat_Masuk');
  
  let fileUrl = "";
  if (payload.fileData && payload.fileName) {
    fileUrl = uploadFileToDrive(payload.fileName, payload.fileData, payload.mimeType);
  }
  
  const newDispRow = [
    payload.id,
    payload.suratId,
    JSON.stringify(payload.dariUser),
    payload.keUser ? JSON.stringify(payload.keUser) : "",
    payload.instruksi,
    payload.catatanTambahan || "",
    payload.timestamp,
    payload.statusAksi,
    fileUrl
  ];
  dispSheet.appendRow(newDispRow);
  
  // Update status di Surat_Masuk
  const data = suratSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.suratId) {
      suratSheet.getRange(i + 1, 9).setValue(payload.statusSuratBaru); 
      suratSheet.getRange(i + 1, 11).setValue(payload.keUserRoleBaru);
      suratSheet.getRange(i + 1, 12).setValue(payload.timestamp);
      break;
    }
  }
  
  return { status: 'success' };
}

function addSuratKeluar(payload) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Surat_Keluar');
  
  let fileUrl = "";
  if (payload.fileData && payload.fileName) {
    fileUrl = uploadFileToDrive(payload.fileName, payload.fileData, payload.mimeType);
  }
  
  const newRow = [
    payload.id,
    payload.suratMasukId || '',
    payload.nomorSurat,
    payload.perihal,
    payload.status || 'DRAFT',
    fileUrl
  ];
  
  sheet.appendRow(newRow);
  return { status: 'success', data: newRow };
}

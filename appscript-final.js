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
  
  let sheetSurat = ss.getSheetByName('SURAT MASUK (Master Data)');
  if (!sheetSurat) {
    sheetSurat = ss.insertSheet('SURAT MASUK (Master Data)');
    sheetSurat.appendRow(['ID Surat', 'Nomor Surat', 'Tanggal Diterima', 'Pengirim', 'Perihal', 'Sifat', 'Status Terakhir', 'Posisi Surat Saat Ini', 'Link File Surat', 'Tanggal Surat', 'Kategori Surat', 'Last Action Date']);
  }
  
  let sheetDisposisi = ss.getSheetByName('RIWAYAT DISPOSISI (Tracking)');
  if (!sheetDisposisi) {
    sheetDisposisi = ss.insertSheet('RIWAYAT DISPOSISI (Tracking)');
    sheetDisposisi.appendRow(['ID Disposisi', 'ID Surat', 'Waktu Disposisi', 'Dari', 'Ke', 'Instruksi / Catatan', 'Link Bukti Serah Terima Fisik', 'Link Draft Balasan']);
  }

  let sheetKeluar = ss.getSheetByName('SURAT KELUAR');
  if (!sheetKeluar) {
    sheetKeluar = ss.insertSheet('SURAT KELUAR');
    sheetKeluar.appendRow(['ID', 'ID Surat Masuk', 'Nomor Surat', 'Perihal', 'Status', 'Link Draft']);
  }
}

function uploadFileToDrive(fileName, base64Data, mimeType) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const decodedFile = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decodedFile, mimeType, fileName);
    const file = folder.createFile(blob);
    
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (sharingError) {
      // Ignore sharing error if domain restricts public sharing
    }
    
    return file.getUrl();
  } catch (e) {
    return "ERROR: " + e.toString();
  }
}

function getSuratMasuk() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('SURAT MASUK (Master Data)');
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const result = [];
  
  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    result.push({
      id: row[0] || '',
      nomorSurat: row[1] || '',
      tanggalDiterima: row[2] || '',
      pengirim: row[3] || '',
      perihal: row[4] || '',
      sifat: row[5] || '',
      status: row[6] || '',
      currentHandlerRole: row[7] || '',
      lampiranUrl: row[8] || '',
      tanggalSurat: row[9] || row[2], // fallback to received date if empty
      kategori: row[10] || 'Umum',
      lastActionDate: row[11] || new Date().toISOString()
    });
  }
  return result;
}

function addSuratMasuk(payload) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('SURAT MASUK (Master Data)');
  
  let fileUrl = "";
  if (payload.fileData && payload.fileName) {
    fileUrl = uploadFileToDrive(payload.fileName, payload.fileData, payload.mimeType);
  }
  
  const newRow = [
    payload.id,
    payload.nomorSurat,
    new Date().toISOString(), // Tanggal Diterima
    payload.pengirim,
    payload.perihal,
    payload.sifat,
    payload.status, // Status Terakhir
    payload.currentHandlerRole, // Posisi Surat Saat Ini
    fileUrl,
    payload.tanggalSurat,
    payload.kategori,
    new Date().toISOString() // Last Action Date
  ];
  
  sheet.appendRow(newRow);
  return { status: 'success', data: newRow };
}

function getDisposisi() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('RIWAYAT DISPOSISI (Tracking)');
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const result = [];
  
  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    
    let dariUser = null;
    let keUser = null;
    
    try {
      if(row[3]) dariUser = JSON.parse(row[3]);
    } catch(e) {}
    
    try {
      if(row[4]) keUser = JSON.parse(row[4]);
    } catch(e) {}

    result.push({
      id: row[0],
      suratId: row[1],
      timestamp: row[2],
      dariUser: dariUser,
      keUser: keUser,
      instruksi: row[5],
      lampiranUrl: row[6],
      statusAksi: row[8] || 'Disposisi'
    });
  }
  return result;
}

function addDisposisi(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const dispSheet = ss.getSheetByName('RIWAYAT DISPOSISI (Tracking)');
  const suratSheet = ss.getSheetByName('SURAT MASUK (Master Data)');
  
  let fileUrl = "";
  if (payload.fileData && payload.fileName) {
    fileUrl = uploadFileToDrive(payload.fileName, payload.fileData, payload.mimeType);
  }
  
  const newDispRow = [
    payload.id,
    payload.suratId,
    payload.timestamp,
    JSON.stringify(payload.dariUser),
    payload.keUser ? JSON.stringify(payload.keUser) : "",
    payload.instruksi + (payload.catatanTambahan ? "\n" + payload.catatanTambahan : ""),
    fileUrl,
    "", // Link Draft Balasan
    payload.statusAksi // Kolom 9: Status Aksi
  ];

  dispSheet.appendRow(newDispRow);
  
  // Update status di SURAT MASUK (Master Data)
  const data = suratSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.suratId) {
      suratSheet.getRange(i + 1, 7).setValue(payload.statusSuratBaru); // Status Terakhir
      suratSheet.getRange(i + 1, 8).setValue(payload.keUserRoleBaru); // Posisi Surat Saat Ini
      suratSheet.getRange(i + 1, 12).setValue(payload.timestamp); // Last Action Date
      break;
    }
  }
  
  return { status: 'success' };
}

function getSuratKeluar() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('SURAT KELUAR');
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

function addSuratKeluar(payload) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('SURAT KELUAR');
  
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

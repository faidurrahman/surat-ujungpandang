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

// ... (other functions remain the same)
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

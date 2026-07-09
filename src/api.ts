export const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxAojRGY6z0OzpWjxD3yVgWzn2ePweON-5r_pe5vbl0V9NyX3yE94s3cC1EzeoE_mTDaA/exec';

export async function fetchSuratMasuk() {
  try {
    const response = await fetch(`${APP_SCRIPT_URL}?action=getSuratMasuk`);
    const text = await response.text();
    console.log("Raw response from getSuratMasuk:", text);
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to fetch Surat Masuk:", e);
    return [];
  }
}

export async function fetchDisposisi() {
  try {
    const response = await fetch(`${APP_SCRIPT_URL}?action=getDisposisi`);
    const text = await response.text();
    console.log("Raw response from getDisposisi:", text);
    const data = JSON.parse(text);
    
    // Auto-fix if the deployed script returns broken data due to column mismatches
    return data.map((row: any) => {
      // If it uses the proper keys already (e.g. they updated their app script to the new one)
      if (row.suratId !== undefined && (!row.timestamp || !row.timestamp.includes || !row.timestamp.includes('{"id"'))) {
         return row;
      }
      
      // If it's the broken format from their old app script reading new headers:
      if (row['ID Disposisi'] !== undefined) {
        let parsedDari = null;
        let parsedKe = null;
        try { parsedDari = JSON.parse(row['Waktu Disposisi'] || '{}'); } catch (e) {}
        try { parsedKe = JSON.parse(row['Dari'] || '{}'); } catch (e) {}
        
        return {
          id: row['ID Disposisi'],
          suratId: row['ID Surat'],
          timestamp: row['Link Bukti Serah Terima Fisik'] || new Date().toISOString(),
          dariUser: parsedDari,
          keUser: parsedKe,
          instruksi: row['Ke'] || row['Instruksi / Catatan'] || '',
          statusAksi: row['Link Draft Balasan'] || 'Disposisi',
          lampiranUrl: ''
        };
      }
      
      // If it's the new app script but old data shifted:
      if (row.timestamp && typeof row.timestamp === 'string' && row.timestamp.includes('{"id"')) {
        let parsedDari = null;
        let parsedKe = null;
        try { parsedDari = JSON.parse(row.timestamp); } catch (e) {}
        try { parsedKe = JSON.parse(row.dariUser || '{}'); } catch (e) {}
        
        return {
          id: row.id,
          suratId: row.suratId,
          timestamp: row.lampiranUrl || new Date().toISOString(), 
          dariUser: parsedDari,
          keUser: parsedKe,
          instruksi: typeof row.keUser === 'string' ? row.keUser : (row.instruksi || ''),
          statusAksi: 'Disposisi',
          lampiranUrl: '' 
        };
      }
      return row;
    });
  } catch (e) {
    console.error("Failed to fetch Disposisi:", e);
    return [];
  }
}

export async function fetchSuratKeluar() {
  try {
    const response = await fetch(`${APP_SCRIPT_URL}?action=getSuratKeluar`);
    const text = await response.text();
    console.log("Raw response from getSuratKeluar:", text);
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to fetch Surat Keluar:", e);
    return [];
  }
}

export async function addSuratMasuk(payload: any) {
  const response = await fetch(APP_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      action: 'addSuratMasuk',
      payload
    }),
  });
  return response.json();
}

export async function addDisposisi(payload: any) {
  try {
    const response = await fetch(APP_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'addDisposisi',
        payload
      }),
    });
    
    const resultText = await response.text();
    console.log("Raw response from addDisposisi:", resultText);
    
    try {
      const data = JSON.parse(resultText);
      if (data.status === 'error') {
        throw new Error(data.message || 'Unknown error from server');
      }
      return data;
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      throw new Error("Invalid response format from server");
    }
  } catch (error) {
    console.error("Error in addDisposisi:", error);
    throw error;
  }
}

export async function addSuratKeluar(payload: any) {
  const response = await fetch(APP_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      action: 'addSuratKeluar',
      payload
    }),
  });
  return response.json();
}

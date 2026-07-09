import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { LetterList } from './components/LetterList';
import { LetterDetail } from './components/LetterDetail';
import { DashboardTracking } from './components/DashboardTracking';
import { AddLetterModal } from './components/AddLetterModal';
import { mockSuratMasuk, mockDisposisi, currentUser, users } from './mockData';
import { AddSuratKeluarModal } from './components/AddSuratKeluarModal';
import { SuratMasuk, Disposisi, SuratKeluar } from './types';
import { fetchSuratMasuk, fetchDisposisi, fetchSuratKeluar, addSuratMasuk, addDisposisi, addSuratKeluar } from './api';
import { SuratKeluarList } from './components/SuratKeluarList';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddKeluarModalOpen, setIsAddKeluarModalOpen] = useState(false);
  const [suratList, setSuratList] = useState<SuratMasuk[]>([]);
  const [disposisiList, setDisposisiList] = useState<Disposisi[]>([]);
  const [suratKeluarList, setSuratKeluarList] = useState<SuratKeluar[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [suratRes, dispRes, keluarRes] = await Promise.all([
        fetchSuratMasuk(),
        fetchDisposisi(),
        fetchSuratKeluar()
      ]);
      
      console.log("Loaded Surat Masuk:", suratRes);
      
      if (Array.isArray(suratRes)) {
        setSuratList(suratRes);
      } else {
        console.error("suratRes is not an array:", suratRes);
        if (suratRes && (suratRes as any).status === 'error') {
            alert(`Error fetching surat: ${(suratRes as any).message}`);
        }
      }

      if (Array.isArray(dispRes)) {
        setDisposisiList(dispRes);
      }

      if (Array.isArray(keluarRes)) {
        setSuratKeluarList(keluarRes);
      }
    } catch (error) {
      console.error("Gagal memuat data dari Spreadsheet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Derive state based on selection
  const selectedLetter = suratList.find(s => s.id === selectedLetterId) || null;
  const disposisiHistory = selectedLetter 
    ? disposisiList.filter(d => d.suratId === selectedLetter.id).sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime())
    : [];

  const handleSelectSurat = (id: string) => {
    setSelectedLetterId(id);
    setActiveTab('masuk');
  };

  const handleSaveSuratKeluar = async (data: any) => {
    try {
      setIsLoading(true);
      const payload = {
        id: `OUT-${Date.now()}`,
        suratMasukId: '',
        nomorSurat: data.nomorSurat || '',
        tanggalDraft: data.tanggalDraft,
        perihal: data.perihal,
        status: data.status || 'DRAFT',
        fileName: data.file ? data.file.name : '',
        mimeType: data.file ? data.file.type : '',
        fileData: data.fileData || ''
      };
      
      const newSuratKeluar: SuratKeluar = {
        id: payload.id,
        suratMasukId: payload.suratMasukId,
        nomorSurat: payload.nomorSurat,
        tanggalDraft: payload.tanggalDraft,
        perihal: payload.perihal,
        status: payload.status as any,
        draftUrl: '',
      };
      setSuratKeluarList([newSuratKeluar, ...suratKeluarList]);
      
      const response = await addSuratKeluar(payload);
      if (response && response.status === 'success') {
        loadData();
      }
    } catch (error) {
      console.error("Failed to add surat keluar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSurat = async (data: any) => {
    try {
      setIsLoading(true);
      const payload = {
        id: `SRT-${Date.now()}`,
        nomorSurat: data.nomorSurat,
        tanggalSurat: data.tanggalSurat,
        pengirim: data.pengirim,
        perihal: data.perihal,
        sifat: data.sifat,
        kategori: data.kategori,
        status: 'DITERIMA_FO',
        currentHandlerRole: 'ADMIN',
        fileName: data.file ? data.file.name : '',
        mimeType: data.file ? data.file.type : '',
        fileData: data.fileData || ''
      };
      
      // Update UI Optimistically
      const newSurat: SuratMasuk = {
        id: payload.id,
        nomorSurat: payload.nomorSurat,
        tanggalSurat: payload.tanggalSurat,
        tanggalDiterima: new Date().toISOString(),
        pengirim: payload.pengirim,
        perihal: payload.perihal,
        sifat: payload.sifat as any,
        kategori: payload.kategori as any,
        status: payload.status as any,
        lampiranUrl: '',
        currentHandlerRole: payload.currentHandlerRole as any,
        lastActionDate: new Date().toISOString(),
      };
      setSuratList([...suratList, newSurat]);
      setIsAddModalOpen(false);

      await addSuratMasuk(payload);
      
      // Auto-create initial tracking record
      const initialTracking = {
        id: `DSP-${Date.now()}`,
        suratId: payload.id,
        dariUser: currentUser,
        keUser: null,
        instruksi: 'Surat Baru Diterima di Front Office',
        catatanTambahan: '',
        statusAksi: 'DITERIMA_FO',
        fileName: data.file ? data.file.name : '',
        mimeType: data.file ? data.file.type : '',
        fileData: data.fileData || '',
        statusSuratBaru: 'DITERIMA_FO',
        keUserRoleBaru: 'ADMIN',
        timestamp: new Date().toISOString()
      };
      await addDisposisi(initialTracking);
      
      await loadData(); // Reload from source
    } catch (error) {
      console.error("Gagal menyimpan surat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (actionData: any) => {
    try {
      setIsLoading(true);
      const keUserRole = actionData.keUserRoleBaru || 'ADMIN';
      let keUserObj = users.find(u => u.role === keUserRole) || null;
      
      const PEJABAT_MAP: Record<string, {name: string, jabatan: string}> = {
        'camat': { name: 'Nanin Sudiar, A.P', jabatan: 'Camat' },
        'sekcam': { name: 'Firman Jamaluddin, S.STP', jabatan: 'Sekretaris Camat' },
        'kasi_pemerintahan': { name: 'Rudyansyah Jufri, S.IP', jabatan: 'Kasi Pemerintahan' },
        'kasi_trantib': { name: 'Isvan Qadar Djachrir, S.STP', jabatan: 'Kasi Trantib' },
        'kasi_kesra': { name: 'Tumpak Suciningtyas, S.Sos', jabatan: 'Kasi Kesra' },
        'kasi_ekbang': { name: 'A. Suryani Tenribali, S.STP., M.Si', jabatan: 'Kasi Ekbang' },
        'kasi_kebersihan': { name: 'Muh. Guntur, S.STP', jabatan: 'Kasi Kebersihan' },
        'kasubag_keuangan': { name: 'Nasti, S.M., M.M', jabatan: 'Kasubag Keuangan dan Perencanaan' },
        'kasubag_umum': { name: 'Nurimna Fadliah, S.Sos, M.Ap', jabatan: 'Kasubag Umum dan Kepegawaian' }
      };

      if (actionData.tujuanDisposisi && PEJABAT_MAP[actionData.tujuanDisposisi]) {
        const pejabat = PEJABAT_MAP[actionData.tujuanDisposisi];
        keUserObj = {
          id: `pejabat-${actionData.tujuanDisposisi}`,
          name: pejabat.name,
          role: keUserRole,
          nip: '-',
          jabatan: pejabat.jabatan
        };
      } else if (actionData.tujuanStaf) {
        keUserObj = {
          id: `staf-custom`,
          name: actionData.tujuanStaf,
          role: keUserRole,
          nip: '-',
          jabatan: 'Staf Pelaksana'
        };
      }

      const payload = {
        id: `DSP-${Date.now()}`,
        suratId: actionData.suratId,
        dariUser: currentUser,
        keUser: keUserObj,
        instruksi: actionData.instruksi,
        catatanTambahan: '',
        statusAksi: actionData.statusSuratBaru,
        fileName: actionData.file ? actionData.file.name : '',
        mimeType: actionData.file ? actionData.file.type : '',
        fileData: actionData.fileData || '',
        statusSuratBaru: actionData.statusSuratBaru,
        keUserRoleBaru: keUserRole,
        timestamp: new Date().toISOString()
      };

      await addDisposisi(payload);
      await loadData();
      
      if (actionData.statusSuratBaru === 'SELESAI') {
        setSelectedLetterId(null);
      }
    } catch (error: any) {
      console.error("Gagal menyimpan disposisi:", error);
      alert(`Gagal mengirim disposisi: ${error.message || 'Terjadi kesalahan sistem'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-800 overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); if (!['masuk', 'disposisi', 'arsip'].includes(tab)) setSelectedLetterId(null); }} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-2">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="hidden sm:inline text-slate-400 text-sm">Beranda</span>
            <span className="hidden sm:inline text-slate-300 text-sm">/</span>
            <span className="text-slate-800 font-medium text-sm truncate max-w-[150px] sm:max-w-none">
              {activeTab === 'dashboard' ? 'Dashboard & Tracking' : 'Persuratan'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {isLoading && <span className="text-xs text-blue-600 animate-pulse font-medium">Sinkronisasi...</span>}
            <div className="relative hidden sm:block">
              <input type="text" placeholder="Cari agenda/nomor surat..." className="pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg text-sm w-48 lg:w-64 outline-none transition-colors" />
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
            </div>
            <button className="sm:hidden p-2 text-slate-400 hover:text-blue-600">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-blue-600 relative">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Grid */}
        <div className="p-4 lg:p-8 flex gap-6 flex-1 overflow-hidden">
          {activeTab === 'dashboard' ? (
            <DashboardTracking suratList={suratList} onSelectSurat={handleSelectSurat} />
          ) : activeTab === 'keluar' ? (
            <div className="w-full h-full flex justify-center">
               <div className="w-full max-w-5xl h-full">
                 <SuratKeluarList 
                   suratKeluar={suratKeluarList} 
                   onAddClick={() => setIsAddKeluarModalOpen(true)} 
                 />
               </div>
            </div>
          ) : ['masuk', 'disposisi', 'arsip'].includes(activeTab) ? (
            <>
              {/* List View */}
              <div className={`h-full ${selectedLetter ? 'hidden lg:flex' : 'flex w-full'} lg:w-auto`}>
                <LetterList 
                  letters={
                    activeTab === 'arsip' ? suratList.filter(s => s.status === 'SELESAI') :
                    suratList.filter(s => s.status !== 'SELESAI')
                  } 
                  selectedId={selectedLetterId} 
                  onSelect={setSelectedLetterId}
                  onAddClick={() => setIsAddModalOpen(true)}
                />
              </div>
              
              {/* Detail View */}
              <div className={`h-full flex-1 ${!selectedLetter ? 'hidden lg:flex' : 'flex'}`}>
                {selectedLetter ? (
                  <LetterDetail 
                    surat={selectedLetter} 
                    disposisiHistory={disposisiHistory} 
                    currentUser={currentUser}
                    onBack={() => setSelectedLetterId(null)}
                    onAction={handleAction}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm text-slate-400 font-medium">
                    Pilih surat untuk melihat detail
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm flex-col w-full h-full">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                <span className="text-slate-400 font-bold">UI</span>
              </div>
              <h2 className="text-xl font-bold text-slate-700">Halaman {activeTab}</h2>
              <p className="text-slate-500 mt-2 text-sm text-center px-4">Dalam tahap pengembangan prototipe.</p>
            </div>
          )}
        </div>
      </main>

      <AddLetterModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleSaveSurat} 
      />
      <AddSuratKeluarModal
        isOpen={isAddKeluarModalOpen}
        onClose={() => setIsAddKeluarModalOpen(false)}
        onSave={handleSaveSuratKeluar}
      />
    </div>
  );
}

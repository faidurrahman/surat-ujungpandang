import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, Calendar, Archive, FileText, LogOut } from 'lucide-react';
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

  const [arsipStartDate, setArsipStartDate] = useState('');
  const [arsipEndDate, setArsipEndDate] = useState('');
  const [filteredArsip, setFilteredArsip] = useState<SuratMasuk[] | null>(null);

  const [keluarStartDate, setKeluarStartDate] = useState('');
  const [keluarEndDate, setKeluarEndDate] = useState('');
  const [filteredKeluar, setFilteredKeluar] = useState<SuratKeluar[] | null>(null);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const authData = localStorage.getItem('authData');
      if (authData) {
        const { timestamp } = JSON.parse(authData);
        const twelveHours = 12 * 60 * 60 * 1000;
        const timeElapsed = new Date().getTime() - timestamp;
        
        if (timeElapsed < twelveHours) {
          setIsAuthenticated(true);
          
          const remainingTime = twelveHours - timeElapsed;
          const timeoutId = setTimeout(() => {
            setIsAuthenticated(false);
            localStorage.removeItem('authData');
            setLoginUsername('');
            setLoginPassword('');
          }, remainingTime);
          
          return () => clearTimeout(timeoutId);
        } else {
          localStorage.removeItem('authData');
          setIsAuthenticated(false);
        }
      }
    };
    
    return checkAuth();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername === 'admin' && loginPassword === 'samiun15') {
      setIsAuthenticated(true);
      setLoginError('');
      localStorage.setItem('authData', JSON.stringify({ timestamp: new Date().getTime() }));
      
      const twelveHours = 12 * 60 * 60 * 1000;
      setTimeout(() => {
        setIsAuthenticated(false);
        localStorage.removeItem('authData');
        setLoginUsername('');
        setLoginPassword('');
      }, twelveHours);
    } else {
      setLoginError('Username atau password salah.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('authData');
    setLoginUsername('');
    setLoginPassword('');
  };

  useEffect(() => {
    if (activeTab !== 'arsip') {
      setArsipStartDate('');
      setArsipEndDate('');
      setFilteredArsip(null);
    }
    if (activeTab !== 'keluar') {
      setKeluarStartDate('');
      setKeluarEndDate('');
      setFilteredKeluar(null);
    }
  }, [activeTab]);

  const handleFilterKeluar = () => {
    if (!keluarStartDate || !keluarEndDate) {
      alert("Harap pilih tanggal awal dan tanggal akhir.");
      return;
    }
    
    const start = new Date(keluarStartDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(keluarEndDate);
    end.setHours(23, 59, 59, 999);
    
    const filtered = suratKeluarList.filter(s => {
      const dateToCompare = new Date(s.tanggalDraft);
      return dateToCompare >= start && dateToCompare <= end;
    });
    
    setFilteredKeluar(filtered);
  };

  const handleResetKeluar = () => {
    setKeluarStartDate('');
    setKeluarEndDate('');
    setFilteredKeluar(null);
  };

  const handleFilterArsip = () => {
    if (!arsipStartDate || !arsipEndDate) {
      alert("Harap pilih tanggal awal dan tanggal akhir.");
      return;
    }
    
    const start = new Date(arsipStartDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(arsipEndDate);
    end.setHours(23, 59, 59, 999);
    
    const filtered = suratList.filter(s => {
      if (s.status !== 'SELESAI') return false;
      const dateToCompare = new Date(s.lastActionDate || s.tanggalDiterima);
      return dateToCompare >= start && dateToCompare <= end;
    });
    
    setFilteredArsip(filtered);
    setSelectedLetterId(null);
  };

  const handleResetArsip = () => {
    setArsipStartDate('');
    setArsipEndDate('');
    setFilteredArsip(null);
    setSelectedLetterId(null);
  };

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
      
      if (actionData.notulenFileData) {
        const notulenPayload = {
          id: `DSP-NOTULEN-${Date.now()}`,
          suratId: actionData.suratId,
          dariUser: currentUser,
          keUser: currentUser,
          instruksi: "Lampiran Notulen",
          catatanTambahan: '',
          statusAksi: "NOTULEN",
          fileName: actionData.notulenFile ? actionData.notulenFile.name : '',
          mimeType: actionData.notulenFile ? actionData.notulenFile.type : '',
          fileData: actionData.notulenFileData || '',
          statusSuratBaru: actionData.statusSuratBaru,
          keUserRoleBaru: keUserRole,
          timestamp: new Date().toISOString()
        };
        await addDisposisi(notulenPayload);
      }
      
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Sistem Persuratan</h1>
            <p className="text-sm text-slate-500 mt-2">Kecamatan Ujung Pandang</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Username</label>
              <input 
                type="text" 
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Masukkan username"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Password</label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Masukkan password"
              />
            </div>

            {loginError && (
              <p className="text-red-500 text-sm font-medium text-center bg-red-50 py-2 rounded-lg">{loginError}</p>
            )}

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    );
  }

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
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Grid */}
        <div className="p-4 lg:p-8 flex gap-6 flex-1 overflow-hidden">
          {activeTab === 'dashboard' ? (
            <DashboardTracking suratList={suratList} onSelectSurat={handleSelectSurat} />
          ) : activeTab === 'keluar' ? (
            <div className="flex flex-col h-full w-full overflow-hidden gap-6">
              <div className="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-end gap-4 shrink-0">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Dari Tanggal</label>
                    <div className="relative">
                      <input type="date" value={keluarStartDate} onChange={e => setKeluarStartDate(e.target.value)} className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                      <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Sampai Tanggal</label>
                    <div className="relative">
                      <input type="date" value={keluarEndDate} onChange={e => setKeluarEndDate(e.target.value)} className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                      <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 w-full md:w-auto mt-2 md:mt-0">
                  <button onClick={handleFilterKeluar} className="flex-1 md:flex-none px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
                    Tampilkan
                  </button>
                  <button onClick={handleResetKeluar} className="flex-1 md:flex-none px-5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-lg transition-colors">
                    Reset
                  </button>
                  <button 
                    onClick={() => setIsAddKeluarModalOpen(true)}
                    className="flex-1 md:flex-none px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
                    + Buat Baru
                  </button>
                </div>
              </div>
              {filteredKeluar === null ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center min-h-0">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Pencarian Surat Keluar</h3>
                  <p className="text-slate-500 max-w-md text-sm">Silakan pilih rentang tanggal untuk menampilkan data surat keluar.</p>
                </div>
              ) : filteredKeluar?.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center min-h-0">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Surat Keluar Tidak Ditemukan</h3>
                  <p className="text-slate-500 max-w-md text-sm">Tidak ada surat keluar yang ditemukan pada rentang tanggal tersebut.</p>
                </div>
              ) : (
                <div className="flex flex-1 overflow-hidden min-h-0 justify-center">
                  <div className="w-full max-w-5xl h-full">
                    <SuratKeluarList
                      suratKeluar={filteredKeluar}
                      onAddClick={() => setIsAddKeluarModalOpen(true)}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : ['masuk', 'disposisi', 'arsip'].includes(activeTab) ? (
            <div className="flex flex-col h-full w-full overflow-hidden gap-6">
              {activeTab === 'arsip' && (
                <div className="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-end gap-4 shrink-0">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Dari Tanggal</label>
                      <div className="relative">
                        <input type="date" value={arsipStartDate} onChange={e => setArsipStartDate(e.target.value)} className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                        <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Sampai Tanggal</label>
                      <div className="relative">
                        <input type="date" value={arsipEndDate} onChange={e => setArsipEndDate(e.target.value)} className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                        <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0">
                    <button onClick={handleFilterArsip} className="flex-1 md:flex-none px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
                      Tampilkan Arsip
                    </button>
                    <button onClick={handleResetArsip} className="flex-1 md:flex-none px-5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-lg transition-colors">
                      Reset
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'arsip' && filteredArsip === null ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center min-h-0">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Archive className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Pencarian Arsip</h3>
                  <p className="text-slate-500 max-w-md text-sm">Silakan pilih rentang tanggal untuk menampilkan data arsip.</p>
                </div>
              ) : activeTab === 'arsip' && filteredArsip?.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center min-h-0">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Archive className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Arsip Tidak Ditemukan</h3>
                  <p className="text-slate-500 max-w-md text-sm">Tidak ada arsip yang ditemukan pada rentang tanggal tersebut.</p>
                </div>
              ) : (
                <div className="flex flex-1 gap-6 overflow-hidden min-h-0">
                  {/* List View */}
                  <div className={`h-full ${selectedLetter ? 'hidden lg:flex' : 'flex w-full'} lg:w-auto`}>
                    <LetterList 
                      letters={
                        activeTab === 'arsip' ? (filteredArsip || []) :
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
                </div>
              )}
            </div>
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

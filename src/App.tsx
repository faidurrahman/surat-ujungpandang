import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, Calendar, Archive, FileText, LogOut } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { LetterList } from './components/LetterList';
import { LetterDetail } from './components/LetterDetail';
import { DashboardTracking } from './components/DashboardTracking';
import { AddLetterModal } from './components/AddLetterModal';
import { mockSuratMasuk, mockDisposisi, currentUser, users } from './mockData';
import { AddSuratKeluarModal } from './components/AddSuratKeluarModal';
import { SuratMasuk, Disposisi, SuratKeluar } from './types';
import { fetchSuratMasuk, fetchDisposisi, fetchSuratKeluar, addSuratMasuk, addDisposisi, addSuratKeluar } from './api';
import { SuratKeluarList } from './components/SuratKeluarList';
import { MakassarLogo } from './components/MakassarLogo';
import { NetworkBackground } from './components/NetworkBackground';
import { HeroBanner } from './components/HeroBanner';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
        <NetworkBackground className="opacity-15" />
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-white/20 relative z-10 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <MakassarLogo className="w-16 h-16" />
            </div>
            <h1 className="text-2xl font-bold text-blue-950 tracking-tight">SIMPADU</h1>
            <p className="text-xs text-blue-800 font-medium tracking-wide mt-1">E-Persuratan Kec. Ujung Pandang</p>
            <p className="text-[11px] text-slate-400 mt-1">Kota Makassar · Silakan masuk dengan akun resmi</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Username</label>
              <input 
                type="text" 
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                placeholder="Masukkan username"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Password</label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                placeholder="Masukkan password"
              />
            </div>

            {loginError && (
              <p className="text-rose-600 text-xs font-semibold text-center bg-rose-50 border border-rose-200 py-2 rounded-xl">{loginError}</p>
            )}

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.99] mt-2 text-sm"
            >
              Masuk ke Sistem
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50/70 font-sans text-slate-800">
      {/* Mobile Off-canvas Drawer (hidden on lg:) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); if (!['masuk', 'disposisi', 'arsip'].includes(tab)) setSelectedLetterId(null); }} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      {/* Horizontal Top Navigation Bar (Sticky top-0 z-50) */}
      <TopNavbar 
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
          if (!['masuk', 'disposisi', 'arsip'].includes(tab)) setSelectedLetterId(null);
        }}
        onOpenMobileMenu={() => setIsSidebarOpen(true)}
        onLogout={handleLogout}
        isLoading={isLoading}
      />

      {/* Hero Banner (100% full width, seamlessly attached below Navbar, scrolls naturally with the page) */}
      {activeTab === 'dashboard' && (
        <section className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-950 text-white relative shrink-0 overflow-hidden">
          <NetworkBackground className="opacity-15 pointer-events-none" />
          <HeroBanner />
        </section>
      )}

      <main className="flex-1 flex flex-col min-w-0 w-full">
        {activeTab === 'dashboard' ? (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-12">
            <DashboardTracking suratList={suratList} onSelectSurat={handleSelectSurat} />
          </div>
        ) : (
          <div className="p-3 sm:p-5 lg:p-6 flex gap-4 lg:gap-6 flex-1 min-h-[calc(100vh-5rem)] lg:h-[calc(100vh-5rem)] w-full max-w-7xl mx-auto">
            {activeTab === 'keluar' ? (
            <div className="flex flex-col h-full w-full overflow-hidden gap-5">
              <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-end gap-4 shrink-0">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Dari Tanggal</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={keluarStartDate} 
                        onChange={e => setKeluarStartDate(e.target.value)} 
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all" 
                      />
                      <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Sampai Tanggal</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={keluarEndDate} 
                        onChange={e => setKeluarEndDate(e.target.value)} 
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all" 
                      />
                      <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5 w-full md:w-auto mt-2 md:mt-0">
                  <button 
                    onClick={handleFilterKeluar} 
                    className="flex-1 md:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow"
                  >
                    Tampilkan
                  </button>
                  <button 
                    onClick={handleResetKeluar} 
                    className="flex-1 md:flex-none px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => setIsAddKeluarModalOpen(true)}
                    className="flex-1 md:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow"
                  >
                    + Buat Baru
                  </button>
                </div>
              </div>

              {filteredKeluar === null ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center min-h-0">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">Pencarian Surat Keluar</h3>
                  <p className="text-slate-500 max-w-md text-xs">Silakan pilih rentang tanggal untuk menampilkan data surat keluar.</p>
                </div>
              ) : filteredKeluar?.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center min-h-0">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">Surat Keluar Tidak Ditemukan</h3>
                  <p className="text-slate-500 max-w-md text-xs">Tidak ada surat keluar yang ditemukan pada rentang tanggal tersebut.</p>
                </div>
              ) : (
                <div className="flex flex-1 overflow-hidden min-h-0 justify-center">
                  <div className="w-full h-full">
                    <SuratKeluarList
                      suratKeluar={filteredKeluar}
                      onAddClick={() => setIsAddKeluarModalOpen(true)}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : ['masuk', 'disposisi', 'arsip'].includes(activeTab) ? (
            <div className="flex flex-col h-full w-full overflow-hidden gap-5">
              {activeTab === 'arsip' && (
                <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-end gap-4 shrink-0">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Dari Tanggal</label>
                      <div className="relative">
                        <input 
                          type="date" 
                          value={arsipStartDate} 
                          onChange={e => setArsipStartDate(e.target.value)} 
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all" 
                        />
                        <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Sampai Tanggal</label>
                      <div className="relative">
                        <input 
                          type="date" 
                          value={arsipEndDate} 
                          onChange={e => setArsipEndDate(e.target.value)} 
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all" 
                        />
                        <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2.5 w-full md:w-auto mt-2 md:mt-0">
                    <button 
                      onClick={handleFilterArsip} 
                      className="flex-1 md:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow"
                    >
                      Tampilkan Arsip
                    </button>
                    <button 
                      onClick={handleResetArsip} 
                      className="flex-1 md:flex-none px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'arsip' && filteredArsip === null ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center min-h-0">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
                    <Archive className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">Pencarian Arsip Dokumen</h3>
                  <p className="text-slate-500 max-w-md text-xs">Silakan pilih rentang tanggal untuk menampilkan data arsip yang telah selesai.</p>
                </div>
              ) : activeTab === 'arsip' && filteredArsip?.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center min-h-0">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
                    <Archive className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">Arsip Tidak Ditemukan</h3>
                  <p className="text-slate-500 max-w-md text-xs">Tidak ada dokumen arsip yang ditemukan pada rentang tanggal tersebut.</p>
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
                      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/80 shadow-sm text-slate-400 p-8 text-center">
                        <FileText className="w-12 h-12 text-slate-200 mb-3" />
                        <p className="text-sm font-bold text-slate-600">Pilih Surat untuk Melihat Detail</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs">Klik salah satu surat pada daftar di sebelah kiri untuk melihat riwayat disposisi.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-slate-200/80 shadow-sm flex-col w-full h-full p-8 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Halaman {activeTab}</h2>
              <p className="text-slate-400 mt-1 text-xs">Dalam tahap pengembangan.</p>
            </div>
          )}
        </div>
      )}
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

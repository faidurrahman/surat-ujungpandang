import React, { useState } from 'react';
import { Clock, FileText, Search, Users, ArrowRight } from 'lucide-react';
import { SuratMasuk } from '../types';
import { MakassarLogo } from './MakassarLogo';
import { NetworkBackground } from './NetworkBackground';

interface DashboardProps {
  suratList: SuratMasuk[];
  onSelectSurat: (id: string) => void;
}

export function DashboardTracking({ suratList, onSelectSurat }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const activeSurat = suratList.filter(s => s.status !== 'SELESAI');
  const finishedSurat = suratList.filter(s => s.status === 'SELESAI');
  const tertahanCamat = activeSurat.filter(s => s.currentHandlerRole === 'CAMAT');
  const tertahanAdmin = activeSurat.filter(s => s.currentHandlerRole === 'ADMIN');
  const tertahanPejabat = activeSurat.filter(s => ['KASUBAG', 'KASI', 'SEKCAM'].includes(s.currentHandlerRole));
  const diprosesStaf = activeSurat.filter(s => s.currentHandlerRole === 'STAF');

  const searchResults = searchQuery.trim() 
    ? suratList.filter(s => 
        String(s.nomorSurat).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.perihal && s.perihal.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.pengirim && s.pengirim.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <div className="space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Card Banner Judul "E-PERSURATAN" */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-950 rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-lg relative overflow-hidden mb-6 text-center border border-blue-500/30">
          {/* Ornamen SVG garis jaringan geometris tipis di sudut kiri dan kanan */}
          <NetworkBackground className="opacity-15" />

          {/* Radial ambient glow in the center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Logo Resmi E-Persuratan */}
            <div className="mb-2 sm:mb-3 transform transition-transform hover:scale-105 duration-300">
              <MakassarLogo className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
            </div>

            {/* Judul Besar */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-wide drop-shadow-sm text-white">
              E-PERSURATAN
            </h1>

            {/* Sub-Judul */}
            <p className="text-[11px] sm:text-xs md:text-sm font-bold tracking-wider text-blue-100 mt-1 uppercase leading-snug">
              SISTEM INFORMASI MANAJEMEN PERSURATAN & DISPOSISI DIGITAL
            </p>

            {/* Keterangan */}
            <p className="text-[11px] sm:text-xs text-blue-200 mt-1 max-w-xl px-2">
              Digitalisasi Pelayanan Administrasi dan Tracking Surat Kecamatan Ujung Pandang, Kota Makassar
            </p>

            {/* Kolom Input Pencarian Cepat Berbentuk Pil Putih */}
            <div className="w-full max-w-md mx-auto mt-4 sm:mt-5 relative">
              <div className="w-full rounded-full bg-white text-slate-700 px-4 sm:px-5 py-2 sm:py-2.5 shadow-md flex items-center gap-2.5 sm:gap-3 border border-white/60 focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-400 transition-all">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari Agenda / Nomor Surat..." 
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none font-medium"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
                    title="Hapus pencarian"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Quick Search Dropdown Results */}
              {searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden text-left z-30 max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {searchResults.length > 0 ? (
                    searchResults.map(surat => (
                      <button
                        key={surat.id}
                        onClick={() => onSelectSurat(surat.id)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50/60 transition-colors flex items-center justify-between group"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-xs font-bold text-slate-900 font-mono group-hover:text-blue-600 transition-colors truncate">
                            {surat.nomorSurat}
                          </p>
                          <p className="text-xs text-slate-600 truncate mt-0.5">
                            {surat.perihal}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            Pengirim: {surat.pengirim}
                          </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">
                            {surat.currentHandlerRole.replace('_', ' ')}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      Tidak ada surat yang sesuai dengan pencarian "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Empat Kartu Statistik Warna Soft Pastel + Efek Hover Interaktif */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Kartu 1 (Total Aktif) */}
          <div 
            onClick={() => {
              if (activeSurat.length > 0) onSelectSurat(activeSurat[0].id);
            }}
            className="bg-blue-50/80 border border-blue-200 hover:border-blue-400 hover:shadow-blue-200/50 p-4 sm:p-5 rounded-xl shadow-sm flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-1">
                  Total Aktif
                </p>
                <h3 className="text-3xl font-extrabold text-blue-950 font-mono tabular-nums">
                  {activeSurat.length}
                </h3>
              </div>
              <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-600">
              <span className="text-emerald-600 font-bold">{finishedSurat.length} Selesai</span>
              <span className="text-slate-400"> · Berkas Aktif</span>
            </p>
          </div>

          {/* Kartu 2 (Tertahan di Camat) */}
          <div 
            onClick={() => {
              if (tertahanCamat.length > 0) onSelectSurat(tertahanCamat[0].id);
            }}
            className="bg-rose-50/80 border border-rose-200 hover:border-rose-400 hover:shadow-rose-200/50 p-4 sm:p-5 rounded-xl shadow-sm flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[11px] font-bold text-rose-900 uppercase tracking-wider mb-1">
                  Tertahan di Camat
                </p>
                <h3 className="text-3xl font-extrabold text-rose-900 font-mono tabular-nums">
                  {tertahanCamat.length}
                </h3>
              </div>
              <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-semibold text-rose-800/80">
              Menunggu Disposisi Camat
            </p>
          </div>

          {/* Kartu 3 (Admin / Pejabat) */}
          <div 
            onClick={() => {
              const target = tertahanAdmin[0] || tertahanPejabat[0];
              if (target) onSelectSurat(target.id);
            }}
            className="bg-amber-50/80 border border-amber-200 hover:border-amber-400 hover:shadow-amber-200/50 p-4 sm:p-5 rounded-xl shadow-sm flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                  Admin / Pejabat
                </p>
                <h3 className="text-3xl font-extrabold text-amber-900 font-mono tabular-nums">
                  {tertahanAdmin.length + tertahanPejabat.length}
                </h3>
              </div>
              <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-semibold text-amber-800/80">
              Menunggu Penugasan
            </p>
          </div>

          {/* Kartu 4 (Dikerjakan Staf) */}
          <div 
            onClick={() => {
              if (diprosesStaf.length > 0) onSelectSurat(diprosesStaf[0].id);
            }}
            className="bg-purple-50/80 border border-purple-200 hover:border-purple-400 hover:shadow-purple-200/50 p-4 sm:p-5 rounded-xl shadow-sm flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[11px] font-bold text-purple-900 uppercase tracking-wider mb-1">
                  Dikerjakan Staf
                </p>
                <h3 className="text-3xl font-extrabold text-purple-900 font-mono tabular-nums">
                  {diprosesStaf.length}
                </h3>
              </div>
              <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-semibold text-purple-800/80">
              Proses Tindak Lanjut
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

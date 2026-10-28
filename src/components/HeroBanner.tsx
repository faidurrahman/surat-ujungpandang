import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { SuratMasuk } from '../types';
import { MakassarLogo } from './MakassarLogo';

interface HeroBannerProps {
  suratList: SuratMasuk[];
  onSelectSurat: (id: string) => void;
}

export function HeroBanner({ suratList, onSelectSurat }: HeroBannerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = searchQuery.trim() 
    ? suratList.filter(s => 
        String(s.nomorSurat).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.perihal && s.perihal.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.pengirim && s.pengirim.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  return (
    <div className="w-full relative z-10 mt-0 py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 text-center text-white">
      {/* Radial ambient glow in the center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
        {/* Logo Resmi E-Persuratan */}
        <div className="mb-2 sm:mb-3 transform transition-transform hover:scale-105 duration-300">
          <MakassarLogo className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
        </div>

        {/* Judul Utama (SIMPADU) */}
        <h1 className="text-3xl sm:text-4xl md:text-[42px] font-bold text-white tracking-tight leading-tight uppercase drop-shadow-sm">
          SIMPADU
        </h1>

        {/* Sub-judul Baris 1 */}
        <p className="text-base sm:text-lg md:text-[20px] font-semibold text-white mt-2 leading-snug">
          Sistem Informasi Manajemen Persuratan dan Disposisi Ujung Pandang
        </p>

        {/* Sub-judul Baris 2 */}
        <p className="text-xs sm:text-sm md:text-[15px] font-normal text-white/90 mt-1.5 max-w-2xl px-2 leading-normal">
          Digitalisasi Pelayanan Administrasi dan Tracking Surat Kecamatan Ujung Pandang, Kota Makassar
        </p>

        {/* Kolom Input Pencarian Cepat Berbentuk Pil Putih */}
        <div className="w-full max-w-md mx-auto mt-4 sm:mt-5 relative">
          <div className="w-full rounded-full bg-white text-slate-700 px-4 sm:px-5 py-2.5 shadow-md flex items-center gap-2.5 sm:gap-3 border border-white/60 focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-400 transition-all">
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
                type="button"
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
                    type="button"
                    onClick={() => {
                      onSelectSurat(surat.id);
                      setSearchQuery('');
                    }}
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
  );
}

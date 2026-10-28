import React, { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Plus, Search } from 'lucide-react';
import { SuratMasuk } from '../types';
import { cn } from '../utils';

interface LetterListProps {
  letters: SuratMasuk[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddClick: () => void;
}

const statusConfig: Record<string, { color: string, label: string }> = {
  'DITERIMA_FO': { color: 'bg-slate-100 text-slate-700 border border-slate-200', label: 'Di Resepsionis' },
  'MENUNGGU_DISPOSISI_CAMAT': { color: 'bg-rose-50 text-rose-700 border border-rose-200', label: 'Menunggu Camat' },
  'MENUNGGU_TERUSAN_ADMIN': { color: 'bg-amber-50 text-amber-700 border border-amber-200', label: 'Menunggu Admin' },
  'MENUNGGU_DISPOSISI_SEKCAM': { color: 'bg-indigo-50 text-indigo-700 border border-indigo-200', label: 'Menunggu Sekcam' },
  'MENUNGGU_DISPOSISI_KASUBAG': { color: 'bg-orange-50 text-orange-700 border border-orange-200', label: 'Menunggu Kasubag' },
  'MENUNGGU_DISPOSISI_KASI': { color: 'bg-yellow-50 text-yellow-800 border border-yellow-200', label: 'Menunggu Kasi' },
  'DIPROSES_STAF': { color: 'bg-purple-50 text-purple-700 border border-purple-200', label: 'Diproses Staf' },
  'SELESAI': { color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', label: 'Selesai' },
};

const sifatConfig: Record<string, string> = {
  'Biasa': 'bg-slate-100 text-slate-600',
  'Penting': 'bg-amber-100 text-amber-700 font-semibold',
  'Segera': 'bg-rose-100 text-rose-700 font-semibold',
  'Rahasia': 'bg-purple-100 text-purple-800 font-semibold',
};

export function LetterList({ letters, selectedId, onSelect, onAddClick }: LetterListProps) {
  const [searchFilter, setSearchFilter] = useState('');

  const filteredLetters = searchFilter.trim()
    ? letters.filter(surat => 
        String(surat.nomorSurat || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
        String(surat.perihal || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
        String(surat.pengirim || '').toLowerCase().includes(searchFilter.toLowerCase())
      )
    : letters;

  return (
    <>
      <div className="w-full lg:w-[380px] h-full bg-white rounded-2xl shadow-sm border border-slate-200/80 flex flex-col shrink-0 overflow-hidden relative">
        {/* Header dengan latar bg-blue-50/50 text-blue-950 font-semibold */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-blue-50/50 text-blue-950 font-semibold shrink-0">
          <div>
            <h2 className="font-bold text-blue-950 text-base">Daftar Persuratan</h2>
            <p className="text-[11px] text-blue-800/70 font-normal">
              {filteredLetters.length} dokumen ditampilkan
            </p>
          </div>
          
          {/* Desktop Add Button */}
          <button 
            onClick={onAddClick}
            className="hidden lg:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow"
          >
            <Plus className="w-4 h-4" />
            Tambah Surat
          </button>
        </div>

        {/* Search input dengan fokus biru */}
        <div className="p-3 border-b border-slate-100 bg-white shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input 
              type="text" 
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Cari nomor/perihal/pengirim..." 
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        {/* List Items dengan hover:bg-blue-50/30 transition-colors */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pb-20 lg:pb-0">
          {filteredLetters.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Tidak ada surat yang ditemukan
            </div>
          ) : (
            filteredLetters.map((surat) => (
              <button
                key={surat.id}
                onClick={() => onSelect(surat.id)}
                className={cn(
                  "w-full text-left p-4 hover:bg-blue-50/30 transition-colors focus:outline-none relative",
                  selectedId === surat.id && "bg-blue-50/50 hover:bg-blue-50/60"
                )}
              >
                {selectedId === surat.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r hidden lg:block" />
                )}
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-mono font-bold text-blue-950 truncate mr-2">
                    {surat.nomorSurat}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight whitespace-nowrap shrink-0">
                    {format(new Date(surat.tanggalDiterima), 'dd MMM', { locale: id })}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug mb-1.5 pr-2">
                  {surat.perihal}
                </h3>
                <div className="text-xs text-slate-500 mb-2.5 truncate pr-2">
                  Dari: <span className="font-medium text-slate-700">{surat.pengirim}</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                    statusConfig[surat.status]?.color || 'bg-slate-100 text-slate-600'
                  )}>
                    {statusConfig[surat.status]?.label || surat.status}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] uppercase font-bold",
                    sifatConfig[surat.sifat] || 'bg-slate-100 text-slate-600'
                  )}>
                    {surat.sifat}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <button 
        onClick={onAddClick}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-transform active:scale-95"
        aria-label="Tambah Surat Baru"
      >
        <Plus className="w-6 h-6" />
      </button>
    </>
  );
}

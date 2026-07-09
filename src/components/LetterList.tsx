import React from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { SuratMasuk } from '../types';
import { cn } from '../utils';

interface LetterListProps {
  letters: SuratMasuk[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddClick: () => void;
}

const statusConfig: Record<string, { color: string, label: string }> = {
  'DITERIMA_FO': { color: 'bg-slate-100 text-slate-600', label: 'Di Resepsionis' },
  'MENUNGGU_DISPOSISI_CAMAT': { color: 'bg-blue-100 text-blue-700', label: 'Menunggu Camat' },
  'MENUNGGU_TERUSAN_ADMIN': { color: 'bg-orange-100 text-orange-700', label: 'Menunggu Admin' },
  'MENUNGGU_DISPOSISI_SEKCAM': { color: 'bg-indigo-100 text-indigo-700', label: 'Menunggu Sekcam' },
  'MENUNGGU_DISPOSISI_KASUBAG': { color: 'bg-amber-100 text-amber-700', label: 'Menunggu Kasubag' },
  'MENUNGGU_DISPOSISI_KASI': { color: 'bg-yellow-100 text-yellow-700', label: 'Menunggu Kasi' },
  'DIPROSES_STAF': { color: 'bg-purple-100 text-purple-700', label: 'Diproses Staf' },
  'SELESAI': { color: 'bg-emerald-100 text-emerald-700', label: 'Selesai' },
};

const sifatConfig = {
  'Biasa': 'bg-slate-100 text-slate-600',
  'Penting': 'bg-orange-100 text-orange-700',
  'Segera': 'bg-red-100 text-red-700',
  'Rahasia': 'bg-rose-100 text-rose-800',
};

export function LetterList({ letters, selectedId, onSelect, onAddClick }: LetterListProps) {
  return (
    <>
      <div className="w-full lg:w-[380px] h-full bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col shrink-0 overflow-hidden relative">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h2 className="font-bold text-slate-800">Inbox Persuratan</h2>
          
          {/* Desktop Add Button */}
          <button 
            onClick={onAddClick}
            className="hidden lg:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Surat
          </button>
        </div>
        <div className="p-4 border-b border-slate-100 shrink-0">
          <input 
            type="text" 
            placeholder="Cari nomor/perihal..." 
            className="w-full px-3 py-2 text-sm bg-slate-100 border-transparent rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
        <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {letters.map((surat) => (
            <button
              key={surat.id}
              onClick={() => onSelect(surat.id)}
              className={cn(
                "w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors focus:outline-none relative",
                selectedId === surat.id && "bg-blue-50/30 hover:bg-blue-50/30"
              )}
            >
              {selectedId === surat.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 hidden lg:block" />
              )}
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-mono font-bold text-slate-500 truncate mr-2">{surat.nomorSurat}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight whitespace-nowrap shrink-0">
                  {format(new Date(surat.tanggalDiterima), 'dd MMM', { locale: id })}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight mb-2 pr-2">
                {surat.perihal}
              </h3>
              <div className="text-xs text-slate-500 mb-3 truncate pr-2">{surat.pengirim}</div>
              
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                  statusConfig[surat.status].color
                )}>
                  {statusConfig[surat.status].label}
                </span>
                <span className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                  sifatConfig[surat.sifat]
                )}>
                  {surat.sifat}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <button 
        onClick={onAddClick}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-transform active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>
    </>
  );
}

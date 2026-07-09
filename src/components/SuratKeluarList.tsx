import React from 'react';
import { FileText, Clock, CheckCircle, Send } from 'lucide-react';
import { SuratKeluar } from '../types';

interface SuratKeluarListProps {
  suratKeluar: SuratKeluar[];
  onAddClick: () => void;
}

export function SuratKeluarList({ suratKeluar, onAddClick }: SuratKeluarListProps) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl flex flex-col h-full overflow-hidden shadow-sm">
      <div className="p-4 lg:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <h2 className="text-lg font-bold text-slate-800">Daftar Surat Keluar</h2>
        <button 
          onClick={onAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors w-full sm:w-auto">
          + Buat Surat Keluar Baru
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 lg:p-5">
        {suratKeluar.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <FileText className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-sm font-medium text-center">Belum ada data surat keluar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suratKeluar.map((surat) => (
              <div key={surat.id} className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all bg-white group cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">
                      {surat.nomorSurat || 'DRAFT'}
                    </span>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${
                      surat.status === 'DRAFT' ? 'bg-slate-100 text-slate-600' :
                      surat.status === 'DIKIRIM' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {surat.status}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                  {surat.perihal}
                </h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { FileText, Calendar, X, Paperclip, ExternalLink, ArrowRight, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { SuratKeluar } from '../types';

interface SuratKeluarListProps {
  suratKeluar: SuratKeluar[];
  onAddClick: () => void;
}

export function SuratKeluarList({ suratKeluar, onAddClick }: SuratKeluarListProps) {
  const [selectedSurat, setSelectedSurat] = useState<SuratKeluar | null>(null);

  return (
    <>
      <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200/80 flex flex-col h-full overflow-hidden">
        {/* Table View */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          {suratKeluar.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 p-8">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3 text-blue-500">
                <FileText className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-700">Belum ada data surat keluar</p>
              <p className="text-xs text-slate-400 mt-1">Gunakan tombol "+ Buat Baru" di atas untuk menambahkan draft.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-blue-50/50 text-blue-950 font-semibold border-b border-slate-200/80 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold">Nomor Surat</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold">Perihal Dokumen</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold">Tanggal Draft</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold">Status</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suratKeluar.map((surat) => (
                  <tr 
                    key={surat.id}
                    onClick={() => setSelectedSurat(surat)}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs font-bold text-blue-950 group-hover:text-blue-600 transition-colors">
                        {surat.nomorSurat || 'DRAFT'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1 max-w-md">
                        {surat.perihal || 'Belum ada perihal (Draft baru)'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{format(new Date(surat.tanggalDraft), 'dd MMM yyyy', { locale: localeId })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md uppercase tracking-wider ${
                        surat.status === 'DRAFT' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                        surat.status === 'DIKIRIM' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {surat.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSurat(surat);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl text-xs font-bold transition-all border border-blue-200/60"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSurat && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 lg:p-8 transition-opacity"
          onClick={() => setSelectedSurat(null)}
        >
          <div 
            className="relative w-full max-w-5xl h-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-blue-50/50 text-blue-950 shrink-0">
              <h3 className="font-bold text-base text-blue-950 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Detail Surat Keluar
              </h3>
              <button 
                onClick={() => setSelectedSurat(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-xl transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <div className="w-full md:w-1/3 border-r border-slate-200 p-6 overflow-y-auto bg-white">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</h4>
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-md uppercase tracking-wider ${
                      selectedSurat.status === 'DRAFT' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                      selectedSurat.status === 'DIKIRIM' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {selectedSurat.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nomor Surat</h4>
                    <p className="font-bold text-blue-950 font-mono">{selectedSurat.nomorSurat || 'Belum ada nomor (Draft)'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal Draft</h4>
                    <p className="font-bold text-slate-800 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      {format(new Date(selectedSurat.tanggalDraft), 'dd MMMM yyyy', { locale: localeId })}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Perihal</h4>
                    <p className="font-medium text-slate-800 text-sm leading-relaxed">{selectedSurat.perihal || 'Belum ada perihal'}</p>
                  </div>
                  {selectedSurat.draftUrl && (
                    <div className="pt-4 border-t border-slate-100">
                      <a 
                        href={selectedSurat.draftUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Buka Dokumen di Tab Baru
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 bg-slate-100 relative">
                {selectedSurat.draftUrl ? (
                  <iframe 
                    src={selectedSurat.draftUrl} 
                    className="w-full h-full border-0"
                    title="Dokumen Surat Keluar"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <Paperclip className="w-12 h-12 mb-3 text-slate-300" />
                    <p className="font-medium text-sm">Tidak ada dokumen lampiran</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

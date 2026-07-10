import React, { useState } from 'react';
import { FileText, Clock, CheckCircle, Send, Calendar, X, Paperclip, ExternalLink } from 'lucide-react';
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
      <div className="w-full bg-white border border-slate-200 rounded-xl flex flex-col h-full overflow-hidden shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 lg:p-5">
          {suratKeluar.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <FileText className="w-12 h-12 mb-4 text-slate-300" />
              <p className="text-sm font-medium text-center">Belum ada data surat keluar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {suratKeluar.map((surat) => (
                <div 
                  key={surat.id} 
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all bg-white group cursor-pointer"
                  onClick={() => setSelectedSurat(surat)}
                >
                  <div className="flex justify-between items-start mb-3">
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
                  <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                    {surat.perihal || 'Belum ada perihal (Draft baru)'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{format(new Date(surat.tanggalDraft), 'dd MMM yyyy', { locale: localeId })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSurat && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 lg:p-8 transition-opacity"
          onClick={() => setSelectedSurat(null)}
        >
          <div 
            className="relative w-full max-w-5xl h-full max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Detail Surat Keluar
              </h3>
              <button 
                onClick={() => setSelectedSurat(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-1/3 border-r border-slate-200 p-6 overflow-y-auto bg-white">
                   <div className="space-y-6">
                     <div>
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</h4>
                       <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                         selectedSurat.status === 'DRAFT' ? 'bg-slate-100 text-slate-600' :
                         selectedSurat.status === 'DIKIRIM' ? 'bg-emerald-100 text-emerald-700' :
                         'bg-orange-100 text-orange-700'
                       }`}>
                         {selectedSurat.status}
                       </span>
                     </div>
                     <div>
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nomor Surat</h4>
                       <p className="font-bold text-slate-800">{selectedSurat.nomorSurat || 'Belum ada nomor (Draft)'}</p>
                     </div>
                     <div>
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal Draft</h4>
                       <p className="font-bold text-slate-800 flex items-center gap-2">
                         <Calendar className="w-4 h-4 text-slate-400" />
                         {format(new Date(selectedSurat.tanggalDraft), 'dd MMMM yyyy', { locale: localeId })}
                       </p>
                     </div>
                     <div>
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Perihal</h4>
                       <p className="font-bold text-slate-800 text-sm leading-relaxed">{selectedSurat.perihal || 'Belum ada perihal'}</p>
                     </div>
                     {selectedSurat.draftUrl && (
                        <div className="pt-4 border-t border-slate-100">
                          <a href={selectedSurat.draftUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-bold transition-colors">
                            <ExternalLink className="w-4 h-4" />
                            Buka di Tab Baru
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
                        <Paperclip className="w-12 h-12 mb-4 text-slate-300" />
                        <p className="font-medium">Tidak ada dokumen lampiran</p>
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

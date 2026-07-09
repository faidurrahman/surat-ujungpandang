import React from 'react';
import { Clock, AlertTriangle, AlertCircle, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { SuratMasuk } from '../types';
import { cn } from '../utils';

interface DashboardProps {
  suratList: SuratMasuk[];
  onSelectSurat: (id: string) => void;
}

export function DashboardTracking({ suratList, onSelectSurat }: DashboardProps) {
  const activeSurat = suratList.filter(s => s.status !== 'SELESAI');
  const finishedSurat = suratList.filter(s => s.status === 'SELESAI');

  const tertahanCamat = activeSurat.filter(s => s.currentHandlerRole === 'CAMAT');
  const tertahanAdmin = activeSurat.filter(s => s.currentHandlerRole === 'ADMIN');
  const tertahanPejabat = activeSurat.filter(s => ['KASUBAG', 'KASI', 'SEKCAM'].includes(s.currentHandlerRole));
  const diprosesStaf = activeSurat.filter(s => s.currentHandlerRole === 'STAF');

  // Simple SLA logic: > 24 hours is warning, > 48 hours is late
  const getSlaStatus = (dateString: string) => {
    const hours = (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60);
    if (hours > 48) return 'TERLAMBAT';
    if (hours > 24) return 'WARNING';
    return 'AMAN';
  };

  const bottlenecks = activeSurat
    .map(surat => ({ ...surat, sla: getSlaStatus(surat.lastActionDate) }))
    .filter(surat => surat.sla !== 'AMAN')
    .sort((a, b) => new Date(a.lastActionDate).getTime() - new Date(b.lastActionDate).getTime());

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Aktif</p>
                <h3 className="text-3xl font-bold text-slate-900">{activeSurat.length}</h3>
              </div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500">
              <span className="text-emerald-500">{finishedSurat.length} Selesai</span>
            </p>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tertahan di Camat</p>
                <h3 className="text-3xl font-bold text-amber-500">{tertahanCamat.length}</h3>
              </div>
              <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500">Menunggu Disposisi</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Admin / Pejabat</p>
                <h3 className="text-3xl font-bold text-orange-500">{tertahanAdmin.length + tertahanPejabat.length}</h3>
              </div>
              <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500">Menunggu Penugasan</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dikerjakan Staf</p>
                <h3 className="text-3xl font-bold text-purple-600">{diprosesStaf.length}</h3>
              </div>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500">Proses Tindak Lanjut</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Daftar Surat Mandek (Bottleneck)
              </h2>
              <p className="text-xs text-slate-500 mt-1">Surat yang belum diproses melebihi batas waktu (SLA 24 Jam)</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">No. Surat / Kategori</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Posisi Saat Ini</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Waktu Tertahan</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bottlenecks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-emerald-400 mb-2" />
                        <p className="text-sm font-bold text-slate-700">Semua surat terkendali</p>
                        <p className="text-xs text-slate-500 mt-1">Tidak ada surat yang mandek melewati SLA.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bottlenecks.map((surat) => (
                    <tr key={surat.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs font-bold text-slate-900 mb-1">{surat.nomorSurat}</div>
                        <div className="text-[11px] font-bold text-slate-500 uppercase">{surat.kategori}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase rounded-md">
                          {surat.currentHandlerRole.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className={surat.sla === 'TERLAMBAT' ? 'w-4 h-4 text-red-500' : 'w-4 h-4 text-amber-500'} />
                          <span className={cn(
                            "text-xs font-bold uppercase",
                            surat.sla === 'TERLAMBAT' ? 'text-red-600' : 'text-amber-600'
                          )}>
                            {formatDistanceToNow(new Date(surat.lastActionDate), { locale: localeId })}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button 
                          onClick={() => onSelectSurat(surat.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-600 rounded text-xs font-bold transition-colors"
                        >
                          Lihat Detail
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

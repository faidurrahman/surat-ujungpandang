import React from 'react';
import { Clock, FileText } from 'lucide-react';
import { SuratMasuk } from '../types';

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
      </div>
    </div>
  );
}

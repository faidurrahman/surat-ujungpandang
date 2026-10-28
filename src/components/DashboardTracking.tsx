import React from 'react';
import { Clock, FileText, Users } from 'lucide-react';
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
    <div className="w-full">
      {/* Empat Kartu Statistik Warna Soft Pastel + Efek Hover Interaktif */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Kartu 1 (Total Aktif) */}
        <div 
          onClick={() => {
            if (activeSurat.length > 0) onSelectSurat(activeSurat[0].id);
          }}
          className="bg-blue-50/80 border border-blue-200 hover:border-blue-400 hover:shadow-blue-200/50 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg cursor-pointer group"
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
          className="bg-rose-50/80 border border-rose-200 hover:border-rose-400 hover:shadow-rose-200/50 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg cursor-pointer group"
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
          className="bg-amber-50/80 border border-amber-200 hover:border-amber-400 hover:shadow-amber-200/50 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg cursor-pointer group"
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
          className="bg-purple-50/80 border border-purple-200 hover:border-purple-400 hover:shadow-purple-200/50 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg cursor-pointer group"
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
  );
}

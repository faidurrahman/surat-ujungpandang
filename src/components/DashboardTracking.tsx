import React, { useState } from 'react';
import { 
  Clock, 
  FileText, 
  Users, 
  Search, 
  Mail, 
  Send, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  X,
  FileCheck2,
  Tag
} from 'lucide-react';
import { SuratMasuk } from '../types';

interface DashboardProps {
  suratList: SuratMasuk[];
  onSelectSurat: (id: string) => void;
}

export function DashboardTracking({ suratList, onSelectSurat }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const activeSurat = suratList.filter(s => s.status !== 'SELESAI');
  const finishedSurat = suratList.filter(s => s.status === 'SELESAI');
  const tertahanCamat = activeSurat.filter(s => s.currentHandlerRole === 'CAMAT');
  const tertahanAdmin = activeSurat.filter(s => s.currentHandlerRole === 'ADMIN');
  const tertahanPejabat = activeSurat.filter(s => ['KASUBAG', 'KASI', 'SEKCAM'].includes(s.currentHandlerRole));
  const diprosesStaf = activeSurat.filter(s => s.currentHandlerRole === 'STAF');

  // Query filter logic: active when either user typed something or hit search
  const effectiveQuery = (submittedQuery || searchQuery).trim().toLowerCase();
  
  const searchResults = effectiveQuery
    ? suratList.filter(s => 
        String(s.nomorSurat || '').toLowerCase().includes(effectiveQuery) ||
        String(s.id || '').toLowerCase().includes(effectiveQuery) ||
        String(s.perihal || '').toLowerCase().includes(effectiveQuery) ||
        String(s.pengirim || '').toLowerCase().includes(effectiveQuery) ||
        String(s.kategori || '').toLowerCase().includes(effectiveQuery)
      )
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSubmittedQuery('');
  };

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

      {/* 1. Card Box 'Cari Surat / Agenda' (Di bawah 4 Card Statistik) */}
      <div 
        id="search-surat-section"
        className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100 p-6 md:p-8 mt-8"
      >
        {/* Header Card (Tengah) */}
        <h2 className="text-xl md:text-2xl font-bold text-blue-600 flex items-center justify-center gap-2">
          <span>🔍</span> Cari Surat / Agenda
        </h2>

        {/* Sub-teks (Tengah) */}
        <p className="text-sm text-gray-500 text-center mt-1 mb-5">
          Masukkan Nomor Surat, Nomor Agenda, atau Perihal Surat
        </p>

        {/* Form Input & Tombol (Sejajar Horizontal) */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <input
              id="dashboard-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Contoh : 005/124/KUP/X/2026 atau Undangan Rapat"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                title="Hapus teks"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg flex items-center justify-center gap-2 transition shrink-0 shadow-sm hover:shadow"
          >
            <span>🔍</span> Cari
          </button>
        </form>

        {/* Search Results Display Area */}
        {effectiveQuery && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                Hasil Pencarian untuk: <span className="text-blue-600 font-bold">"{effectiveQuery}"</span> ({searchResults.length} ditemukan)
              </p>
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
              >
                Reset Pencarian
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-1">
                {searchResults.map((surat) => (
                  <div
                    key={surat.id}
                    onClick={() => onSelectSurat(surat.id)}
                    className="p-4 rounded-xl border border-gray-200/80 hover:border-blue-500 hover:bg-blue-50/40 hover:shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group bg-white"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 group-hover:underline">
                          {surat.nomorSurat}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          ID: {surat.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          surat.sifat === 'Rahasia' ? 'bg-red-100 text-red-700' :
                          surat.sifat === 'Penting' || surat.sifat === 'Segera' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {surat.sifat}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {surat.perihal}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>Pengirim: <strong className="text-slate-700 font-medium">{surat.pengirim}</strong></span>
                        <span>•</span>
                        <span>Diterima: {new Date(surat.tanggalDiterima).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded bg-blue-100 text-blue-800 uppercase tracking-wide">
                          Posisi: {surat.currentHandlerRole.replace('_', ' ')}
                        </span>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                          Status: {surat.status}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 flex items-center justify-center transition-colors">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm font-semibold text-slate-700">Surat atau agenda tidak ditemukan</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Pastikan nomor surat, nomor agenda, atau perihal yang Anda masukkan sudah benar.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Bagian 'Layanan SIMPADU' (Di bawah Card Pencarian Surat) */}
      <div className="w-full">
        {/* Judul Seksi (Tengah) */}
        <h2 className="text-2xl font-bold text-blue-600 text-center mt-12">
          Layanan SIMPADU
        </h2>

        {/* Sub-judul (Tengah) */}
        <p className="text-sm text-gray-500 text-center mt-1 mb-8">
          Sistem Informasi Manajemen Persuratan dan Disposisi Digital Kecamatan Ujung Pandang
        </p>

        {/* Grid 3 Kolom Responsif */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Kartu 1: Registrasi & Tracking Surat */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-md transition group">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-105 group-hover:bg-blue-100 transition-all">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2.5">
              Registrasi & Tracking Surat
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Pencatatan surat masuk dan surat keluar secara digital sehingga posisi berkas tersimpan aman dan mudah dilacak secara real-time.
            </p>
          </div>

          {/* Kartu 2: Disposisi Digital Cepat */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-md transition group">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 group-hover:bg-emerald-100 transition-all">
              <Send className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2.5">
              Disposisi Digital Cepat
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Proses penerusan instruksi dan disposisi dari Camat ke Kasi, Kasubag, hingga Staf berlangsung cepat, terukur, dan transparan.
            </p>
          </div>

          {/* Kartu 3: Arsip & Lembar Disposisi PDF */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-md transition group">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-105 group-hover:bg-red-100 transition-all">
              <FileText className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2.5">
              Arsip & Lembar Disposisi PDF
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Setiap berkas surat dan riwayat disposisi tersimpan rapi di dalam arsip digital serta dapat dicetak dalam format PDF kapan saja.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

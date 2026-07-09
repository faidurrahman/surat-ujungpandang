import React, { useState } from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Send, CheckCircle, Clock, Users, Paperclip, ArrowLeft, X } from 'lucide-react';
import { SuratMasuk, Disposisi, User } from '../types';
import { cn } from '../utils';

interface LetterDetailProps {
  surat: SuratMasuk;
  disposisiHistory: Disposisi[];
  currentUser: User;
  onBack?: () => void;
  onAction?: (data: any) => Promise<void>;
}

export function LetterDetail({ surat, disposisiHistory, currentUser, onBack, onAction }: LetterDetailProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [tujuanDisposisi, setTujuanDisposisi] = useState("");
  const [namaStaf, setNamaStaf] = useState("");
  const [instruksi, setInstruksi] = useState("");
  const [actionFile, setActionFile] = useState<File | null>(null);
  const [actionFileData, setActionFileData] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com') && url.includes('/view')) {
      return url.replace('/view', '/preview');
    }
    return url;
  };

  const processFile = (f: File) => {
    setActionFile(f);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        const base64 = (event.target.result as string).split(',')[1];
        setActionFileData(base64);
      }
    };
    reader.readAsDataURL(f);
  };

  const handleActionFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleKirim = async () => {
    if (!actionFile || !actionFileData) {
      alert("Bukti Serah Terima Fisik wajib diupload sebelum mengirim disposisi.");
      return;
    }

    let roleBaru = 'ADMIN';
    let statusBaru = 'DITERIMA_FO';
    
    if (tujuanDisposisi === 'camat') { roleBaru = 'CAMAT'; statusBaru = 'MENUNGGU_DISPOSISI_CAMAT'; }
    else if (tujuanDisposisi === 'sekcam') { roleBaru = 'SEKCAM'; statusBaru = 'MENUNGGU_DISPOSISI_SEKCAM'; }
    else if (tujuanDisposisi === 'kasubag_umum' || tujuanDisposisi === 'kasubag_keuangan') { roleBaru = 'KASUBAG'; statusBaru = 'MENUNGGU_DISPOSISI_KASUBAG'; }
    else if (tujuanDisposisi.startsWith('kasi')) { roleBaru = 'KASI'; statusBaru = 'MENUNGGU_DISPOSISI_KASI'; }
    else if (tujuanDisposisi === 'staf_pelaksana') { roleBaru = 'STAF'; statusBaru = 'DIPROSES_STAF'; }

    setIsSubmitting(true);
    try {
      if (onAction) {
        await onAction({
          suratId: surat.id,
          tujuanDisposisi,
          tujuanStaf: namaStaf,
          instruksi,
          statusSuratBaru: statusBaru,
          keUserRoleBaru: roleBaru,
          file: actionFile,
          fileData: actionFileData,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelesai = async () => {
    setIsSubmitting(true);
    try {
      if (onAction) {
        await onAction({
          suratId: surat.id,
          tujuanDisposisi: 'Selesai',
          instruksi,
          statusSuratBaru: 'SELESAI',
          keUserRoleBaru: 'ADMIN',
          file: actionFile,
          fileData: actionFileData,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 lg:gap-6 min-w-0 overflow-hidden h-full">
      {/* Header Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 lg:p-6 shrink-0">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex-1 min-w-0">
            {onBack && (
              <button 
                onClick={onBack}
                className="lg:hidden mb-4 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 px-3 py-1.5 rounded-full w-fit"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Daftar
              </button>
            )}
            <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600 whitespace-nowrap">
                {surat.sifat}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 truncate">{surat.nomorSurat}</span>
            </div>
            <h1 className="text-lg lg:text-xl font-bold text-slate-900 leading-tight mb-3">
              {surat.perihal}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[11px] text-slate-500 font-bold uppercase tracking-wide">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Pengirim: <span className="text-slate-700">{surat.pengirim}</span></span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full" />
              <div className="flex items-center gap-1.5 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                <span>Diterima: {format(new Date(surat.tanggalDiterima), 'dd MMM yyyy • HH:mm', { locale: localeId })}</span>
              </div>
            </div>
          </div>
          {(() => {
            const primaryAttachmentUrl = surat.lampiranUrl || (disposisiHistory.length > 0 ? disposisiHistory[0].lampiranUrl : null);
            return primaryAttachmentUrl ? (
              <button 
                onClick={() => setPreviewUrl(primaryAttachmentUrl)}
                className="flex w-full md:w-auto items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors shrink-0"
              >
                <Paperclip className="w-4 h-4" />
                Lihat Lampiran
              </button>
            ) : (
              <div className="flex w-full md:w-auto items-center justify-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded-lg text-xs font-bold shrink-0 cursor-not-allowed">
                <Paperclip className="w-4 h-4" />
                Tidak Ada Lampiran
              </div>
            );
          })()}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden">
        {/* Timeline Audit Trail */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[300px] overflow-hidden">
          <div className="p-4 bg-slate-900 text-white shrink-0">
            <p className="text-[10px] font-bold opacity-60 uppercase mb-1">Audit Trail / Tracking Surat</p>
            <p className="text-sm font-bold truncate">{surat.nomorSurat}</p>
          </div>
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto relative">
            <div className="absolute left-6 lg:left-8 top-6 lg:top-8 bottom-8 w-0.5 bg-slate-100"></div>
            
            <div className="space-y-6">
              {disposisiHistory.map((disp, index) => {
                const isLast = index === disposisiHistory.length - 1;
                return (
                  <div key={disp.id} className="relative pl-8 lg:pl-10 flex gap-3">
                    <div className={cn(
                      "absolute left-0 w-4 h-4 rounded-full border-4 z-10 -ml-[7px] lg:-ml-[7px]",
                      isLast ? "bg-blue-500 border-blue-100" : "bg-emerald-500 border-white"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("text-xs font-bold break-words", isLast ? "text-blue-600" : "text-slate-900")}>
                          {disp.statusAksi}
                        </p>
                        {disp.lampiranUrl && (
                          <button 
                            onClick={() => setPreviewUrl(disp.lampiranUrl)}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 hover:bg-orange-100 transition-colors shrink-0"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                            Bukti Serah Terima
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        Oleh: {disp.dariUser?.name || 'Sistem'} <span className="hidden sm:inline">({disp.dariUser?.jabatan || '-'})</span>
                      </p>
                      <div className="mt-2 p-3 bg-slate-50 rounded border border-slate-100">
                        <p className="text-xs text-slate-700 italic leading-relaxed break-words">"{disp.instruksi}"</p>
                        {disp.catatanTambahan && (
                          <div className="mt-2 pt-2 border-t border-slate-200">
                            <p className="text-[11px] text-slate-500 font-medium break-words">Catatan: {disp.catatanTambahan}</p>
                          </div>
                        )}
                        {disp.keUser && (
                           <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-1.5 text-[11px] font-bold text-slate-600 flex-wrap">
                             <Send className="w-3 h-3 text-blue-500 shrink-0" />
                             <span className="shrink-0">Diteruskan ke:</span> <span className="text-blue-700 truncate">{disp.keUser.name || 'Sistem'}</span>
                           </div>
                        )}
                      </div>
                      <p className={cn(
                        "text-[10px] mt-2 uppercase font-bold tracking-tight",
                        isLast ? "text-blue-400" : "text-slate-400"
                      )}>
                        {disp.timestamp ? format(new Date(disp.timestamp), 'dd MMM yyyy • HH:mm', { locale: localeId }) : '-'}
                      </p>
                    </div>
                  </div>
                );
              })}

              {surat.status !== 'SELESAI' && surat.currentHandlerRole === currentUser.role && (
                <div className="relative pl-8 lg:pl-10 flex gap-3 opacity-60">
                  <div className="absolute left-0 w-4 h-4 rounded-full bg-slate-200 border-4 border-white z-10 -ml-[7px] lg:-ml-[7px]" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Menunggu Tindakan Anda</p>
                    <p className="text-[11px] text-slate-500">Silakan beri instruksi disposisi</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Form */}
        <div className="w-full lg:w-[340px] shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 shrink-0">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              Formulir Tindakan
            </h3>
          </div>
          <div className="p-4 lg:p-5 overflow-y-auto flex-1 space-y-4 lg:space-y-5">
            {surat.status === 'SELESAI' ? (
              <div className="flex flex-col items-center justify-center py-6 lg:py-8 text-center">
                <CheckCircle className="w-10 h-10 lg:w-12 lg:h-12 text-emerald-500 mb-3" />
                <h4 className="text-sm font-bold text-slate-900">Surat Selesai</h4>
                <p className="text-xs text-slate-500 mt-1">Proses disposisi telah diakhiri.</p>
              </div>
            ) : (
              <>
                {currentUser.role === 'ADMIN' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Teruskan Ke</label>
                      <select 
                        value={tujuanDisposisi}
                        onChange={(e) => setTujuanDisposisi(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors appearance-none"
                      >
                        <option value="">-- Pilih Tujuan --</option>
                        <option value="camat">Camat</option>
                        <option value="sekcam">Sekretaris Camat (Sekcam)</option>
                        <option value="kasubag_umum">Kasubag Umum & Kepegawaian</option>
                        <option value="kasubag_keuangan">Kasubag Keuangan & Perencanaan</option>
                        <option value="kasi_pemerintahan">Kasi Pemerintahan</option>
                        <option value="kasi_trantib">Kasi Trantib</option>
                        <option value="kasi_ekbang">Kasi Ekbang</option>
                        <option value="kasi_kebersihan">Kasi Kebersihan</option>
                        <option value="kasi_pemberdayaan">Kasi Pemberdayaan (Kasiber)</option>
                        <option value="kasi_kesra">Kasi Kesra</option>
                        <option value="staf_pelaksana">Staf Pelaksana</option>
                      </select>
                    </div>
                    {tujuanDisposisi === 'staf_pelaksana' && (
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Nama Staf Pelaksana</label>
                        <input 
                          type="text" 
                          value={namaStaf}
                          onChange={(e) => setNamaStaf(e.target.value)}
                          placeholder="Masukkan nama staf..." 
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                        />
                      </div>
                    )}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    {currentUser.role === 'STAF' ? 'Catatan Tindak Lanjut' : 'Instruksi / Catatan'}
                  </label>
                  <textarea 
                    rows={4}
                    value={instruksi}
                    onChange={(e) => setInstruksi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-colors"
                    placeholder={currentUser.role === 'STAF' ? 'Tuliskan hasil tindak lanjut...' : 'Contoh: Tolong pelajari dan siapkan laporan...'}
                  />
                </div>
                
                {currentUser.role === 'ADMIN' ? (
                  <div className="p-3 lg:p-4 bg-orange-50 rounded-lg border border-orange-200 space-y-3">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-bold text-orange-700 uppercase tracking-wide">
                        Wajib Upload: Bukti Serah Terima Fisik
                      </label>
                    </div>
                    <input type="file" accept="image/*" onChange={handleActionFileInput} className="text-[11px] lg:text-xs w-full file:mr-2 lg:file:mr-3 file:py-1.5 file:px-2 lg:file:px-3 file:rounded file:border-0 file:font-bold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200" />
                    <p className="text-[10px] text-orange-500">
                      {actionFile ? actionFile.name : "Upload foto fisik surat sudah diserahkan (Max 5MB)"}
                    </p>
                  </div>
                ) : currentUser.role === 'STAF' || showReplyForm ? (
                  <div className="p-3 lg:p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        Wajib Upload: {
                          surat.kategori === 'Surat Penelitian' ? 'Draft Surat Balasan' :
                          surat.kategori === 'Surat Ijin KKN' ? 'Draft Surat Rekomendasi' :
                          surat.kategori === 'Surat Ijin Acara' ? 'Draft Surat Ijin Keramaian' :
                          'Draft Tindak Lanjut'
                        }
                      </label>
                      {currentUser.role !== 'STAF' && (
                        <button onClick={() => setShowReplyForm(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600">Batal</button>
                      )}
                    </div>
                    <input type="file" onChange={handleActionFileInput} className="text-[11px] lg:text-xs w-full file:mr-2 lg:file:mr-3 file:py-1.5 file:px-2 lg:file:px-3 file:rounded file:border-0 file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200" />
                    <p className="text-[10px] text-slate-400">
                      {actionFile ? actionFile.name : "PDF/Word (Max 5MB)"}
                    </p>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowReplyForm(true)}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    + Tambah Draft Lampiran
                  </button>
                )}
              </>
            )}
          </div>
          {surat.status !== 'SELESAI' && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex flex-col gap-3">
              <button 
                onClick={handleKirim} 
                disabled={isSubmitting}
                className={cn(
                  "w-full text-white text-xs font-bold py-2.5 rounded-lg shadow-sm transition-colors uppercase tracking-wide",
                  isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Disposisi / Teruskan'}
              </button>
              <div className="flex gap-3">
                <button 
                  disabled={isSubmitting}
                  className={cn(
                    "flex-1 border text-xs font-bold py-2.5 rounded-lg transition-colors uppercase tracking-wide",
                    isSubmitting ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" : "bg-white border-rose-200 text-rose-600 hover:bg-rose-50"
                  )}
                >
                  Kembalikan/Revisi
                </button>
                <button 
                  onClick={handleSelesai} 
                  disabled={isSubmitting}
                  className={cn(
                    "flex-1 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm transition-colors uppercase tracking-wide",
                    isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600"
                  )}
                >
                  {isSubmitting ? 'Menyelesaikan...' : 'Selesai & Tutup Tiket'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {previewUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 lg:p-8 transition-opacity"
          onClick={() => setPreviewUrl(null)}
        >
          <div 
            className="relative w-full max-w-5xl h-full max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-700">Preview Lampiran</h3>
              <button 
                onClick={() => setPreviewUrl(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 w-full bg-slate-100">
              <iframe 
                src={getEmbedUrl(previewUrl)}
                className="w-full h-full border-0"
                title="Document Preview"
                allow="autoplay"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

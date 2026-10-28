import React, { useState } from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Send, CheckCircle, Clock, Users, Paperclip, ArrowLeft, X, ExternalLink } from 'lucide-react';
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
  const [notulenFile, setNotulenFile] = useState<File | null>(null);
  const [notulenFileData, setNotulenFileData] = useState<string>('');
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

  const processNotulenFile = (f: File) => {
    setNotulenFile(f);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        const base64 = (event.target.result as string).split(',')[1];
        setNotulenFileData(base64);
      }
    };
    reader.readAsDataURL(f);
  };

  const handleNotulenFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processNotulenFile(e.target.files[0]);
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
          notulenFile: notulenFile,
          notulenFileData: notulenFileData,
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
          notulenFile: notulenFile,
          notulenFileData: notulenFileData,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 lg:gap-6 min-w-0 overflow-hidden h-full">
      {/* Header Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 lg:p-6 shrink-0">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex-1 min-w-0">
            {onBack && (
              <button 
                onClick={onBack}
                className="lg:hidden mb-3 flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200/60 w-fit"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Daftar
              </button>
            )}
            <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                {surat.sifat}
              </span>
              <span className="text-xs font-mono font-bold text-blue-950 truncate">
                {surat.nomorSurat}
              </span>
            </div>
            <h1 className="text-lg lg:text-xl font-bold text-slate-900 leading-tight mb-2">
              {surat.perihal}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">Pengirim: <strong className="text-slate-800">{surat.pengirim}</strong></span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full" />
              <div className="flex items-center gap-1.5 shrink-0">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Diterima: {format(new Date(surat.tanggalDiterima), 'dd MMM yyyy • HH:mm', { locale: localeId })}</span>
              </div>
            </div>
          </div>
          {(() => {
            const primaryAttachmentUrl = surat.lampiranUrl || (disposisiHistory.length > 0 ? disposisiHistory[0].lampiranUrl : null);
            const notulenUrl = surat.notulenUrl || disposisiHistory.find(d => d.instruksi === 'Lampiran Notulen' || d.statusAksi === 'NOTULEN')?.lampiranUrl;
            return (
              <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                {primaryAttachmentUrl ? (
                  <button 
                    onClick={() => setPreviewUrl(primaryAttachmentUrl)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors w-full shadow-xs"
                  >
                    <Paperclip className="w-4 h-4" />
                    Lihat Lampiran Fisik
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-semibold w-full cursor-not-allowed">
                    <Paperclip className="w-4 h-4" />
                    Tidak Ada Lampiran
                  </div>
                )}
                {notulenUrl && (
                  <button 
                    onClick={() => setPreviewUrl(notulenUrl)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors w-full border border-blue-200"
                  >
                    <Paperclip className="w-4 h-4" />
                    Lihat Notulen
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-y-auto lg:overflow-hidden">
        {/* Timeline Audit Trail */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col min-h-[300px] lg:min-h-0 lg:overflow-hidden shrink-0 lg:shrink">
          <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-indigo-950 text-white shrink-0 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-0.5">Tracking Riwayat Disposisi</p>
              <p className="text-sm font-bold font-mono truncate">{surat.nomorSurat}</p>
            </div>
            <span className="text-[10px] font-bold bg-white/10 px-2.5 py-1 rounded-full text-blue-100 border border-white/20">
              {disposisiHistory.length} Langkah
            </span>
          </div>
          <div className="flex-1 p-5 lg:p-6 overflow-y-auto relative">
            <div className="absolute left-7 lg:left-9 top-6 lg:top-8 bottom-8 w-0.5 bg-blue-100"></div>
            
            <div className="space-y-6">
              {disposisiHistory.map((disp, index) => {
                const isLast = index === disposisiHistory.length - 1;
                return (
                  <div key={disp.id} className="relative pl-8 lg:pl-10 flex gap-3">
                    <div className={cn(
                      "absolute left-0 w-4 h-4 rounded-full border-4 z-10 -ml-[7px] lg:-ml-[7px]",
                      isLast ? "bg-blue-600 border-blue-100" : "bg-emerald-500 border-white shadow-xs"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("text-xs font-bold break-words", isLast ? "text-blue-700" : "text-slate-900")}>
                          {disp.statusAksi}
                        </p>
                        {disp.lampiranUrl && (
                          <button 
                            onClick={() => setPreviewUrl(disp.lampiranUrl)}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors shrink-0"
                          >
                            <Paperclip className="w-3 h-3 text-blue-600" />
                            Bukti Serah Terima
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        Oleh: <strong className="text-slate-700">{disp.dariUser?.name || 'Sistem'}</strong> <span className="hidden sm:inline text-slate-400">({disp.dariUser?.jabatan || '-'})</span>
                      </p>
                      <div className="mt-2 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                        <p className="text-xs text-slate-700 italic leading-relaxed break-words">"{disp.instruksi}"</p>
                        {disp.catatanTambahan && (
                          <div className="mt-2 pt-2 border-t border-slate-200">
                            <p className="text-xs text-slate-500 font-medium break-words">Catatan: {disp.catatanTambahan}</p>
                          </div>
                        )}
                        {disp.keUser && (
                           <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-1.5 text-xs font-bold text-slate-600 flex-wrap">
                             <Send className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                             <span className="shrink-0">Diteruskan ke:</span> <span className="text-blue-800 truncate">{disp.keUser.name || 'Sistem'}</span>
                           </div>
                        )}
                      </div>
                      <p className={cn(
                        "text-[10px] mt-2 uppercase font-bold tracking-tight",
                        isLast ? "text-blue-600" : "text-slate-400"
                      )}>
                        {disp.timestamp ? format(new Date(disp.timestamp), 'dd MMM yyyy • HH:mm', { locale: localeId }) : '-'}
                      </p>
                    </div>
                  </div>
                );
              })}

              {surat.status !== 'SELESAI' && surat.currentHandlerRole === currentUser.role && (
                <div className="relative pl-8 lg:pl-10 flex gap-3 opacity-75">
                  <div className="absolute left-0 w-4 h-4 rounded-full bg-blue-200 border-4 border-white z-10 -ml-[7px] lg:-ml-[7px]" />
                  <div>
                    <p className="text-xs font-bold text-blue-900">Menunggu Tindakan Anda</p>
                    <p className="text-[11px] text-slate-500">Silakan beri instruksi disposisi pada formulir</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Form */}
        <div className="w-full lg:w-[360px] shrink-0 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:overflow-hidden">
          <div className="p-4 bg-blue-50/50 border-b border-slate-200/80 shrink-0">
            <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wide flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              Formulir Tindakan Disposisi
            </h3>
          </div>
          <div className="p-4 lg:p-5 overflow-y-auto flex-1 space-y-4">
            {surat.status === 'SELESAI' ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
                <h4 className="text-sm font-bold text-slate-900">Surat Selesai</h4>
                <p className="text-xs text-slate-500 mt-1">Proses disposisi dan tindak lanjut telah diakhiri.</p>
              </div>
            ) : (
              <>
                {currentUser.role === 'ADMIN' ? (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Teruskan Ke</label>
                      <select 
                        value={tujuanDisposisi}
                        onChange={(e) => setTujuanDisposisi(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
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
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Nama Staf Pelaksana</label>
                        <input 
                          type="text" 
                          value={namaStaf}
                          onChange={(e) => setNamaStaf(e.target.value)}
                          placeholder="Masukkan nama staf..." 
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                        />
                      </div>
                    )}
                  </div>
                ) : null}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    {currentUser.role === 'STAF' ? 'Catatan Tindak Lanjut' : 'Instruksi / Catatan'}
                  </label>
                  <textarea 
                    rows={4}
                    value={instruksi}
                    onChange={(e) => setInstruksi(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none transition-all"
                    placeholder={currentUser.role === 'STAF' ? 'Tuliskan hasil tindak lanjut...' : 'Contoh: Tolong pelajari dan siapkan laporan...'}
                  />
                </div>
                
                {currentUser.role === 'ADMIN' ? (
                  <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2.5">
                    <label className="block text-xs font-bold text-amber-900 uppercase tracking-wide">
                      Wajib Upload: Bukti Serah Terima Fisik
                    </label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleActionFileInput} 
                      className="text-xs w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer" 
                    />
                    <p className="text-[11px] text-amber-700">
                      {actionFile ? actionFile.name : "Upload foto bukti serah terima fisik (Max 5MB)"}
                    </p>
                  </div>
                ) : currentUser.role === 'STAF' || showReplyForm ? (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
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
                    <input 
                      type="file" 
                      onChange={handleActionFileInput} 
                      className="text-xs w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer" 
                    />
                    <p className="text-[11px] text-slate-500">
                      {actionFile ? actionFile.name : "PDF/Word (Max 5MB)"}
                    </p>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowReplyForm(true)}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 py-1"
                  >
                    + Tambah Draft Lampiran
                  </button>
                )}

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Upload Notulen (Opsional)
                  </label>
                  <input 
                    type="file" 
                    onChange={handleNotulenFileInput} 
                    className="text-xs w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer" 
                  />
                  <p className="text-[11px] text-slate-500">
                    {notulenFile ? notulenFile.name : "Bebas semua format file (Max 5MB)"}
                  </p>
                </div>
              </>
            )}
          </div>
          {surat.status !== 'SELESAI' && (
            <div className="p-4 bg-slate-50 border-t border-slate-200/80 shrink-0 flex flex-col gap-2.5">
              <button 
                onClick={handleKirim} 
                disabled={isSubmitting}
                className={cn(
                  "w-full text-white text-xs font-bold py-3 rounded-xl shadow-xs transition-colors uppercase tracking-wide",
                  isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Disposisi / Teruskan'}
              </button>
              <div className="flex gap-2">
                <button 
                  disabled={isSubmitting}
                  className={cn(
                    "flex-1 border text-xs font-bold py-2.5 rounded-xl transition-colors uppercase tracking-wide",
                    isSubmitting ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" : "bg-white border-rose-200 text-rose-600 hover:bg-rose-50"
                  )}
                >
                  Revisi
                </button>
                <button 
                  onClick={handleSelesai} 
                  disabled={isSubmitting}
                  className={cn(
                    "flex-1 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors uppercase tracking-wide",
                    isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                  )}
                >
                  {isSubmitting ? 'Menyelesaikan...' : 'Selesai'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {previewUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 lg:p-8 transition-opacity"
          onClick={() => setPreviewUrl(null)}
        >
          <div 
            className="relative w-full max-w-5xl h-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-blue-50/50 text-blue-950 shrink-0">
              <h3 className="font-bold text-sm text-blue-950 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-blue-600" />
                Preview Lampiran Dokumen
              </h3>
              <button 
                onClick={() => setPreviewUrl(null)}
                className="p-1.5 hover:bg-white rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
                aria-label="Tutup"
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

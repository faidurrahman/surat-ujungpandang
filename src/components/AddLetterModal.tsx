import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, UploadCloud, FileText } from 'lucide-react';
import { KategoriSurat } from '../types';
import { cn } from '../utils';

interface AddLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function AddLetterModal({ isOpen, onClose, onSave }: AddLetterModalProps) {
  const [formData, setFormData] = useState({
    nomorAgenda: '',
    tanggalDiterima: format(new Date(), 'yyyy-MM-dd'),
    pengirim: '',
    nomorSurat: '',
    tanggalSurat: '',
    perihal: '',
    sifat: 'Biasa',
    kategori: 'Undangan Umum' as KategoriSurat | 'Umum',
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<string>('');
  
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const processFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        // Extract base64 part
        const base64 = (event.target.result as string).split(',')[1];
        setFileData(base64);
      }
    };
    reader.readAsDataURL(f);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity">
      <div className="bg-white w-full lg:max-w-2xl h-full flex flex-col shadow-2xl overflow-hidden border-l border-slate-200/80 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 lg:p-6 border-b border-slate-200/80 bg-blue-50/50 text-blue-950 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-blue-950">Tambah Surat Masuk</h2>
            <p className="text-xs text-blue-800/70 mt-0.5">Isi metadata surat dan unggah dokumen fisik.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-xl transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-6">
          <div className="space-y-5">
            
            {/* Row 1: Agenda & Tgl Diterima */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Nomor Agenda</label>
                <input 
                  type="text" 
                  name="nomorAgenda"
                  value={formData.nomorAgenda}
                  onChange={handleChange}
                  placeholder="Contoh: 001/AG/2026"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Tanggal Diterima</label>
                <input 
                  type="date" 
                  name="tanggalDiterima"
                  value={formData.tanggalDiterima}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Asal Surat */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Asal Surat / Pengirim</label>
              <input 
                type="text" 
                name="pengirim"
                value={formData.pengirim}
                onChange={handleChange}
                placeholder="Nama Instansi, Dinas, atau Warga"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>

            {/* Row 3: Nomor Surat & Tanggal Surat */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Nomor Surat</label>
                <input 
                  type="text" 
                  name="nomorSurat"
                  value={formData.nomorSurat}
                  onChange={handleChange}
                  placeholder="Sesuai fisik surat"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Tanggal Surat</label>
                <input 
                  type="date" 
                  name="tanggalSurat"
                  value={formData.tanggalSurat}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Perihal */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Perihal / Hal</label>
              <textarea 
                name="perihal"
                value={formData.perihal}
                onChange={handleChange}
                rows={3}
                placeholder="Tuliskan perihal surat dengan jelas..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none"
              />
            </div>

            {/* Row 4: Sifat & Kategori */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Sifat Surat</label>
                <select 
                  name="sifat"
                  value={formData.sifat}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                >
                  <option value="Biasa">Biasa</option>
                  <option value="Segera">Segera</option>
                  <option value="Penting">Penting</option>
                  <option value="Rahasia">Rahasia</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Kategori Surat</label>
                <select 
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                >
                  <option value="Undangan Umum">Umum</option>
                  <option value="Surat Penelitian">Surat Penelitian</option>
                  <option value="Surat Ijin KKN">Surat Ijin KKN</option>
                  <option value="Surat Ijin Acara">Surat Ijin Acara</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            {/* Upload Area */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Upload Lampiran Fisik (Scan)</label>
              <div 
                className={cn(
                  "relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all",
                  dragActive ? "border-blue-500 bg-blue-50/50" : "border-slate-200 bg-slate-50 hover:bg-slate-100/70"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  accept=".pdf, .jpg, .jpeg, .png" 
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 bg-white rounded-xl shadow-xs border border-slate-200 flex items-center justify-center mb-3 text-blue-600">
                  {file ? <FileText className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
                </div>
                <p className="text-sm font-bold text-slate-800 mb-1">
                  {file ? file.name : "Tarik & letakkan berkas di sini, atau klik untuk memilih"}
                </p>
                <p className="text-xs text-slate-400">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Format: PDF, JPG, PNG (Maksimal 10MB)"}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 lg:p-6 border-t border-slate-200/80 bg-slate-50/50 flex gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-bold text-sm rounded-xl hover:bg-white transition-colors"
          >
            Batal
          </button>
          <button 
            disabled={!!(file && !fileData)}
            onClick={() => {
              onSave({ ...formData, file, fileData });
              onClose();
            }}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {file && !fileData ? 'Memproses File...' : 'Simpan & Proses'}
          </button>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, UploadCloud, FileText } from 'lucide-react';
import { cn } from '../utils';

interface AddSuratKeluarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function AddSuratKeluarModal({ isOpen, onClose, onSave }: AddSuratKeluarModalProps) {
  const [formData, setFormData] = useState({
    nomorSurat: '',
    tanggalDraft: format(new Date(), 'yyyy-MM-dd'),
    perihal: '',
    status: 'DRAFT',
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200/80 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 lg:p-6 border-b border-slate-200/80 bg-blue-50/50 text-blue-950 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-blue-950">Buat Surat Keluar Baru</h2>
            <p className="text-xs text-blue-800/70 mt-0.5 font-medium">Isi formulir untuk membuat draft surat keluar.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-xl transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 lg:p-6">
          <div className="space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Nomor Surat (Jika ada)</label>
                <input 
                  type="text" 
                  name="nomorSurat"
                  value={formData.nomorSurat}
                  onChange={handleChange}
                  placeholder="Kosongkan jika masih draft"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Tanggal Draft</label>
                <input 
                  type="date" 
                  name="tanggalDraft"
                  value={formData.tanggalDraft}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Perihal</label>
              <textarea 
                name="perihal"
                value={formData.perihal}
                onChange={handleChange}
                rows={3}
                placeholder="Tuliskan perihal surat keluar..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Status Awal</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="MENUNGGU_APPROVAL">MENUNGGU APPROVAL</option>
                <option value="DISETUJUI">DISETUJUI</option>
                <option value="DIKIRIM">DIKIRIM</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Upload Draft Surat (Opsional)</label>
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
                  accept=".pdf, .doc, .docx" 
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
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Format: PDF, DOC, DOCX (Maksimal 10MB)"}
                </p>
              </div>
            </div>

          </div>
        </div>

        <div className="p-5 lg:p-6 border-t border-slate-200/80 bg-slate-50/50 flex gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-bold text-sm rounded-xl hover:bg-white transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={() => {
              onSave({ ...formData, file, fileData });
              onClose();
            }}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-sm transition-colors"
          >
            Simpan Draft
          </button>
        </div>
      </div>
    </div>
  );
}

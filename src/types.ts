export type Role = 'FRONT_OFFICE' | 'CAMAT' | 'ADMIN' | 'SEKCAM' | 'KASUBAG' | 'KASI' | 'STAF';

export type StatusSurat = 
  | 'DITERIMA_FO' 
  | 'MENUNGGU_DISPOSISI_CAMAT' 
  | 'MENUNGGU_TERUSAN_ADMIN'
  | 'MENUNGGU_DISPOSISI_SEKCAM'
  | 'MENUNGGU_DISPOSISI_KASUBAG' 
  | 'MENUNGGU_DISPOSISI_KASI' 
  | 'DIPROSES_STAF' 
  | 'SELESAI';

export type KategoriSurat = 'Surat Penelitian' | 'Surat Ijin KKN' | 'Surat Ijin Acara' | 'Undangan Umum' | 'Lainnya';

export interface User {
  id: string;
  name: string;
  nip: string;
  role: Role;
  jabatan: string;
}

export interface SuratMasuk {
  id: string;
  nomorSurat: string;
  tanggalSurat: string;
  tanggalDiterima: string;
  pengirim: string;
  perihal: string;
  sifat: 'Biasa' | 'Penting' | 'Segera' | 'Rahasia';
  kategori: KategoriSurat;
  status: StatusSurat;
  lampiranUrl?: string;
  notulenUrl?: string;
  currentHandlerRole: Role;
  lastActionDate: string;
}

export interface Disposisi {
  id: string;
  suratId: string;
  dariUser: User;
  keUser: User | null; // null jika selesai
  instruksi: string;
  catatanTambahan?: string;
  timestamp: string;
  statusAksi: string; // e.g., "Diteruskan ke Kasubag", "Surat Selesai Diproses"
  lampiranUrl?: string;
}

export interface SuratKeluar {
  id: string;
  suratMasukId: string;
  nomorSurat: string | null; // Null if still draft
  tanggalDraft: string;
  perihal: string;
  status: 'DRAFT' | 'MENUNGGU_APPROVAL' | 'DISETUJUI' | 'DIKIRIM';
  draftUrl?: string;
}

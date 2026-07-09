import { SuratMasuk, Disposisi, User } from './types';

export const currentUser: User = {
  id: 'u5',
  name: 'Hafsah Sari',
  nip: '198802142010021004',
  role: 'ADMIN',
  jabatan: 'Admin Persuratan'
};

export const users: User[] = [
  { id: 'u1', name: 'Siti Aminah', nip: '199001012015042001', role: 'FRONT_OFFICE', jabatan: 'Resepsionis FO' },
  { id: 'u2', name: 'Nanin Sudiar, A.P', nip: '19760625 199412 2 001', role: 'CAMAT', jabatan: 'Camat' },
  { id: 'u3', name: 'Andi Pratama, S.STP', nip: '198506152008011003', role: 'KASUBAG', jabatan: 'Kasubag Umum & Kepegawaian' },
  { id: 'u4', name: 'Rini Wulandari, S.Kom', nip: '199211202019022005', role: 'STAF', jabatan: 'Staf Pelaksana Administrasi' },
  { id: 'u5', name: 'Hafsah Sari', nip: '198802142010021004', role: 'ADMIN', jabatan: 'Admin Persuratan' },
  { id: 'u6', name: 'Ir. Ahmad Zaelani', nip: '197005111999031002', role: 'SEKCAM', jabatan: 'Sekretaris Camat' },
  { id: 'u7', name: 'Dewi Sartika, S.IP', nip: '198207182006042003', role: 'KASI', jabatan: 'Kasi Pemerintahan' }
];

export const mockSuratMasuk: SuratMasuk[] = [
  {
    id: 'SM-2023-10-001',
    nomorSurat: '005/123/DISDIK/2023',
    tanggalSurat: '2023-10-24T00:00:00Z',
    tanggalDiterima: '2023-10-25T08:30:00Z',
    pengirim: 'Dinas Pendidikan Kabupaten',
    perihal: 'Undangan Rapat Koordinasi Program Wajib Belajar',
    sifat: 'Penting',
    kategori: 'Undangan Umum',
    status: 'MENUNGGU_TERUSAN_ADMIN',
    currentHandlerRole: 'ADMIN',
    lastActionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago (bottleneck)
  },
  {
    id: 'SM-2023-10-002',
    nomorSurat: '100/45/PEMDES/2023',
    tanggalSurat: '2023-10-23T00:00:00Z',
    tanggalDiterima: '2023-10-24T10:15:00Z',
    pengirim: 'Pemerintah Desa Suka Makmur',
    perihal: 'Permohonan Fasilitasi Sengketa Batas Desa',
    sifat: 'Segera',
    kategori: 'Lainnya',
    status: 'DIPROSES_STAF',
    currentHandlerRole: 'STAF',
    lastActionDate: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 26 hours ago
  },
  {
    id: 'SM-2023-10-003',
    nomorSurat: '400/88/DINKES/2023',
    tanggalSurat: '2023-10-20T00:00:00Z',
    tanggalDiterima: '2023-10-21T09:00:00Z',
    pengirim: 'Dinas Kesehatan',
    perihal: 'Pemberitahuan Jadwal Vaksinasi Massal Tingkat Kecamatan',
    sifat: 'Biasa',
    kategori: 'Lainnya',
    status: 'SELESAI',
    currentHandlerRole: 'FRONT_OFFICE', // Or whoever finalized it
    lastActionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const mockDisposisi: Disposisi[] = [
  {
    id: 'D-001',
    suratId: 'SM-2023-10-002',
    dariUser: users[0], // FO
    keUser: users[1], // Camat
    instruksi: 'Mohon arahan Bapak Camat',
    timestamp: '2023-10-24T10:20:00Z',
    statusAksi: 'Surat Diterima & Diregistrasi'
  },
  {
    id: 'D-001a',
    suratId: 'SM-2023-10-002',
    dariUser: users[1], // Camat
    keUser: users[4], // Admin
    instruksi: 'Tolong teruskan disposisi ini ke Kasubag Umum.',
    timestamp: '2023-10-24T13:45:00Z',
    statusAksi: 'Disposisi Pimpinan'
  },
  {
    id: 'D-002',
    suratId: 'SM-2023-10-002',
    dariUser: users[4], // Admin
    keUser: users[2], // Kasubag
    instruksi: 'Meneruskan disposisi Bapak Camat untuk dipelajari.',
    catatanTambahan: 'Bukti fisik sudah diserahkan (lampiran foto terlampir).',
    timestamp: '2023-10-24T14:15:00Z',
    statusAksi: 'Diteruskan ke Kasubag'
  },
  {
    id: 'D-003',
    suratId: 'SM-2023-10-002',
    dariUser: users[2], // Kasubag
    keUser: users[3], // Staf
    instruksi: 'Siapkan draft surat undangan mediasi untuk Kades terkait minggu depan.',
    catatanTambahan: 'Gunakan format standar undangan sengketa.',
    timestamp: '2023-10-25T08:10:00Z',
    statusAksi: 'Diteruskan ke Staf Pelaksana'
  },
  // Surat 1
  {
    id: 'D-004',
    suratId: 'SM-2023-10-001',
    dariUser: users[0], // FO
    keUser: users[1], // Camat
    instruksi: 'Undangan Rakor dari Disdik',
    timestamp: '2023-10-25T08:35:00Z',
    statusAksi: 'Surat Diterima & Diregistrasi'
  }
];

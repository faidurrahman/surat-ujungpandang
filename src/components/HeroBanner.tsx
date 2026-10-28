import React from 'react';
import { SuratMasuk } from '../types';
import { MakassarLogo } from './MakassarLogo';

interface HeroBannerProps {
  suratList?: SuratMasuk[];
  onSelectSurat?: (id: string) => void;
  onFocusSearch?: () => void;
}

export function HeroBanner(_props: HeroBannerProps) {
  return (
    <div className="w-full relative z-10 mt-0 py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 text-center text-white">
      {/* Radial ambient glow in the center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
        {/* Logo Resmi E-Persuratan */}
        <div className="mb-2 sm:mb-3 transform transition-transform hover:scale-105 duration-300">
          <MakassarLogo className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
        </div>

        {/* Judul Utama (SIMPADU) */}
        <h1 className="text-3xl sm:text-4xl md:text-[42px] font-bold text-white tracking-tight leading-tight uppercase drop-shadow-sm">
          SIMPADU
        </h1>

        {/* Sub-judul Baris 1 */}
        <p className="text-base sm:text-lg md:text-[20px] font-semibold text-white mt-2 leading-snug">
          Sistem Informasi Manajemen Persuratan dan Disposisi Ujung Pandang
        </p>

        {/* Sub-judul Baris 2 */}
        <p className="text-xs sm:text-sm md:text-[15px] font-normal text-white/90 mt-1.5 max-w-2xl px-2 leading-normal">
          Digitalisasi Pelayanan Administrasi dan Tracking Surat Kecamatan Ujung Pandang, Kota Makassar
        </p>
      </div>
    </div>
  );
}

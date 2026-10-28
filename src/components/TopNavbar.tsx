import React from 'react';
import { Clock, Mail, FileText, Send, Archive, Menu, LogOut } from 'lucide-react';
import { cn } from '../utils';
import { MakassarLogo } from './MakassarLogo';
import { NetworkBackground } from './NetworkBackground';

interface TopNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMobileMenu: () => void;
  onLogout: () => void;
  isLoading?: boolean;
}

export function TopNavbar({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
  onLogout,
  isLoading = false,
}: TopNavbarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Clock },
    { id: 'masuk', label: 'Surat Masuk', icon: Mail },
    { id: 'keluar', label: 'Surat Keluar', icon: FileText },
    { id: 'disposisi', label: 'Disposisi Aktif', icon: Send },
    { id: 'arsip', label: 'Arsip Selesai', icon: Archive },
  ];

  return (
    <nav className="w-full relative z-20 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-950 border-b border-white/10 shadow-lg shadow-blue-950/40">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <NetworkBackground className="opacity-15" />
      </div>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative z-10 gap-2 sm:gap-4">
        {/* Sisi Kiri: Logo & Nama Instansi (+ Tombol Hamburger di Mobile) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <button 
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 -ml-1 text-blue-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0"
            aria-label="Buka Menu Navigasi"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group"
            onClick={() => setActiveTab('dashboard')}
            title="Kembali ke Dashboard"
          >
            <MakassarLogo className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 transition-transform group-hover:scale-105 duration-200" />
            <div className="min-w-0">
              <h1 className="text-white font-bold text-lg leading-tight tracking-tight truncate">
                SIMPADU
              </h1>
              <span className="text-xs text-blue-100 font-normal block mt-0.5 truncate">
                E-Persuratan Kec. Ujung Pandang
              </span>
            </div>
          </div>
        </div>

        {/* Bagian Tengah Navbar: 5 Menu Utama Horizontal (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 xl:px-3.5 xl:py-2 text-xs xl:text-sm font-semibold rounded-lg transition-all duration-200 relative group",
                  isActive 
                    ? "bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-xs" 
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-blue-200 group-hover:text-white")} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bagian Kanan Navbar: Info Profil Pengguna & Tombol Logout */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isLoading && (
            <span className="text-[10px] sm:text-[11px] text-blue-200 font-bold bg-white/10 px-2.5 py-1 rounded-full border border-white/20 animate-pulse hidden sm:inline-flex items-center gap-1">
              Sinkronisasi...
            </span>
          )}

          {/* Profil Desktop */}
          <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-white/15">
            <div className="w-8 h-8 rounded-full bg-blue-500/30 border border-white/30 flex items-center justify-center text-white font-bold text-xs shadow-inner shrink-0">
              NS
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs text-white font-bold leading-tight truncate">Nanin Sudiar, A.P</p>
              <p className="text-[10px] text-blue-200 font-medium leading-tight truncate">Camat / NIP. 19760625 199412 2 001</p>
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-white/10 hover:bg-rose-600/90 rounded-lg border border-white/20 hover:border-rose-400 transition-colors shadow-xs ml-2 cursor-pointer"
              title="Keluar dari sistem"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Profil & Logout Mobile */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-500/30 border border-white/30 flex items-center justify-center text-white font-bold text-[10px] shadow-inner shrink-0">
              NS
            </div>
            <button 
              onClick={onLogout}
              className="p-1.5 text-blue-100 hover:text-rose-300 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Keluar dari sistem"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

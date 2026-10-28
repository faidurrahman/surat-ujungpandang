import React from 'react';
import { Mail, Send, FileText, Clock, Archive, X } from 'lucide-react';
import { cn } from '../utils';
import { MakassarLogo } from './MakassarLogo';
import { NetworkBackground } from './NetworkBackground';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Clock },
    { id: 'masuk', label: 'Surat Masuk', icon: Mail },
    { id: 'keluar', label: 'Surat Keluar', icon: FileText },
    { id: 'disposisi', label: 'Disposisi Aktif', icon: Send },
    { id: 'arsip', label: 'Arsip Selesai', icon: Archive },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Off-canvas Mobile Drawer */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-gradient-to-b from-blue-600 via-blue-700 to-indigo-950 text-white shadow-2xl border-r border-blue-500/30 overflow-hidden flex flex-col shrink-0 transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
      )}>
        {/* Network / Constellation Geometric SVG Lines */}
        <NetworkBackground />

        {/* Header Sidebar (Logo & Nama Instansi) */}
        <div className="relative z-10 p-5 border-b border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <MakassarLogo className="w-10 h-10" />
            <div className="min-w-0">
              <h1 className="text-white font-bold text-lg leading-tight tracking-tight">
                SIMPADU
              </h1>
              <span className="text-xs text-blue-100 font-normal block mt-0.5 truncate">
                E-Persuratan Kec. Ujung Pandang
              </span>
            </div>
          </div>
          <button 
            className="lg:hidden text-blue-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setIsOpen(false)}
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation Menu */}
        <nav className="relative z-10 flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-bold text-blue-200/70 uppercase tracking-wider">
            Menu Utama
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-sm transition-all duration-200 relative group",
                  isActive 
                    ? "bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl border border-white/30 shadow-sm pl-4" 
                    : "text-blue-100 hover:bg-white/10 hover:text-white hover:translate-x-1 rounded-xl"
                )}
              >
                {/* Glowing White Indicator on active left edge */}
                {isActive && (
                  <span className="absolute left-1.5 top-2.5 bottom-2.5 w-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                )}
                <Icon className={cn("w-5 h-5 shrink-0 transition-transform duration-200", isActive ? "text-white" : "text-blue-200 group-hover:text-white group-hover:scale-110")} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Area Profil Bawah */}
        <div className="relative z-10 p-4 mt-auto bg-indigo-950/50 backdrop-blur-sm border-t border-white/15 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/30 border border-white/30 flex items-center justify-center text-white font-bold shadow-inner shrink-0">
              NS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-bold truncate">Nanin Sudiar, A.P</p>
              <p className="text-[11px] text-blue-200 font-medium truncate">Camat / NIP. 19760625 199412 2 001</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

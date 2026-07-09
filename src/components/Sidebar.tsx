import React from 'react';
import { Mail, Send, FileText, Clock, Archive, X } from 'lucide-react';
import { cn } from '../utils';

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
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col shrink-0 overflow-hidden text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shrink-0">
              E
            </div>
            <h1 className="text-white font-semibold text-lg leading-tight tracking-tight">
              E-PERSURATAN<br/>
              <span className="text-xs text-slate-400 font-normal uppercase tracking-widest block mt-0.5">Smart ASN v2.4</span>
            </h1>
          </div>
          <button 
            className="lg:hidden text-slate-400 hover:text-white p-1 -mr-2"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Menu Utama</div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors text-left",
                  isActive 
                    ? "bg-blue-600/10 text-blue-400" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-white font-bold shrink-0">
              NS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">Nanin Sudiar, A.P</p>
              <p className="text-xs text-slate-500 truncate">Camat / NIP. 19760625 199412 2 001</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

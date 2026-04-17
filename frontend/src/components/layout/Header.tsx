import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search,
  Bell,
  Moon,
  Sun,
  LogOut,
  Zap,
  Globe,
  Database,
  Terminal,
  Grid
} from 'lucide-react';
import React, { useState } from 'react';
import clsx from 'clsx';

const pageTitles: Record<string, string> = {
  '/': 'Hub Principal',
  '/drive': 'Cloud Storage',
  '/docs': 'Smart Editor',
  '/sheets': 'Data Analytics',
  '/slides': 'Premium Slides',
  '/forms': 'Data Capture',
  '/chat': 'Live Communication',
  '/settings': 'OS Settings',
  '/expenses': 'Financial Intelligence',
  '/projects': 'Business Strategy',
  '/calendar': 'Chronology',
  '/backups': 'Safe Cloud',
  '/system': 'System Health',
};

export default function Header() {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'desksuitedark' : 'desksuite');
  };

  const title = Object.entries(pageTitles).find(([path]) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path)
  )?.[1] || 'Workspace';

  return (
    <header className="h-24 bg-white/50 backdrop-blur-2xl border-b border-base-content/5 flex items-center justify-between px-10 z-30 shrink-0 sticky top-0">
      {/* Title & Context */}
      <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-4 duration-700">
          <h2 className="text-2xl font-black tracking-tighter text-base-content italic uppercase">{title}</h2>
          <div className="flex items-center gap-3">
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] leading-none">OS v1.0 • Espace {user?.current_tenant?.name || 'Michel'}</span>
          </div>
      </div>

      {/* Center Search - Minimalist Premium */}
      <div className="flex-1 max-w-2xl px-12 hidden lg:block">
          <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-base-content/20 group-focus-within:text-primary group-hover:text-primary transition-all duration-300" />
              <input 
                  type="text" 
                  placeholder="Rechercher des documents, flux financiers ou tâches..."
                  className="input input-ghost w-full h-14 pl-16 bg-base-200/50 rounded-[20px] text-sm font-medium border-none ring-1 ring-transparent focus:ring-primary/20 focus:bg-white focus:shadow-2xl transition-all duration-300 placeholder:text-base-content/20"
              />
          </div>
      </div>

      {/* Unified Right Actions */}
      <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-circle btn-md hover:bg-primary/5 hover:text-primary transition-all relative">
                <Bell className="w-5.5 h-5.5 opacity-40 group-hover:opacity-100" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary border-2 border-white rounded-full" />
            </button>
            <button className="btn btn-ghost btn-circle btn-md hover:bg-primary/5 hover:text-primary transition-all">
                <Grid className="w-5.5 h-5.5 opacity-40" />
            </button>
          </div>

          <div className="h-10 w-px bg-base-content/5" />

          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => document.getElementById('user-menu')?.show()}>
              <div className="text-right hidden sm:block">
                  <p className="text-sm font-black tracking-tight text-base-content group-hover:text-primary transition-colors">{user?.full_name?.split(' ')[0] || 'Admin'}</p>
                  <p className="text-[9px] font-black text-base-content/30 uppercase tracking-[0.25em] leading-none mt-0.5">Premium Plan</p>
              </div>
              
              <div className="avatar">
                  <div className="w-12 h-12 rounded-[18px] ring-2 ring-primary/20 ring-offset-2 ring-offset-base-100 transition-all hover:scale-105 active:scale-95 shadow-xl">
                       <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.full_name}&background=6366f1&color=fff`} />
                  </div>
              </div>

              <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm p-0 flex items-center justify-center opacity-30 hover:opacity-100">
                      <LogOut className="w-4 h-4 text-error" onClick={logout} />
                  </div>
              </div>
          </div>
      </div>
    </header>
  );
}

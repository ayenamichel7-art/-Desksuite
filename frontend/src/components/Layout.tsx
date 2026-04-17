import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  HardDrive,
  Table2,
  Presentation,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  User,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import clsx from 'clsx';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: HardDrive, label: 'Drive', path: '/drive' },
    { icon: FileText, label: 'Documents', path: '/docs' },
    { icon: Table2, label: 'Tableurs', path: '/sheets' },
    { icon: Presentation, label: 'Présentations', path: '/slides' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-base-200/50 flex overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={clsx(
          "relative h-screen bg-base-100 border-r border-base-content/5 transition-all duration-500 ease-in-out z-40 flex flex-col group/sidebar",
          isSidebarOpen ? "w-72" : "w-24"
        )}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-10 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-50 opacity-0 group-hover/sidebar:opacity-100"
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Logo Section */}
        <div className="p-8 flex items-center gap-4 overflow-hidden whitespace-nowrap">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className={clsx("transition-all duration-300", isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 pointer-events-none")}>
            <span className="text-xl font-black italic tracking-tighter text-base-content">DESKSUITE</span>
            <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-secondary" />
                <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest leading-none">PREMIUM HUB</span>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "sidebar-item group/item",
                  active && "active",
                  !isSidebarOpen && "justify-center px-0"
                )}
              >
                <div className={clsx(
                  "p-2 rounded-xl transition-all duration-300",
                  active ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-base-200/50 text-base-content/40 group-hover/item:bg-primary/10 group-hover/item:text-primary"
                )}>
                    <Icon className="w-5 h-5 shrink-0" />
                </div>
                {isSidebarOpen && (
                  <span className="flex-1 tracking-tight">{item.label}</span>
                )}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-neutral text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover/item:opacity-100 transition-opacity whitespace-nowrap font-bold z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card / Bottom Section */}
        <div className="p-4 mt-auto border-t border-base-content/5">
           <div className={clsx(
               "p-3 rounded-2xl bg-base-200/50 flex items-center gap-4 transition-all overflow-hidden",
               !isSidebarOpen && "justify-center"
           )}>
               <div className="avatar placeholder shrink-0">
                  <div className="bg-secondary text-white w-10 h-10 rounded-xl font-black">
                    <User className="w-5 h-5" />
                  </div>
               </div>
               {isSidebarOpen && (
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-black truncate">{user?.full_name || 'Utilisateur'}</p>
                    <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest truncate">Administrateur</p>
                 </div>
               )}
           </div>
           
           <button 
             onClick={logout}
             className={clsx(
                "mt-2 w-full flex items-center gap-4 p-3 rounded-2xl text-error hover:bg-error/10 transition-all font-bold text-sm",
                !isSidebarOpen && "justify-center"
             )}
           >
              <LogOut className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span>Déconnexion</span>}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-base-100/50 backdrop-blur-md border-b border-base-content/5 flex items-center justify-between px-8 z-30">
           <div className="flex items-center gap-4 flex-1 max-w-xl">
              <div className="relative w-full group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30 group-focus-within:text-primary transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Rechercher des documents, clients, flux..." 
                   className="input input-ghost w-full pl-12 h-11 bg-base-200/50 rounded-xl text-sm font-medium focus:bg-base-200 transition-all border-none outline-none"
                 />
              </div>
           </div>

           <div className="flex items-center gap-6 pl-8">
              <div className="indicator cursor-pointer hover:scale-110 transition-transform">
                <span className="indicator-item badge badge-primary badge-xs ring-2 ring-base-100"></span> 
                <Bell className="w-5 h-5 text-base-content/50" />
              </div>
              <div className="h-8 w-[1px] bg-base-content/10 hidden sm:block" />
              <button className="btn btn-primary btn-sm rounded-xl px-6 font-black tracking-wider shadow-lg shadow-primary/20 hidden sm:flex">
                NOUVEAU
              </button>
           </div>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar scroll-smooth">
           {children}
        </div>
      </main>
    </div>
  );
};

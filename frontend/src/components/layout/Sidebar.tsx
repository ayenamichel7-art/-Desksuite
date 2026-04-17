import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  HardDrive,
  FileText,
  Table2,
  Presentation,
  ClipboardList,
  MessageCircle,
  Settings,
  ChevronDown,
  Sparkles,
  Layout as LayoutIcon,
  DollarSign,
  Calendar,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Zap,
  Globe,
  Database,
  Terminal
} from 'lucide-react';
import clsx from 'clsx';
import React, { useState } from 'react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, color: 'text-primary' },
  { path: '/drive', label: 'Drive', icon: HardDrive, color: 'text-amber-500' },
  { path: '/docs', label: 'Documents', icon: FileText, color: 'text-rose-500' },
  { path: '/sheets', label: 'Tableurs', icon: Table2, color: 'text-emerald-500' },
  { path: '/slides', label: 'Présentations', icon: Presentation, color: 'text-orange-500' },
  { path: '/forms', label: 'Formulaires', icon: ClipboardList, color: 'text-violet-500' },
  { path: '/chat', label: 'Messagerie', icon: MessageCircle, color: 'text-pink-500' },
  { path: '/projects', label: 'Projets', icon: LayoutIcon, color: 'text-indigo-500' },
  { path: '/expenses', label: 'Dépenses', icon: DollarSign, color: 'text-amber-600' },
  { path: '/calendar', label: 'Calendrier', icon: Calendar, color: 'text-indigo-600' },
];

const bottomItems = [
  { path: '/backups', label: 'Backup Cloud', icon: Database, color: 'text-success' },
  { path: '/system', label: 'Système', icon: ShieldCheck, color: 'text-blue-500' },
  { path: '/settings', label: 'Paramètres', icon: Settings, color: 'text-base-content/40' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={clsx(
        "relative h-screen bg-base-100 border-r border-base-content/5 flex flex-col transition-all duration-500 ease-in-out z-40 group/sidebar",
        isCollapsed ? "w-24" : "w-72"
      )}
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-50 opacity-0 group-hover/sidebar:opacity-100 shadow-primary/20"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Logo Section */}
      <div className="p-8 flex items-center gap-4 overflow-hidden whitespace-nowrap">
        <div className="w-10 h-10 bg-primary rounded-[18px] flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 group hover:rotate-12 transition-transform duration-500">
           <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div className={clsx("transition-all duration-300", isCollapsed ? "opacity-0 -translate-x-10 pointer-events-none" : "opacity-100 translate-x-0")}>
           <h1 className="text-xl font-black italic tracking-tighter text-base-content">
             DESK<span className="text-primary italic">SUITE</span>
           </h1>
           <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[9px] font-black text-base-content/30 uppercase tracking-[0.2em] leading-none">OS v1.0 • PLATINUM</span>
           </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar scroll-smooth">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={clsx(
                "sidebar-item relative group",
                isActive && "active",
                isCollapsed && "justify-center px-0"
              )}
            >
              <div className={clsx(
                "p-2 rounded-xl transition-all duration-300",
                isActive ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-base-200/40 text-base-content/40 group-hover:bg-primary/10 group-hover:text-primary"
              )}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              {!isCollapsed && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
              
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-neutral text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all whitespace-nowrap font-black z-50 shadow-xl tracking-widest uppercase">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}

        <div className="py-4 px-4">
             <div className="h-px bg-base-content/5 w-full" />
        </div>

        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={clsx(
                "sidebar-item relative group opacity-60 hover:opacity-100",
                isActive && "active opacity-100",
                isCollapsed && "justify-center px-0"
              )}
            >
              <div className={clsx(
                "p-2 rounded-xl transition-all duration-300",
                isActive ? "bg-primary text-white shadow-lg" : "bg-base-200/40 text-base-content/40 group-hover:bg-primary/5 group-hover:text-primary"
              )}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              {!isCollapsed && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section / Bottom Card */}
      <div className="p-4 mt-auto">
          <div className={clsx(
              "p-3 rounded-2xl bg-base-200/50 border border-base-content/5 flex items-center gap-4 transition-all overflow-hidden",
              isCollapsed && "justify-center border-none bg-transparent"
          )}>
              <div className="avatar placeholder relative shrink-0">
                  <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-black text-xs ring-2 ring-white/10 ring-offset-2 ring-offset-base-100 shadow-lg">
                    {user?.full_name?.charAt(0) || 'A'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-base-100 rounded-full" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black truncate text-base-content">{user?.full_name || 'Michel A.'}</p>
                    <p className="text-[9px] font-black text-base-content/30 uppercase tracking-widest truncate mt-0.5">ADMIN ÉLITE</p>
                </div>
              )}
          </div>
      </div>
    </aside>
  );
}

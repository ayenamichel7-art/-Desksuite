import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  HardDrive,
  FileText,
  Table2,
  Presentation,
  ClipboardList,
  MessageCircle,
  TrendingUp,
  Users,
  FolderOpen,
  Clock,
  Euro,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Building2,
  Loader2,
  Zap,
  Star,
  Activity,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import clsx from 'clsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const modules = [
  { name: 'Drive', desc: 'Stockage & fichiers', icon: HardDrive, path: '/drive', color: 'primary' },
  { name: 'Documents', desc: 'Éditeur collaboratif', icon: FileText, path: '/docs', color: 'secondary' },
  { name: 'Tableurs', desc: 'Grilles & calculs', icon: Table2, path: '/sheets', color: 'accent' },
  { name: 'Présentations', desc: 'Slides dynamiques', icon: Presentation, path: '/slides', color: 'info' },
  { name: 'Formulaires', desc: 'Collecte de données', icon: ClipboardList, path: '/forms', color: 'success' },
  { name: 'Messagerie', desc: 'Chat & Telegram', icon: MessageCircle, path: '/chat', color: 'warning' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const resp = await axios.get(`${API_URL}/analytics/dashboard`);
      setData(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
  };

  if (loading) return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-4">
          <div className="relative">
            <Loader2 className="animate-spin text-primary h-16 w-16 opacity-20" />
            <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary h-8 w-8 animate-pulse" />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-primary/40">Initialisation de votre espace...</p>
      </div>
  );

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-20">
      {/* Dynamic Hero Section */}
      <div className="relative overflow-hidden rounded-[40px] bg-neutral p-10 lg:p-16 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                <path d="M0,100 C30,80 70,80 100,100 L100,0 L0,0 Z" />
            </svg>
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-slide-in-left">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 ring-1 ring-white/5">
                    <Zap className="w-4 h-4 text-secondary fill-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Système opérationnel • v1.0.4</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none">
                    Bonjour, <br/>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        {user?.full_name?.split(' ')[0] || 'Admin'}
                    </span>
                </h1>
                <p className="text-xl text-white/50 font-medium max-w-md leading-relaxed">
                    Prêt à propulser votre entreprise ? Vos outils de gestion et d'intelligence artificielle attendent vos instructions.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                    <button className="btn btn-primary btn-lg rounded-2xl px-10 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        Explorer le Drive
                    </button>
                    <button className="btn btn-ghost btn-lg rounded-2xl border border-white/10 hover:bg-white/5">
                        Paramètres
                    </button>
                </div>
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="glass-card bg-white/5 border-white/10 p-6 flex flex-col justify-between h-40 group hover:bg-white/10 transition-all">
                    <Star className="w-8 h-8 text-secondary group-hover:rotate-12 transition-transform" />
                    <div>
                        <p className="text-2xl font-black">98.4%</p>
                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Score Compliance</p>
                    </div>
                </div>
                <div className="glass-card bg-white/5 border-white/10 p-6 flex flex-col justify-between h-40 group hover:bg-white/10 transition-all">
                    <TrendingUp className="w-8 h-8 text-success group-hover:-translate-y-1 transition-transform" />
                    <div>
                        <p className="text-2xl font-black">+24%</p>
                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Revenus Mensuels</p>
                    </div>
                </div>
                <div className="col-span-2 glass-card bg-white/5 border-white/10 p-6 flex items-center justify-between group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                            <Activity className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-lg font-black tracking-tight">Activité en direct</p>
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest leading-none mt-1">Bot Telegram Connecté</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-success tracking-widest">LIVE</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Modern Dashboard Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
           {[
             { label: 'Chiffre d\'Affaires', value: formatCurrency(data?.metrics?.revenue ?? 0), icon: ArrowUpRight, color: 'primary', valColor: 'text-primary' },
             { label: 'Dépenses Totales', value: formatCurrency(data?.metrics?.expenses ?? 0), icon: ArrowDownRight, color: 'error', valColor: 'text-error' },
             { label: 'Utilisateurs', value: data?.metrics?.contacts ?? 0, icon: Users, color: 'secondary', valColor: 'text-secondary' },
             { label: 'Cloud Drive', value: '125 GB', icon: HardDrive, color: 'accent', valColor: 'text-accent' },
           ].map((stat, i) => (
             <div key={i} className="stat bg-base-100 rounded-[32px] shadow-sm ring-1 ring-base-content/5 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`stat-figure p-3 rounded-2xl bg-${stat.color}/5 ${stat.valColor}`}>
                    <stat.icon className="w-6 h-6" />
                </div>
                <div className="stat-title text-[10px] font-black uppercase tracking-widest opacity-40">{stat.label}</div>
                <div className={`stat-value text-3xl font-black tracking-tighter ${stat.valColor}`}>{stat.value}</div>
                <div className="stat-desc font-bold text-success/60 mt-1">↑ 12% ce mois</div>
             </div>
           ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
            {/* Apps Explorer */}
            <div className="bg-base-100 rounded-[40px] p-10 ring-1 ring-base-content/5 shadow-sm">
                <div className="flex items-center justify-between mb-8 px-2">
                    <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight italic">
                        <Building2 className="w-7 h-7 text-primary/50" />
                        Espace de Travail
                    </h2>
                    <button className="btn btn-ghost btn-sm text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100">Personnaliser</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {modules.map((mod, i) => (
                        <div
                            key={mod.name}
                            onClick={() => navigate(mod.path)}
                            className="group p-6 rounded-[32px] bg-base-200/50 hover:bg-white hover:shadow-2xl hover:shadow-primary/10 ring-1 ring-transparent hover:ring-primary/20 transition-all duration-300 cursor-pointer"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-${mod.color} group-hover:text-white transition-all duration-300 group-hover:rotate-6`}>
                                <mod.icon className="w-7 h-7" />
                            </div>
                            <h3 className="font-black text-lg tracking-tight mb-1 text-base-content">{mod.name}</h3>
                            <p className="text-xs text-base-content/40 font-medium leading-relaxed">{mod.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* List Table Custom Design */}
            <div className="bg-base-100 rounded-[40px] ring-1 ring-base-content/5 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-base-content/5 flex items-center justify-between px-10">
                    <h2 className="text-xl font-black tracking-tight flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                        Flux Documents Récents
                    </h2>
                    <div className="flex items-center gap-2">
                        <button className="btn btn-sm btn-ghost p-0 w-8 h-8 rounded-full"><Search className="w-4 h-4 opacity-30" /></button>
                        <button className="btn btn-sm btn-ghost text-[10px] font-black uppercase tracking-widest opacity-40">Trier</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="table table-lg px-8">
                        <thead>
                            <tr className="border-none text-[10px] font-black uppercase tracking-widest opacity-30">
                                <th className="pl-10">Document</th>
                                <th>Status</th>
                                <th>Score IA</th>
                                <th className="pr-10 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'Facture-2024-001.pdf', status: 'Validé', score: 98, color: 'success' },
                                { name: 'Contrat-Service.pdf', status: 'En attente', score: 65, color: 'warning' },
                                { name: 'Note-Frais-Transport.pdf', status: 'Alerte', score: 22, color: 'error' },
                            ].map((doc, idx) => (
                                <tr key={idx} className="border-none hover:bg-base-200/50 group transition-colors cursor-pointer">
                                    <td className="pl-10 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-base-200 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all">
                                                <FileText className="w-5 h-5 opacity-40" />
                                            </div>
                                            <span className="font-bold text-base-content tracking-tight">{doc.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`badge badge-${doc.color} badge-sm font-black italic rounded-lg text-[9px] uppercase tracking-widest py-3 px-3`}>
                                            {doc.status}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-2 bg-base-200 rounded-full overflow-hidden">
                                                <div className={`h-full bg-${doc.color} shadow-[0_0_8px_currentColor] opacity-60`} style={{ width: `${doc.score}%` }} />
                                            </div>
                                            <span className="text-[10px] font-black opacity-30">{doc.score}%</span>
                                        </div>
                                    </td>
                                    <td className="pr-10 text-right">
                                        <span className="text-xs font-bold text-base-content/30 italic">Il y a 2h</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Sidebar Widgets Area */}
        <div className="lg:col-span-4 space-y-8">
             <div className="bg-primary p-8 rounded-[40px] text-white overflow-hidden relative shadow-2xl group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10 space-y-6">
                    <h3 className="text-xl font-black italic tracking-tighter">SECURITÉ IA CONNECTÉE</h3>
                    <div className="flex items-center gap-4 py-4 border-y border-white/10">
                        <div className="avatar -space-x-3 online">
                            <div className="w-10 rounded-xl ring ring-white ring-offset-base-100 ring-offset-2">
                                <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                            </div>
                            <div className="w-10 rounded-xl ring ring-primary ring-offset-base-100 ring-offset-2">
                                <ShieldCheck className="w-full h-full p-2 text-white" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-black">Bot Anti-Fraude</p>
                            <p className="text-[10px] uppercase font-bold opacity-60 italic">Scan automatique actif</p>
                        </div>
                    </div>
                    <p className="text-xs font-medium leading-relaxed opacity-70">
                        Tous les documents importés dans le Drive sont scannés en temps réel pour détecter des anomalies financières et structurelles.
                    </p>
                    <button className="btn btn-white btn-block rounded-2xl font-black tracking-widest text-primary hover:scale-[1.02]">
                        CONFIGURER ALERTES
                    </button>
                </div>
             </div>

             <div className="bg-base-100 p-8 rounded-[40px] ring-1 ring-base-content/5 shadow-sm space-y-8">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] opacity-30 flex items-center gap-2 px-2">
                    <Clock className="w-4 h-4" />
                    Chronologie Flux
                </h3>
                
                <div className="space-y-8 relative">
                    <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-base-200" />
                    {[
                        { time: '14:32', event: 'Scan Note de Frais', user: 'AI Bot', type: 'primary' },
                        { time: '12:10', event: 'Connexion Administrateur', user: 'Michel A.', type: 'secondary' },
                        { time: '09:45', event: 'Export Rapport Mensuel', user: 'Système', type: 'accent' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-6 relative group cursor-pointer">
                            <div className={`w-4 h-4 rounded-full mt-1.5 shrink-0 bg-${item.type} ring-4 ring-base-100 shadow-sm z-10 transition-transform group-hover:scale-125`} />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-base-content/30 mb-1 leading-none">{item.time} — {item.user}</p>
                                <p className="text-sm font-bold tracking-tight text-base-content group-hover:text-primary transition-colors">{item.event}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-4 px-2">
                    <div className="p-4 bg-base-200 rounded-[28px] border border-dashed border-base-content/10 flex items-center justify-center text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                        Voir plus d'activités
                    </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}

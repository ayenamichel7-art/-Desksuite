import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Layout, 
  ShieldCheck, 
  Settings,
  MoreVertical,
  Building2,
  Calendar,
  Loader2,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Lock,
  ChevronDown
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const CustomerPortalPage: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPortalData();
  }, [token]);

  const fetchPortalData = async () => {
    try {
      const resp = await axios.get(`${API_URL}/public/portal/${token}`);
      setData(resp.data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin text-indigo-600 h-14 w-14 mb-4 mx-auto" />
        <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Ouverture de votre espace...</p>
      </div>
    </div>
  );

  if (error) return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-8">
              <Lock className="h-10 w-10 text-rose-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Accès Non Autorisé</h1>
          <p className="text-gray-500 max-w-sm mb-10 font-medium">Ce lien d'accès est invalide ou a expiré. Veuillez contacter votre administrateur Desksuite.</p>
          <button onClick={() => navigate('/')} className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl shadow-gray-400/20 active:scale-95 transition-all">Retour</button>
      </div>
  )

  const { client, branding, stats, invoices, quotations, tasks, files } = data;

  const handleDownload = (invoice: any) => {
    window.open(`${API_URL}/public/portal/${token}/invoice/${invoice.id}`, '_blank');
  };

  const handleDownloadQuotation = (quotation: any) => {
    window.open(`${API_URL}/public/quotation/${quotation.id}/pdf`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] selection:bg-indigo-100 flex flex-col">
      {/* Dynamic Header (Branded) */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 lg:px-12 py-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl shadow-xl shadow-indigo-600/20" style={{ backgroundColor: branding.primary || '#4B0082' }}>
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">{branding.name}</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Espace Client Partenaire</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-black text-gray-900">{client.name}</span>
                <span className="text-[10px] font-bold text-gray-400">{client.email}</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-black text-gray-400 group cursor-pointer hover:border-indigo-600 transition-colors">
                <ChevronDown className="h-5 w-5" />
            </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-12 lg:py-16 space-y-12">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter mb-4">Bienvenue sur votre espace, {client.name?.split(' ')[0]}</h2>
                <p className="text-gray-500 font-bold max-w-xl text-lg leading-relaxed">Suivez l'état de votre collaboration, accédez à vos factures et signez vos devis en temps réel.</p>
            </div>
            <div className="flex items-center gap-4 bg-indigo-50/50 p-2 rounded-3xl border border-indigo-100 shadow-sm">
                <div className="flex flex-col items-center justify-center p-4 min-w-[120px]">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Facturé</span>
                    <span className="text-2xl font-black text-indigo-900 tracking-tighter">{formatCurrency(stats.total_billed)}</span>
                </div>
            </div>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-400/10 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-10 opacity-5 -mr-4 -mt-4 group-hover:opacity-10 transition-all group-hover:-rotate-12">
                    <CheckCircle2 className="h-32 w-32" />
                </div>
                <div className="mb-6 w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 transition-all group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-600/20">
                    <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-1">{stats.paid_invoices}</h3>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Factures Réglées</p>
            </div>
            
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-400/10 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-10 opacity-5 -mr-4 -mt-4 group-hover:opacity-10 transition-all group-hover:-rotate-12">
                    <Clock className="h-32 w-32" />
                </div>
                <div className="mb-6 w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 transition-all group-hover:bg-amber-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-amber-600/20">
                    <Clock className="h-7 w-7" />
                </div>
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-1">{stats.pending_invoices}</h3>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Factures en Attente</p>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-400/10 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-10 opacity-5 -mr-4 -mt-4 group-hover:opacity-10 transition-all group-hover:-rotate-12">
                    <TrendingUp className="h-32 w-32" />
                </div>
                <div className="mb-6 w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-600/20">
                    <Layout className="h-7 w-7" />
                </div>
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-1">{stats.projects}</h3>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Projets Actifs</p>
            </div>
        </div>

        {/* Action History: Invoices & Quotations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Facturation Section */}
            <section className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <CreditCard className="h-6 w-6 text-indigo-600" />
                        Ma Facturation
                    </h3>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{invoices.length} DOCUMENTS</span>
                </div>
                
                <div className="space-y-4">
                    {invoices.map((inv: any) => (
                        <div key={inv.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-400/5 transition-all group flex items-center justify-between pr-8">
                            <div className="flex items-center gap-5">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors group-hover:scale-110 duration-300",
                                    inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                                )}>
                                    <FileText className="h-7 w-7" />
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900 tracking-tight mb-1">{inv.reference || `Facture #${inv.id.slice(0, 8)}`}</h4>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{formatCurrency(inv.total_amount)} — {new Date(inv.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-full border",
                                    inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                )}>
                                    {inv.status === 'paid' ? 'Payé' : 'En attente'}
                                </span>
                                <button 
                                    onClick={() => handleDownload(inv)}
                                    className="p-4 rounded-full bg-gray-50 text-gray-400 hover:bg-slate-900 hover:text-white hover:scale-110 transition-all shadow-sm"
                                >
                                    <Download className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {invoices.length === 0 && (
                        <div className="py-16 text-center opacity-30 select-none">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="font-black uppercase tracking-widest text-xs">Aucune facture</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Devis & Contrats Section */}
            <section className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <ShieldCheck className="h-6 w-6 text-indigo-600" />
                        Devis & Contrats
                    </h3>
                </div>

                <div className="space-y-5">
                    {quotations.map((quo: any) => (
                        <div key={quo.id} className="bg-indigo-600 p-8 rounded-[40px] shadow-2xl shadow-indigo-600/30 text-white group hover:-translate-y-2 transition-transform cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-10 -mr-4 -mt-4">
                                <ShieldCheck className="h-40 w-40" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                                        <TrendingUp className="h-6 w-6" />
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md",
                                        quo.status === 'accepted' ? 'text-emerald-200' : 'text-indigo-200'
                                    )}>
                                        {quo.status === 'accepted' ? 'Validé' : 'À Signer'}
                                    </span>
                                </div>
                                <h4 className="text-2xl font-black tracking-tight mb-2">{quo.reference || "Devis de prestation"}</h4>
                                <p className="text-indigo-100/60 font-medium mb-8">Date d'échéance : {new Date(quo.valid_until || "").toLocaleDateString()}</p>
                                
                                {quo.status === 'accepted' ? (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-3 text-emerald-300 font-black uppercase tracking-widest text-[10px]">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Signature confirmée
                                        </div>
                                        <button 
                                            onClick={() => handleDownloadQuotation(quo)}
                                            className="w-full p-4 bg-white/20 backdrop-blur-md text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-white/30 transition-colors border border-white/10"
                                        >
                                            Télécharger PDF Signé
                                            <Download className="h-5 w-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => navigate(`/sign/${quo.id}`)}
                                        className="w-full p-5 bg-white text-indigo-900 rounded-[28px] font-black flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors shadow-lg shadow-black/10 active:scale-95"
                                    >
                                        Accéder à la Signature
                                        <ArrowRight className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {quotations.length === 0 && (
                        <div className="py-16 text-center opacity-30 select-none border-2 border-dashed border-gray-200 rounded-[40px]">
                        </div>
                    )}
                </div>
            </section>
        </div>

        {/* Projets & Tâches Section */}
        <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <Layout className="h-6 w-6 text-indigo-600" />
                    Projets en Cours
                </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks?.map((task: any) => (
                    <div key={task.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                                task.status === 'done' ? 'bg-emerald-50 text-emerald-600' :
                                task.status === 'in_progress' ? 'bg-indigo-50 text-indigo-600' :
                                'bg-gray-100 text-gray-500'
                            )}>
                                {task.status === 'done' ? 'Terminé' : task.status === 'in_progress' ? 'En Cours' : 'À Faire'}
                            </span>
                            <h4 className="text-lg font-black text-gray-900 tracking-tight mt-4 mb-2">{task.title}</h4>
                            <p className="text-sm text-gray-500 font-medium line-clamp-2">{task.description}</p>
                        </div>
                        <div className="mt-6 flex items-center gap-2 text-xs font-bold text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>Échéance : {new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
                
                {(!tasks || tasks.length === 0) && (
                    <div className="col-span-full py-16 text-center opacity-30 select-none border-2 border-dashed border-gray-200 rounded-[40px]">
                        <p className="font-black uppercase tracking-widest text-xs">Aucun projet en cours</p>
                    </div>
                )}
            </div>
        </section>

        {/* Documents Partagés Section */}
        <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <FileText className="h-6 w-6 text-indigo-600" />
                    Documents Partagés
                </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {files?.map((file: any) => (
                    <div 
                        key={file.id} 
                        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group hover:scale-[1.02] transition-transform cursor-pointer relative"
                        onClick={() => window.open(file.download_url, '_blank')}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors mb-4">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h4 className="font-black text-gray-900 text-sm truncate mb-1">{file.name}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{file.size}</p>
                        
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Download className="h-4 w-4 text-indigo-600" />
                        </div>
                    </div>
                ))}
                
                {(!files || files.length === 0) && (
                    <div className="col-span-full py-12 text-center opacity-30 select-none border-2 border-dashed border-gray-100 rounded-[40px]">
                        <p className="font-black uppercase tracking-widest text-[10px]">Aucun document partagé pour le moment</p>
                    </div>
                )}
            </div>
        </section>

        {/* Footer Audit Signature */}
        <footer className="pt-20 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-4">
                <ShieldCheck className="h-6 w-6 text-indigo-600" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sécurité de l'échange garantie par Desksuite Trust v1.0</p>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Généré le {new Date().toLocaleDateString()} — {new Date().toLocaleTimeString()}</p>
        </footer>
      </main>
    </div>
  );
};

export default CustomerPortalPage;

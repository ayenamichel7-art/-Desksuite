import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight, Globe, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Authentification réussie !');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-base-100 overflow-hidden">
      {/* Visual Left Side - Atmospheric Branding */}
      <div className="hidden lg:flex lg:w-[60%] relative flex-col justify-between p-20 overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 bg-neutral">
            <img 
              src="/login-bg.png" 
              alt="Premium Background" 
              className="w-full h-full object-cover opacity-40 scale-105 hover:scale-100 transition-transform duration-[10s] ease-linear"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-neutral via-neutral/80 to-transparent" />
        </div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-4 animate-in fade-in slide-in-from-left-10 duration-700">
            <div className="w-14 h-14 bg-primary rounded-[20px] flex items-center justify-center shadow-2xl shadow-primary/20 rotate-3 group hover:rotate-0 transition-transform">
                <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 className="text-3xl font-black italic tracking-tighter text-white">DESKSUITE</h1>
                <p className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">Workspace Ecosystem</p>
            </div>
        </div>

        {/* Content Body */}
        <div className="relative z-10 space-y-8 max-w-2xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-5 py-2 rounded-full border border-white/10 ring-1 ring-white/5">
                <Sparkles className="w-4 h-4 text-primary fill-primary" />
                <span className="text-[11px] font-black uppercase tracking-widest text-white/90">Powered by Neural Intelligence</span>
            </div>
            <h2 className="text-7xl font-black text-white leading-none tracking-tighter">
                Accédez à votre <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">Bureau Virtuel</span>
            </h2>
            <p className="text-xl text-white/40 font-medium leading-relaxed max-w-lg">
                La plateforme tout-en-un pour gérer vos documents, vos finances et votre communication avec une sécurité de niveau bancaire.
            </p>
            <div className="flex gap-12 pt-10 border-t border-white/10">
                <div className="space-y-1">
                    <p className="text-3xl font-black text-white tracking-tighter">99.9%</p>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Uptime SLA</p>
                </div>
                <div className="space-y-1">
                    <p className="text-3xl font-black text-white tracking-tighter">AES-256</p>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Chiffrement</p>
                </div>
                <div className="space-y-1">
                    <p className="text-3xl font-black text-white tracking-tighter">Zero Trust</p>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Architecture</p>
                </div>
            </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 flex items-center justify-between text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Paris Standard</span>
                <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> SSL Secure</span>
            </div>
            <p>© 2026 DESKSUITE LABS</p>
        </div>
      </div>

      {/* Interactive Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-20 bg-base-100 relative">
        <div className="w-full max-w-md space-y-12 animate-in fade-in zoom-in-95 duration-700">
           
           <div className="lg:hidden text-center space-y-4 mb-12">
               <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                   <ShieldCheck className="w-10 h-10 text-white" />
               </div>
               <h1 className="text-3xl font-black italic tracking-tighter text-base-content">DESKSUITE</h1>
           </div>

           <div>
               <h2 className="text-4xl font-black text-base-content tracking-tighter mb-3">Authentification</h2>
               <p className="text-base-content/40 font-medium">Entrez vos identifiants pour rejoindre votre workspace.</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 ml-2">Email Professionnel</label>
                   <div className="relative group">
                       <input 
                         type="email" 
                         required
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         placeholder="ex: michel@desksuite.com"
                         className="input w-full h-16 pl-6 bg-base-200/50 rounded-[22px] border-none ring-1 ring-base-content/5 focus:ring-primary focus:bg-white focus:shadow-xl transition-all duration-300 font-bold placeholder:text-base-content/20"
                       />
                   </div>
               </div>

               <div className="space-y-2">
                    <div className="flex items-center justify-between px-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">Mot de Passe</label>
                        <a href="#" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Oublié ?</a>
                    </div>
                    <div className="relative group">
                        <input 
                          type={showPw ? 'text' : 'password'} 
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="input w-full h-16 pl-6 pr-14 bg-base-200/50 rounded-[22px] border-none ring-1 ring-base-content/5 focus:ring-primary focus:bg-white focus:shadow-xl transition-all duration-300 font-bold placeholder:text-base-content/20"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-base-content/20 hover:text-primary transition-colors"
                        >
                          {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
               </div>

               <div className="pt-6">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="btn btn-primary w-full h-16 rounded-[22px] font-black text-sm uppercase tracking-[0.25em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all group"
                    >
                      {loading ? (
                        <span className="loading loading-spinner" />
                      ) : (
                        <>
                          Rejoindre l'espace
                          <ArrowRight className="w-5 h-5 ml-4 transition-transform group-hover:translate-x-2" />
                        </>
                      )}
                    </button>
               </div>
           </form>

           <div className="pt-8 text-center">
               <p className="text-sm font-bold text-base-content/40">
                   Nouveau collaborateur ? <br/>
                   <Link to="/register" className="text-primary hover:underline decoration-2 underline-offset-4 decoration-primary/30">Créer un nouveau workspace intelligent</Link>
               </p>
           </div>
        </div>
      </div>
    </div>
  );
}

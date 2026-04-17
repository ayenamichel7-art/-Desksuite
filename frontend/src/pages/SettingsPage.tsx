import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Mail, 
  Server, 
  ShieldCheck, 
  Send, 
  Save, 
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Lock,
  Loader2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const SettingsPage: React.FC = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  const [smtp, setSmtp] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    smtp_from_address: '',
    smtp_from_name: '',
    has_password: false,
  });

  useEffect(() => {
    fetchSmtp();
  }, []);

  const fetchSmtp = async () => {
    try {
      const resp = await axios.get(`${API_URL}/settings/smtp`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSmtp(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: null, message: '' });

    try {
      await axios.post(`${API_URL}/settings/smtp`, smtp, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus({ type: 'success', message: '💡 Vos paramètres SMTP ont été sauvegardés.' });
    } catch (err: any) {
      setStatus({ type: 'error', message: "❌ Oups, impossible de sauvegarder les paramètres." });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setStatus({ type: null, message: '' });

    try {
      const resp = await axios.post(`${API_URL}/settings/smtp/test`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus({ type: 'success', message: `🚀 ${resp.data.message}` });
    } catch (err: any) {
      setStatus({ type: 'error', message: `⚠️ ${err.response?.data?.message || 'Erreur lors du test SMTP.'}` });
    } finally {
      setTesting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-brand-primary h-12 w-12" />
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Server className="text-brand-primary h-8 w-8" />
            Paramètres du Hub
          </h1>
          <p className="text-gray-500 mt-2">Gérez vos sorties emails et votre conformité White Label.</p>
        </div>
      </div>

      {status.type && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border shadow-sm ${
          status.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="font-medium">{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation latérale Settings */}
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-brand-primary text-white shadow-lg transition-transform active:scale-95">
            <Mail className="h-5 w-5" />
            <span className="font-semibold text-sm">Sortie Email (SMTP)</span>
          </button>
          <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 shadow-sm transition-all group">
            <ShieldCheck className="h-5 w-5 group-hover:text-brand-primary" />
            <span className="font-medium text-sm">Sécurité & API</span>
          </button>
          <div className="mt-8 p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
            <div className="flex items-start gap-3">
              <HelpCircle className="text-brand-primary h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-900 leading-relaxed">
                <strong>Conseil Senior :</strong> Utilisez un serveur SMTP dédié pour éviter que vos factures ne soient filtrées par les filtres anti-spam de vos clients.
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire SMTP */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden shadow-indigo-100/50">
            <div className="p-8 border-b border-gray-50 bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-brand-primary">
                  <Send className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Serveur d'expédition Mail</h2>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1.5 opacity-60">Configuration White Label</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Serveur SMTP</label>
                  <input 
                    type="text" 
                    placeholder="smtp.domain.com"
                    value={smtp.smtp_host}
                    onChange={e => setSmtp({...smtp, smtp_host: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-brand-primary focus:ring-0 transition-all text-sm font-medium" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Port</label>
                  <input 
                    type="number" 
                    placeholder="587"
                    value={smtp.smtp_port}
                    onChange={e => setSmtp({...smtp, smtp_port: parseInt(e.target.value)})}
                    className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-brand-primary focus:ring-0 transition-all text-sm font-medium" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Utilisateur / Login</label>
                  <input 
                    type="text"
                    value={smtp.smtp_username}
                    onChange={e => setSmtp({...smtp, smtp_username: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-brand-primary focus:ring-0 transition-all text-sm font-medium" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Mot de passe</label>
                  <div className="relative">
                    <input 
                      type="password"
                      placeholder={smtp.has_password ? "••••••••" : "Vide"}
                      value={smtp.smtp_password}
                      onChange={e => setSmtp({...smtp, smtp_password: e.target.value})}
                      className="w-full p-4 pl-12 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-brand-primary focus:ring-0 transition-all text-sm font-medium" 
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Chiffrement</label>
                  <select 
                    value={smtp.smtp_encryption}
                    onChange={e => setSmtp({...smtp, smtp_encryption: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-brand-primary focus:ring-0 transition-all text-sm font-medium appearance-none translate-y-0"
                  >
                    <option value="tls">TLS (Recommandé)</option>
                    <option value="ssl">SSL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Nom d'expéditeur</label>
                  <input 
                    type="text"
                    placeholder="Mon Entreprise"
                    value={smtp.smtp_from_name}
                    onChange={e => setSmtp({...smtp, smtp_from_name: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-brand-primary focus:ring-0 transition-all text-sm font-medium" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email d'expéditeur</label>
                <input 
                  type="email"
                  placeholder="contact@domain.com"
                  value={smtp.smtp_from_address}
                  onChange={e => setSmtp({...smtp, smtp_from_address: e.target.value})}
                  className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-brand-primary focus:ring-0 transition-all text-sm font-medium" 
                />
              </div>

              <div className="pt-8 flex flex-col sm:flex-row items-center gap-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-lg hover:shadow-gray-400/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                  Sauvegarder les réglages
                </button>
                <button 
                  type="button"
                  onClick={handleTest}
                  disabled={testing}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-800 border-2 border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {testing ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5 text-brand-secondary" />}
                  Tester la connexion
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

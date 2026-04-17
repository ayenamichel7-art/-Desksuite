import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { 
  X, 
  Send, 
  Mail, 
  User, 
  Type, 
  AlignLeft,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface ComposeEmailProps {
  onClose: () => void;
}

const ComposeEmail: React.FC<ComposeEmailProps> = ({ onClose }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    to: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/settings/smtp/quick-send`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Impossible d'envoyer l'email. Vérifiez votre configuration SMTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Nouveau Message Email</h2>
              <p className="text-xs text-gray-500 font-medium">Expédition via votre serveur SMTP privé</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X className="h-6 w-6" />
          </button>
        </div>

        {success ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Email envoyé !</h3>
            <p className="text-gray-500 max-w-xs mx-auto">Votre message a été transmis avec succès à {form.to}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Destinataire</label>
                <div className="relative">
                  <input 
                    type="email" 
                    required
                    placeholder="client@exemple.com"
                    value={form.to}
                    onChange={e => setForm({...form, to: e.target.value})}
                    className="w-full p-4 pl-12 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-brand-primary focus:ring-0 transition-all text-sm font-semibold"
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Objet</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    placeholder="Sujet de votre message..."
                    value={form.subject}
                    onChange={e => setForm({...form, subject: e.target.value})}
                    className="w-full p-4 pl-12 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-brand-primary focus:ring-0 transition-all text-sm font-semibold"
                  />
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Message</label>
                <div className="relative">
                  <textarea 
                    required
                    rows={6}
                    placeholder="Rédigez votre message ici..."
                    value={form.message}
                    onChange={e => setForm({...form, message: e.target.value})}
                    className="w-full p-4 pl-12 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-brand-primary focus:ring-0 transition-all text-sm font-semibold resize-none"
                  ></textarea>
                  <AlignLeft className="absolute left-4 top-6 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-3 text-gray-500 font-bold hover:text-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold shadow-lg hover:shadow-gray-400/30 transition-all active:scale-95 flex items-center gap-2 group"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                Envoyer maintenant
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ComposeEmail;

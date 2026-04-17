import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Building2, User, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    workspace_name: '',
    subdomain: '',
    type: 'company',
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'workspace_name'
        ? { subdomain: value.toLowerCase().replace(/[^a-z0-9-]/g, '') }
        : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    
    // Create FormData for file upload
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (logo) formData.append('logo', logo);

    try {
      await register(formData as any);
      toast.success('Workspace activé ! Identité visuelle extraite 🎉');
      navigate('/');
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors) {
        toast.error("Veuillez vérifier vos informations et réessayer.");
      } else {
        toast.error("Erreur lors de l'inscription");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-base-200 via-base-100 to-secondary/5">
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

      <div className="w-full max-w-lg relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Créer votre espace
          </h1>
          <p className="text-base-content/50 mt-2">Configurez votre workspace en quelques secondes</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => setForm({...form, type: 'company'})}
                className={clsx(
                  "p-4 rounded-xl border-2 transition-all cursor-pointer text-center group",
                  form.type === 'company' ? "border-primary bg-primary/5 shadow-inner" : "border-base-300 hover:border-primary/50"
                )}
              >
                <div className={clsx("w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center transition-colors", form.type === 'company' ? "bg-primary text-white" : "bg-base-200 text-base-content/40 group-hover:bg-primary/20 group-hover:text-primary")}>
                  <Building2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest">Entreprise</p>
                <p className="text-[10px] opacity-40 leading-tight mt-1">Équipe & Marque</p>
              </div>

              <div 
                onClick={() => setForm({...form, type: 'individual'})}
                className={clsx(
                  "p-4 rounded-xl border-2 transition-all cursor-pointer text-center group",
                  form.type === 'individual' ? "border-primary bg-primary/5 shadow-inner" : "border-base-300 hover:border-primary/50"
                )}
              >
                <div className={clsx("w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center transition-colors", form.type === 'individual' ? "bg-primary text-white" : "bg-base-200 text-base-content/40 group-hover:bg-primary/20 group-hover:text-primary")}>
                  <User className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest">Particulier</p>
                <p className="text-[10px] opacity-40 leading-tight mt-1">Freelance & Solo</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="label text-[11px] font-bold uppercase opacity-50">Nom complet</label>
                <input
                  type="text" name="full_name" required value={form.full_name}
                  onChange={handleChange}
                  className="input input-bordered w-full input-focus bg-base-200/50"
                  placeholder="Jean Dupont"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="label text-[11px] font-bold uppercase opacity-50">Email</label>
                <input
                  type="email" name="email" required value={form.email}
                  onChange={handleChange}
                  className="input input-bordered w-full input-focus bg-base-200/50"
                  placeholder="jean@entreprise.com"
                />
              </div>
            </div>

            {form.type === 'company' && (
              <div className="animate-fade-in">
                <label className="label text-[11px] font-bold uppercase opacity-50">Nom de votre société</label>
                <input
                  type="text" name="workspace_name" required value={form.workspace_name}
                  onChange={handleChange}
                  className="input input-bordered w-full input-focus bg-base-200/50"
                  placeholder="Ma Super Entreprise"
                />
              </div>
            )}

            <div>
              <label className="label text-[11px] font-bold uppercase opacity-50">Nom de l'URL (Sous-domaine)</label>
              <div className="join w-full">
                <input
                  type="text" name="subdomain" required value={form.subdomain}
                  onChange={handleChange}
                  className="input input-bordered join-item flex-1 input-focus bg-base-200/50"
                  placeholder="mon-espace"
                />
                <span className="join-item flex items-center px-4 bg-base-300 text-[10px] font-black uppercase opacity-50 border border-base-300">
                  .desksuite.com
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label text-[11px] font-bold uppercase opacity-50">Mot de passe</label>
                <input
                  type="password" name="password" required value={form.password}
                  onChange={handleChange}
                  className="input input-bordered w-full input-focus bg-base-200/50"
                  placeholder="••••••••"
                  minLength={8}
                />
              </div>
              <div>
                <label className="label text-[11px] font-bold uppercase opacity-50">Validation</label>
                <input
                  type="password" name="password_confirmation" required value={form.password_confirmation}
                  onChange={handleChange}
                  className="input input-bordered w-full input-focus bg-base-200/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Logo Upload (Branding AI) */}
            <div className="animate-fade-in">
              <label className="label text-[11px] font-bold uppercase opacity-50">Ton Logo (Pour ta charte graphique)</label>
              <div 
                className={clsx(
                  "border-2 border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group",
                  logoPreview ? "border-primary bg-primary/5" : "border-base-300 hover:border-primary/50"
                )}
                onClick={() => document.getElementById('logo-input')?.click()}
              >
                {logoPreview && logoPreview.startsWith('blob:') ? (
                  <div className="relative group/img w-full h-24 flex items-center justify-center">
                    <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain drop-shadow-md" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <ImagePlus className="w-5 h-5 opacity-40" />
                    </div>
                    <p className="text-[10px] font-bold opacity-30">Cliquer pour uploader</p>
                  </div>
                )}
                <input 
                  id="logo-input" type="file" className="hidden" accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      setLogo(file);
                      setLogoPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full gap-2 mt-4 shadow-lg shadow-primary/20">
              {loading ? <span className="loading loading-spinner loading-sm" /> : <UserPlus className="w-5 h-5" />}
              Lancer mon espace
            </button>
          </form>

          <p className="text-center text-sm text-base-content/50 mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Bienvenue dans votre espace !');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      const message = err.response?.data?.message || 'Identifiants incorrects ou problème serveur';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Input */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold text-base-content/70">Adresse Email Professional</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 transition-transform group-focus-within:translate-x-1">
            <Mail className="h-5 w-5 text-base-content/40 group-focus-within:text-primary transition-colors duration-300" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered w-full pl-12 h-14 rounded-xl input-focus bg-base-100/50 backdrop-blur-sm border-base-content/10"
            placeholder="votre.nom@enterprise.com"
            required
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="form-control w-full">
        <div className="flex items-center justify-between px-1">
          <label className="label">
            <span className="label-text font-semibold text-base-content/70">Mot de passe</span>
          </label>
          <a href="#" className="link link-primary link-hover text-xs font-bold transition-opacity hover:opacity-80">
            Mot de passe oublié ?
          </a>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 transition-transform group-focus-within:translate-x-1">
            <Lock className="h-5 w-5 text-base-content/40 group-focus-within:text-primary transition-colors duration-300" />
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered w-full pl-12 h-14 rounded-xl input-focus bg-base-100/50 backdrop-blur-sm border-base-content/10"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      {/* Remember Me */}
      <div className="flex items-center gap-2 px-1">
         <input type="checkbox" className="checkbox checkbox-primary checkbox-sm rounded-md" defaultChecked />
         <span className="label-text text-sm font-medium opacity-70">Se souvenir de moi</span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-primary btn-lg w-full rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 relative overflow-hidden group transition-all h-14"
      >
        <span className="relative z-10 flex items-center gap-3">
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              SÉCURISATION...
            </>
          ) : (
            <>
              SE CONNECTER
              <ArrowRight className="h-5 w-5 transform translate-x-0 group-hover:translate-x-2 transition-transform duration-300" />
            </>
          )}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
      </button>

      {/* Account Info */}
      <div className="text-center pt-2">
         <p className="text-sm text-base-content/50 font-medium leading-relaxed">
            Pas encore de compte ? <span className="text-primary font-bold cursor-pointer hover:underline">Contactez votre administrateur</span>
         </p>
      </div>
    </form>
  );
};

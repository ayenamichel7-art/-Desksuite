import React from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { ShieldCheck, Sparkles, Building2, Globe } from 'lucide-react';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-100 flex overflow-hidden">
      {/* Left Side: Form Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 lg:px-20 relative z-10">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

        <div className="w-full max-w-lg space-y-8 animate-fade-in">
          {/* Logo & Header */}
          <div className="text-center lg:text-left space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl text-primary mb-2">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-base-content sm:text-5xl">
              Bienvenue sur <span className="text-primary italic">Desksuite</span>
            </h1>
            <p className="text-lg text-base-content/60 font-medium">
              Votre hub SaaS tout-en-un pour une gestion d'entreprise sans limite.
            </p>
          </div>

          {/* Form Card */}
          <div className="glass-card p-8 lg:p-10 border border-base-content/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
            <LoginForm />
          </div>

          {/* Footer Info */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-base-content/40 font-medium pt-4">
             <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Multi-tenant Architecture</span>
             </div>
             <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-secondary" />
                <span>Powered by AI Intelligence</span>
             </div>
          </div>
        </div>
      </div>

      {/* Right Side: Visual Section */}
      <div className="hidden lg:flex flex-1 relative bg-neutral overflow-hidden">
        {/* Background Image with Overlay */}
        <img 
          src="/login-bg.png" 
          alt="Modern Office" 
          className="absolute inset-0 w-full h-full object-cover animate-scale-in"
          style={{ animationDuration: '20s', animationIterationCount: 'infinite', animationDirection: 'alternate' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-neutral/90 via-neutral/40 to-transparent" />
        
        {/* Floating Content */}
        <div className="relative z-20 flex flex-col justify-end p-16 h-full text-white">
          <div className="glass-card bg-white/10 border-white/20 p-8 space-y-4 max-w-md animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-lg">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold italic tracking-wider">PREMIUM EXPERIENCE</h3>
            </div>
            <p className="text-lg text-white/80 leading-relaxed italic">
              "L'efficacité n'est pas une option, c'est l'essence même de notre plateforme. Gérez vos documents, votre fraude et votre comptabilité avec l'IA."
            </p>
            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
               <span className="text-sm font-semibold opacity-60">ADMINISTRATION CENTRALE</span>
               <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-primary/30 blur-[2px]" />
                  <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-secondary/30" />
               </div>
            </div>
          </div>
        </div>

        {/* Decorative Particles (Simulated) */}
        <div className="absolute top-20 right-20 w-2 h-2 bg-secondary rounded-full animate-pulse" />
        <div className="absolute bottom-40 right-40 w-3 h-3 bg-primary rounded-full animate-pulse-soft" />
      </div>
    </div>
  );
};

export default LoginPage;

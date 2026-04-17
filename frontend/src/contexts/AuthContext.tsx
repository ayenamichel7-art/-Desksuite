import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Tenant } from '@/types';
import { authApi } from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    full_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    workspace_name: string;
    subdomain: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  switchTenant: (tenantId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('desksuite_token')
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await authApi.me();
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('desksuite_token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const { user: u, token: t } = res.data;
    localStorage.setItem('desksuite_token', t);
    setToken(t);
    setUser(u);
  };

  const register = async (data: {
    full_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    workspace_name: string;
    subdomain: string;
  }) => {
    const res = await authApi.register(data);
    const { user: u, token: t } = res.data;
    localStorage.setItem('desksuite_token', t);
    setToken(t);
    setUser(u);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch { /* ignore */ }
    localStorage.removeItem('desksuite_token');
    setToken(null);
    setUser(null);
  };

  const switchTenant = async (tenantId: string) => {
    const res = await authApi.switchTenant(tenantId);
    setUser(res.data.user);
  };

  useEffect(() => {
    if (user?.current_tenant) {
      const tenant = user.current_tenant;
      document.documentElement.style.setProperty('--brand-primary', tenant.primary_color || '#4B0082');
      document.documentElement.style.setProperty('--brand-secondary', tenant.secondary_color || '#FF8C00');
      document.title = (tenant.brand_name || 'Desksuite') + ' — Workspace';
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

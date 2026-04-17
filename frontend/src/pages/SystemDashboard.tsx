import React, { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';
import { Shield, Activity, Users, HardDrive, History, ArrowRight } from 'lucide-react';

interface SystemStats {
  users_count: number;
  tenants_count: number;
  storage_used: number;
  recent_audits: any[];
}

const SystemDashboard: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await adminApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch system stats', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) return <div className="p-8">Chargement des données du Watchdog...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Shield className="text-indigo-600" size={32} />
            Watchdog & Dashboard Système
          </h1>
          <p className="text-slate-500 mt-1">Supervision en temps réel de votre infrastructure Desksuite.</p>
        </div>
        <button 
          onClick={fetchStats}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Activity size={18} /> Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Utilisateurs</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats?.users_count}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Workspaces</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats?.tenants_count}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <HardDrive size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Stockage S3</p>
              <h3 className="text-2xl font-bold text-slate-900">{formatSize(stats?.storage_used || 0)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Protection</p>
              <h3 className="text-2xl font-bold text-slate-900">Active</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History size={20} className="text-slate-400" />
            Activités Récentes (Journal d'Audit)
          </h2>
          <button className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1">
            Voir tout <ArrowRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-semibold">Heure</th>
                <th className="px-6 py-3 font-semibold">Utilisateur</th>
                <th className="px-6 py-3 font-semibold">Action</th>
                <th className="px-6 py-3 font-semibold">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recent_audits.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {log.user?.email || 'Système'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      log.action.includes('error') || log.action.includes('failed') 
                      ? 'bg-red-50 text-red-600' 
                      : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {log.ip_address}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemDashboard;

import { useState, useEffect } from 'react';
import { 
  Database, 
  FileArchive, 
  Download, 
  RefreshCw, 
  Trash2, 
  HardDrive, 
  ShieldCheck,
  Clock,
  ExternalLink,
  Plus
} from 'lucide-react';
import { backupApi } from '@/services/api';
import { toast } from 'react-hot-toast';

interface Backup {
  key: string;
  size: number;
  last_modified: string;
  url: string;
}

export default function BackupPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const { data } = await backupApi.list();
      setBackups(data.backups || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des sauvegardes');
    } finally {
      setLoading(false);
    }
  };

  const triggerBackup = async (type: 'db' | 'files') => {
    setTriggering(type);

    try {
      const { data } = type === 'db' ? await backupApi.runDb() : await backupApi.runFiles();
      if (data.success) {
        toast.success(`Sauvegarde ${type === 'db' ? 'de la base' : 'des fichiers'} lancée avec succès`);
        fetchBackups();
      } else {
        toast.error('Erreur : ' + (data.error || 'Inconnue'));
      }
    } catch (error) {
      toast.error('Erreur lors du lancement de la sauvegarde');
    } finally {
      setTriggering(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Sauvegardes & Souveraineté</h1>
          <p className="text-base-content/60 max-w-2xl">
            Gérez vos archives de données. Desksuite garantit votre indépendance : vos données sont stockées sur votre infrastructure MinIO (S3) locale.
          </p>
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={() => triggerBackup('db')}
                disabled={triggering !== null}
                className="btn btn-primary shadow-lg shadow-primary/20"
            >
                {triggering === 'db' ? <span className="loading loading-spinner loading-sm"></span> : <Database className="w-4 h-4 mr-2" />}
                Backup DB
            </button>
            <button 
                onClick={() => triggerBackup('files')}
                disabled={triggering !== null}
                className="btn btn-outline border-primary text-primary hover:bg-primary hover:text-white"
            >
                {triggering === 'files' ? <span className="loading loading-spinner loading-sm"></span> : <FileArchive className="w-4 h-4 mr-2" />}
                Backup Dossiers
            </button>
        </div>
      </div>

      {/* Security Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-success/5 border border-success/20 p-6 rounded-3xl flex items-start gap-4">
            <div className="p-3 bg-success/10 rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-success" />
            </div>
            <div>
                <h3 className="font-bold text-success mb-1">Stockage Souverain</h3>
                <p className="text-xs text-success/70 leading-relaxed">Vos données ne quittent jamais votre infrastructure. Chiffrement AES-256 actif.</p>
            </div>
        </div>
        <div className="bg-info/5 border border-info/20 p-6 rounded-3xl flex items-start gap-4">
            <div className="p-3 bg-info/10 rounded-2xl">
                <Clock className="w-6 h-6 text-info" />
            </div>
            <div>
                <h3 className="font-bold text-info mb-1">Cycles Automatiques</h3>
                <p className="text-xs text-info/70 leading-relaxed">Base de données : 03:00 AM quotidien.<br/>Fichiers : 04:00 AM quotidien.</p>
            </div>
        </div>
        <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
                <HardDrive className="w-6 h-6 text-primary" />
            </div>
            <div>
                <h3 className="font-bold text-primary mb-1">MinIO S3 Cluster</h3>
                <p className="text-xs text-primary/70 leading-relaxed">Connecté au bucket <code>desksuite-backups</code> sur votre cluster local.</p>
            </div>
        </div>
      </div>

      {/* Backups Table */}
      <div className="bg-base-100 border border-base-content/5 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-base-content/5 flex items-center justify-between bg-base-200/50">
           <h2 className="text-xl font-bold flex items-center gap-2">
            <RefreshCw className={cn("w-5 h-5 text-primary", loading ? "animate-spin" : "")} />
            Archives Disponibles
           </h2>
           <button onClick={fetchBackups} className="btn btn-sm btn-ghost gap-2">
             <RefreshCw className="w-4 h-4" /> Actualiser
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-lg w-full">
            <thead>
              <tr className="text-base-content/40 uppercase text-[10px] tracking-widest border-b border-base-content/5">
                <th className="font-bold">Type</th>
                <th className="font-bold">Nom de l'archive</th>
                <th className="font-bold">Taille</th>
                <th className="font-bold">Date de création</th>
                <th className="text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td><div className="h-10 w-10 bg-base-200 rounded-xl"></div></td>
                    <td><div className="h-4 w-48 bg-base-200 rounded-lg"></div></td>
                    <td><div className="h-4 w-12 bg-base-200 rounded-lg"></div></td>
                    <td><div className="h-4 w-32 bg-base-200 rounded-lg"></div></td>
                    <td><div className="h-8 w-8 bg-base-200 rounded-full ml-auto"></div></td>
                  </tr>
                ))
              ) : backups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-base-content/30 italic">
                    Aucune sauvegarde trouvée. Lancez-en une manuellement !
                  </td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.key} className="hover:bg-base-200/50 transition-colors group border-b border-base-content/5">
                    <td>
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        backup.key.startsWith('db_') ? "bg-primary/10 text-primary" : "bg-info/10 text-info"
                      )}>
                        {backup.key.startsWith('db_') ? <Database className="w-5 h-5" /> : <FileArchive className="w-5 h-5" />}
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-sm font-semibold">{backup.key}</span>
                    </td>
                    <td>
                      <span className="badge badge-ghost font-bold text-xs">{formatSize(backup.size)}</span>
                    </td>
                    <td>
                      <span className="text-sm text-base-content/60">
                        {new Date(backup.last_modified).toLocaleString('fr-FR', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a 
                            href={backup.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-sm btn-primary rounded-xl"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}

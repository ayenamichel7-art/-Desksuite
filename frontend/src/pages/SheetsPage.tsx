import { useEffect, useState } from 'react';
import { documentsApi } from '@/services/api';
import { Document } from '@/types';
import { Plus, Table2, Clock, Trash2, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SheetsPage() {
  const [sheets, setSheets] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = async () => {
    try {
      const res = await documentsApi.list('sheet');
      setSheets(res.data.data || res.data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const createSheet = async () => {
    try {
      await documentsApi.create({ type: 'sheet', name: 'Tableur sans titre' });
      loadSheets();
      toast.success('Tableur créé');
    } catch {
      toast.error('Erreur');
    }
  };

  const deleteSheet = async (id: string) => {
    await documentsApi.delete(id);
    setSheets((prev) => prev.filter((s) => s.id !== id));
    toast.success('Tableur supprimé');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tableurs</h1>
          <p className="text-base-content/50 text-sm mt-1">Grilles de calcul et imports Excel</p>
        </div>
        <button onClick={createSheet} className="btn btn-primary btn-sm gap-2">
          <Plus className="w-4 h-4" /> Nouveau tableur
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : sheets.length === 0 ? (
        <div className="glass-card p-12 text-center animate-fade-in">
          <Table2 className="w-16 h-16 text-base-content/10 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun tableur</h3>
          <p className="text-sm text-base-content/40 mb-6">Créez un nouveau tableur ou importez un fichier Excel</p>
          <button onClick={createSheet} className="btn btn-primary btn-sm gap-2">
            <Plus className="w-4 h-4" /> Créer un tableur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div onClick={createSheet} className="glass-card p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 border-2 border-dashed border-base-300 min-h-[180px] group">
            <Plus className="w-8 h-8 text-base-content/20 group-hover:text-emerald-500 group-hover:scale-110 transition-all" />
            <p className="text-sm text-base-content/40 mt-3 group-hover:text-emerald-500">Nouveau tableur</p>
          </div>

          {sheets.map((sheet) => (
            <div key={sheet.id} className="file-card flex flex-col min-h-[180px]">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                  <Table2 className="w-5 h-5 text-white" />
                </div>
                <div className="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
                  <button tabIndex={0} className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-xl w-44 z-50">
                    <li><a onClick={() => deleteSheet(sheet.id)} className="text-error"><Trash2 className="w-4 h-4" /> Supprimer</a></li>
                  </ul>
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-1 truncate">{sheet.name}</h3>
              <div className="mt-auto flex items-center gap-1 text-xs text-base-content/40">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(sheet.updated_at), { locale: fr, addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

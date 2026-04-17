import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentsApi } from '@/services/api';
import { Document } from '@/types';
import { Plus, FileText, Clock, MoreVertical, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DocsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const res = await documentsApi.list('doc');
      setDocs(res.data.data || res.data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const createDoc = async () => {
    try {
      const res = await documentsApi.create({ type: 'doc', name: 'Document sans titre' });
      const doc = res.data;
      navigate(`/docs/${doc.id}`);
      toast.success('Document créé');
    } catch {
      toast.error('Erreur');
    }
  };

  const deleteDoc = async (id: string) => {
    await documentsApi.delete(id);
    setDocs((prev) => prev.filter((d) => d.id !== id));
    toast.success('Document supprimé');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-base-content/50 text-sm mt-1">Éditeur collaboratif style Google Docs</p>
        </div>
        <button onClick={createDoc} className="btn btn-primary btn-sm gap-2">
          <Plus className="w-4 h-4" /> Nouveau document
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : docs.length === 0 ? (
        <div className="glass-card p-12 text-center animate-fade-in">
          <FileText className="w-16 h-16 text-base-content/10 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun document</h3>
          <p className="text-sm text-base-content/40 mb-6">Créez votre premier document de texte riche</p>
          <button onClick={createDoc} className="btn btn-primary btn-sm gap-2">
            <Plus className="w-4 h-4" /> Créer un document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* New Doc Card */}
          <div
            onClick={createDoc}
            className="glass-card p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 border-2 border-dashed border-base-300 min-h-[180px] group"
          >
            <Plus className="w-8 h-8 text-base-content/20 group-hover:text-primary group-hover:scale-110 transition-all" />
            <p className="text-sm text-base-content/40 mt-3 group-hover:text-primary">Nouveau document</p>
          </div>

          {/* Doc Cards */}
          {docs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => navigate(`/docs/${doc.id}`)}
              className="file-card flex flex-col min-h-[180px]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
                  <button tabIndex={0} className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-xl w-44 z-50">
                    <li>
                      <a onClick={() => deleteDoc(doc.id)} className="text-error">
                        <Trash2 className="w-4 h-4" /> Supprimer
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-1 truncate">{doc.name}</h3>
              <div className="mt-auto flex items-center gap-1 text-xs text-base-content/40">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(doc.updated_at), { locale: fr, addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

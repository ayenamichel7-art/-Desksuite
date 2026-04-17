import { useEffect, useState } from 'react';
import { formsApi } from '@/services/api';
import { Form } from '@/types';
import { Plus, ClipboardList, Clock, MoreVertical, Trash2, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const res = await formsApi.list();
      setForms(res.data.data || res.data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const createForm = async () => {
    if (!newTitle.trim()) return;
    try {
      await formsApi.create({
        title: newTitle,
        schema: [
          { label: 'Nom', type: 'text', required: true },
          { label: 'Email', type: 'email', required: true },
          { label: 'Message', type: 'textarea', required: false },
        ],
      });
      setNewTitle('');
      setShowCreate(false);
      loadForms();
      toast.success('Formulaire créé');
    } catch {
      toast.error('Erreur');
    }
  };

  const toggleActive = async (form: Form) => {
    await formsApi.update(form.id, { is_active: !form.is_active });
    loadForms();
  };

  const deleteForm = async (id: string) => {
    await formsApi.delete(id);
    setForms((prev) => prev.filter((f) => f.id !== id));
    toast.success('Formulaire supprimé');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Formulaires</h1>
          <p className="text-base-content/50 text-sm mt-1">Collecte de données en quelques clics</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary btn-sm gap-2">
          <Plus className="w-4 h-4" /> Nouveau formulaire
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="glass-card p-4 flex items-center gap-3 animate-scale-in">
          <ClipboardList className="w-5 h-5 text-violet-500" />
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createForm()}
            className="input input-bordered input-sm flex-1"
            placeholder="Titre du formulaire..."
          />
          <button onClick={createForm} className="btn btn-primary btn-sm">Créer</button>
          <button onClick={() => setShowCreate(false)} className="btn btn-ghost btn-sm">Annuler</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : forms.length === 0 ? (
        <div className="glass-card p-12 text-center animate-fade-in">
          <ClipboardList className="w-16 h-16 text-base-content/10 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun formulaire</h3>
          <p className="text-sm text-base-content/40 mb-6">Créez un formulaire pour collecter des données</p>
          <button onClick={() => setShowCreate(true)} className="btn btn-primary btn-sm gap-2">
            <Plus className="w-4 h-4" /> Créer un formulaire
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {forms.map((form) => (
            <div key={form.id} className="glass-card p-5 flex items-center gap-4 group hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shrink-0">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{form.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-xs text-base-content/40">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {form.responses_count || 0} réponses
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(form.created_at), { locale: fr, addSuffix: true })}
                  </span>
                </div>
              </div>
              <button onClick={() => toggleActive(form)} className="btn btn-ghost btn-sm gap-1" title={form.is_active ? 'Désactiver' : 'Activer'}>
                {form.is_active ? (
                  <><ToggleRight className="w-5 h-5 text-success" /> <span className="text-xs text-success">Actif</span></>
                ) : (
                  <><ToggleLeft className="w-5 h-5 text-base-content/30" /> <span className="text-xs text-base-content/30">Inactif</span></>
                )}
              </button>
              <div className="dropdown dropdown-end">
                <button tabIndex={0} className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-4 h-4" />
                </button>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-xl w-44 z-50">
                  <li><a onClick={() => deleteForm(form.id)} className="text-error"><Trash2 className="w-4 h-4" /> Supprimer</a></li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

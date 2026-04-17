import { useEffect, useState } from 'react';
import { documentsApi } from '@/services/api';
import { Document } from '@/types';
import { Plus, Presentation, Clock, Trash2, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SlidesPage() {
  const [slides, setSlides] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      const res = await documentsApi.list('slide');
      setSlides(res.data.data || res.data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const createSlide = async () => {
    try {
      await documentsApi.create({ type: 'slide', name: 'Présentation sans titre' });
      loadSlides();
      toast.success('Présentation créée');
    } catch {
      toast.error('Erreur');
    }
  };

  const deleteSlide = async (id: string) => {
    await documentsApi.delete(id);
    setSlides((prev) => prev.filter((s) => s.id !== id));
    toast.success('Présentation supprimée');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Présentations</h1>
          <p className="text-base-content/50 text-sm mt-1">Slides dynamiques, exportables en PDF</p>
        </div>
        <button onClick={createSlide} className="btn btn-primary btn-sm gap-2">
          <Plus className="w-4 h-4" /> Nouvelle présentation
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : slides.length === 0 ? (
        <div className="glass-card p-12 text-center animate-fade-in">
          <Presentation className="w-16 h-16 text-base-content/10 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune présentation</h3>
          <p className="text-sm text-base-content/40 mb-6">Créez des slides dynamiques pour vos présentations</p>
          <button onClick={createSlide} className="btn btn-primary btn-sm gap-2">
            <Plus className="w-4 h-4" /> Créer une présentation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div onClick={createSlide} className="glass-card p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 border-2 border-dashed border-base-300 min-h-[180px] group">
            <Plus className="w-8 h-8 text-base-content/20 group-hover:text-orange-500 group-hover:scale-110 transition-all" />
            <p className="text-sm text-base-content/40 mt-3 group-hover:text-orange-500">Nouvelle présentation</p>
          </div>

          {slides.map((slide) => (
            <div key={slide.id} className="file-card flex flex-col min-h-[180px]">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <Presentation className="w-5 h-5 text-white" />
                </div>
                <div className="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
                  <button tabIndex={0} className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-xl w-44 z-50">
                    <li><a onClick={() => deleteSlide(slide.id)} className="text-error"><Trash2 className="w-4 h-4" /> Supprimer</a></li>
                  </ul>
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-1 truncate">{slide.name}</h3>
              <div className="mt-auto flex items-center gap-1 text-xs text-base-content/40">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(slide.updated_at), { locale: fr, addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

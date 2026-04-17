import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  AlertCircle,
  Clock,
  CheckCircle2,
  Layout,
  Tag,
  ChevronRight,
  Loader2,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  time_spent?: number;
  last_started_at?: string | null;
}

const ProjectsPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo' as const,
    priority: 'medium' as const,
    due_date: ''
  });

  // Pour le timer local visuel
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const resp = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTasks(resp.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/tasks`, newTask, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', due_date: '' });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (id: string, status: string) => {
    try {
      await axios.put(`${API_URL}/tasks/${id}`, { status }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTimer = async (id: string) => {
    try {
      await axios.post(`${API_URL}/tasks/${id}/timer`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id: string) => {
      if (!confirm("Supprimer cette tâche ?")) return;
      try {
          await axios.delete(`${API_URL}/tasks/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          fetchTasks();
      } catch (err) {
          console.error(err);
      }
  }

  const columns = [
    { id: 'todo', label: 'À faire', color: 'bg-slate-100', icon: Clock },
    { id: 'in_progress', label: 'En cours', color: 'bg-indigo-50', icon: Loader2 },
    { id: 'done', label: 'Terminé', color: 'bg-emerald-50', icon: CheckCircle2 }
  ];

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'high': return 'bg-rose-500 text-white';
      case 'medium': return 'bg-amber-500 text-white';
      default: return 'bg-sky-500 text-white';
    }
  };

  const formatTime = (task: Task) => {
      let seconds = task.time_spent || 0;
      if (task.last_started_at) {
          const startedAt = new Date(task.last_started_at + 'Z').getTime();
          seconds += Math.floor((now - startedAt) / 1000);
      }
      
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600 h-10 w-10" />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <Layout className="h-10 w-10 text-indigo-600" />
            Project OS
          </h1>
          <p className="text-gray-500 font-bold mt-2 flex items-center gap-2">
            Gestion collaborative, Kanban & Chronométrage des missions.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Chercher une tâche..."
              className="bg-white border-none rounded-2xl pl-12 pr-6 py-4 shadow-sm ring-1 ring-gray-950/5 focus:ring-2 focus:ring-indigo-600 outline-none w-64 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white p-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Plus className="h-6 w-6" />
            <span className="hidden sm:inline">Nouvelle Tâche</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden h-full">
        {columns.map((col) => (
          <div key={col.id} className="flex flex-col h-full bg-white/50 backdrop-blur-sm rounded-[32px] border border-gray-100/50 p-6 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-3">
                <div className={cn("p-2.5 rounded-2xl border", col.color, col.id === 'todo' ? 'border-slate-200' : col.id === 'in_progress' ? 'border-indigo-200' : 'border-emerald-200')}>
                  <col.icon className={cn("h-6 w-6", col.id === 'todo' ? 'text-slate-600' : col.id === 'in_progress' ? 'text-indigo-600' : 'text-emerald-600')} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">{col.label}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                    {tasks.filter(t => t.status === col.id).length} TÂCHES
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 pr-2 pb-10">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div 
                  key={task.id} 
                  className={cn("bg-white rounded-3xl p-6 shadow-sm border transition-all group relative cursor-pointer", 
                    task.last_started_at ? 'border-indigo-400 shadow-indigo-100/50 shadow-xl scale-[1.02]' : 'border-gray-100 hover:shadow-xl hover:shadow-gray-400/10 hover:border-indigo-100'
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                      getPriorityColor(task.priority)
                    )}>
                      {task.priority === 'high' ? 'Urgent' : task.priority === 'medium' ? 'Standard' : 'Cool'}
                    </span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => deleteTask(task.id)} className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{task.description || "Pas de description."}</p>
                  
                  {/* Timer UI */}
                  <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <button 
                              onClick={(e) => { e.stopPropagation(); toggleTimer(task.id); }}
                              className={cn(
                                  "h-10 w-10 flex items-center justify-center rounded-xl text-white font-black shadow-lg transition-transform active:scale-95",
                                  task.last_started_at ? 'bg-rose-500 shadow-rose-500/30' : 'bg-emerald-500 shadow-emerald-500/30'
                              )}
                          >
                              {task.last_started_at ? (
                                <div className="h-3 w-3 bg-white rounded-sm"></div> // Pause icon
                              ) : (
                                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div> // Play icon
                              )}
                          </button>
                          <div>
                              <p className={cn("text-xs font-black uppercase tracking-widest", task.last_started_at ? 'text-indigo-600 animate-pulse' : 'text-gray-400')}>
                                  {task.last_started_at ? 'En cours...' : 'Chronomètre'}
                              </p>
                              <p className="text-xl font-black text-gray-900 font-mono tracking-tighter">
                                  {formatTime(task)}
                              </p>
                          </div>
                      </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs font-bold">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Pas de date'}</span>
                    </div>
                    
                    <div className="flex gap-1.5">
                      {col.id !== 'todo' && (
                        <button onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'todo'); }} className="p-1.5 h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                          <Clock className="h-4 w-4" />
                        </button>
                      )}
                      {col.id !== 'in_progress' && (
                        <button onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'in_progress'); }} className="p-1.5 h-8 w-8 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100">
                          <Loader2 className="h-4 w-4" />
                        </button>
                      )}
                      {col.id !== 'done' && (
                        <button onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'done'); }} className="p-1.5 h-8 w-8 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-100">
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {tasks.filter(t => t.status === col.id).length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-center opacity-40 bg-white/50 rounded-3xl border border-dashed border-gray-200">
                  <Tag className="h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Aucune tâche</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Création */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl p-8 lg:p-12 animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Nouvelle Mission</h2>
            
            <form onSubmit={handleCreateTask} className="space-y-8">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2 mb-3 block">Intitulé de la tâche</label>
                <input 
                  type="text" 
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  required
                  placeholder="Ex: Finaliser le devis technique"
                  className="w-full p-6 bg-gray-50 rounded-3xl border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-0 outline-none transition-all font-bold text-lg"
                />
              </div>

              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2 mb-3 block">Détails</label>
                <textarea 
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Décrivez les objectifs..."
                  rows={3}
                  className="w-full p-6 bg-gray-50 rounded-3xl border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-0 outline-none transition-all font-medium text-gray-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2 mb-3 block">Urgence</label>
                  <select 
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none font-bold text-gray-700"
                  >
                    <option value="low">Cool (Basse)</option>
                    <option value="medium">Standard</option>
                    <option value="high">Urgent (Haute)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2 mb-3 block">Échéance</label>
                  <input 
                    type="date" 
                    value={newTask.due_date}
                    onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none font-bold text-gray-700"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 p-5 rounded-2xl bg-gray-100 font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-[2] p-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                >
                  Lancer la tâche
                  <ArrowRight className="h-6 w-6" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;

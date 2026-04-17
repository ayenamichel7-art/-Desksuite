import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { 
  Plus, 
  Download, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreVertical,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CalendarEvent {
  id: string;
  type: 'event' | 'task';
  title: string;
  description?: string;
  start: string;
  end: string;
  color: string;
  location?: string;
  allDay: boolean;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    color: '#3b82f6',
    start_at: '',
    end_at: '',
    is_full_day: false
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get('/events');
      setEvents(data);
    } catch (error) {
      toast.error('Erreur lors du chargement du calendrier');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    setFormData({
      ...formData,
      start_at: selectInfo.startStr.slice(0, 16),
      end_at: selectInfo.endStr.slice(0, 16),
      is_full_day: selectInfo.allDay
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event) {
        setSelectedEvent(event);
        // On pourrait ouvrir un mode édition ici
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/events', formData);
      toast.success('Événement ajouté');
      setIsModalOpen(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const handleExportICAL = async () => {
    try {
        const { data } = await axios.post('http://localhost:5000/calendar/export', { events }, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'workspace_calendar.ics');
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('Calendrier exporté (.ics)');
    } catch (error) {
        toast.error('Erreur lors de l\'export');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      color: '#3b82f6',
      start_at: '',
      end_at: '',
      is_full_day: false
    });
  };

  return (
    <div className="p-8 h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
            <span className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <CalendarIcon className="w-8 h-8" />
            </span>
            Calendrier Unifié
          </h1>
          <p className="mt-1 text-base-content/60">Vue centralisée de vos événements et échéances de tâches.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportICAL}
            className="btn btn-ghost border-base-300 hover:bg-base-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Synchroniser (iCal)
          </button>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="btn btn-primary shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvel Événement
          </button>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 bg-base-100 border border-base-content/5 rounded-3xl overflow-hidden shadow-xl p-6 relative">
        {loading && (
            <div className="absolute inset-0 bg-base-100/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        )}
        
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          locale={frLocale}
          events={events as any}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="100%"
          eventContent={(arg) => (
            <div className={cn(
                "p-1 rounded-md text-[10px] truncate border-l-4 overflow-hidden",
                arg.event.extendedProps.type === 'task' ? "bg-red-500/10 border-red-500 text-red-700" : "bg-primary/10 border-primary text-primary-content"
            )}>
                <b>{arg.timeText}</b>
                <span className="ml-1">{arg.event.title}</span>
            </div>
          )}
        />
      </div>

      {/* Modal Add Event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
          <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-lg border border-white/5 overflow-hidden">
             <div className="p-6 border-b border-base-content/5 flex items-center justify-between bg-primary/5">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
                    Nouvel Événement
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-base-200 rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-base-content/40">Titre de l'événement</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Réunion, Déjeuner, Deadlines..." 
                    className="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-primary/50" 
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-base-content/40">Début</label>
                    <input 
                      type="datetime-local" 
                      value={formData.start_at}
                      onChange={(e) => setFormData({...formData, start_at: e.target.value})}
                      className="input input-bordered w-full rounded-xl" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-base-content/40">Fin</label>
                    <input 
                      type="datetime-local" 
                      value={formData.end_at}
                      onChange={(e) => setFormData({...formData, end_at: e.target.value})}
                      className="input input-bordered w-full rounded-xl" 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-2xl">
                    <input 
                        type="checkbox" 
                        checked={formData.is_full_day}
                        onChange={(e) => setFormData({...formData, is_full_day: e.target.checked})}
                        className="checkbox checkbox-primary checkbox-sm" 
                    />
                    <span className="text-sm font-medium">Journée entière</span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-base-content/40">Lieu</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30" />
                    <input 
                      type="text" 
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Bureau, Zoom, Paris..." 
                      className="input input-bordered w-full pl-10 rounded-xl" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-base-content/40">Couleur</label>
                    <div className="flex gap-2">
                        {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setFormData({...formData, color: c})}
                                className={cn(
                                    "w-8 h-8 rounded-full border-2 transition-all",
                                    formData.color === c ? "border-base-content scale-110 shadow-lg" : "border-transparent opacity-60"
                                )}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>

                <div className="pt-6 flex items-center gap-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary flex-1 shadow-lg shadow-primary/20 rounded-xl"
                  >
                    Confirmer
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-ghost rounded-xl"
                  >
                    Annuler
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}
    </div>
  );
}

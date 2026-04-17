import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Hash, 
  Users, 
  MessageSquare, 
  Search, 
  Plus, 
  AtSign,
  Paperclip,
  MoreVertical,
  Circle
} from 'lucide-react';
import clsx from 'clsx';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { echo } from '@/lib/echo';

interface ChatMessage {
  id: number;
  content: string;
  user?: {
      id: string;
      full_name: string;
      avatar_url?: string;
  };
  is_bot: boolean;
  type: string;
  metadata?: any;
  created_at: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentChannel, setCurrentChannel] = useState('general');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tenant ID from local storage or context (assuming it's fixed here for demo)
  const tenantId = JSON.parse(localStorage.getItem('tenant') || '{}').id;

  useEffect(() => {
    fetchMe();
    fetchMessages();
    setupEcho();

    return () => {
        echo.leave(`chat.${tenantId}.${currentChannel}`);
    };
  }, [currentChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMe = async () => {
      try {
          const { data } = await axios.get('/auth/me');
          setCurrentUser(data);
      } catch (e) {}
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/chat/messages?channel=${currentChannel}`);
      setMessages(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const setupEcho = () => {
      if (!tenantId) return;

      echo.private(`chat.${tenantId}.${currentChannel}`)
          .listen('MessageSent', (e: any) => {
              console.log('Echo received message:', e);
              // Avoid duplicate if sent by me (though controller says .toOthers())
              setMessages((prev) => {
                  if (prev.find(m => m.id === e.message.id)) return prev;
                  return [...prev, e.message];
              });
          });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const content = input;
    setInput('');

    try {
      const { data } = await axios.post('/chat/messages', {
        content,
        channel: currentChannel,
        type: 'text'
      });
      // Append manually for instant feedback
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      toast.error('Impossible d\'envoyer le message');
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-base-100 rounded-3xl border border-base-content/5 overflow-hidden shadow-2xl animate-in fade-in duration-500">
      
      {/* Sidebar - Channels & People */}
      <div className="w-64 border-r border-base-content/5 flex flex-col bg-base-200/30">
        <div className="p-6 border-b border-base-content/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Équipe
            </h2>
            <button className="p-1.5 hover:bg-base-200 rounded-lg">
                <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="input input-sm border-0 bg-base-100 w-full pl-10 rounded-xl" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Channels */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/30 mb-3 px-2">Salons</h3>
            <div className="space-y-1">
              {['general', 'projets', 'marketing', 'developpement'].map(ch => (
                <button
                  key={ch}
                  onClick={() => setCurrentChannel(ch)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all",
                    currentChannel === ch ? "bg-primary text-primary-content" : "hover:bg-base-200"
                  )}
                >
                  <Hash className={cn("w-4 h-4", currentChannel === ch ? "" : "text-base-content/40")} />
                  <span className="text-sm font-medium capitalize">{ch}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Users */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/30 mb-3 px-2">Membres</h3>
            <div className="space-y-1">
              {[
                  { name: 'Assistant AI', bot: true, online: true },
                  { name: 'Admin User', online: true },
                  { name: 'Michel N.', online: false }
              ].map(u => (
                <button
                  key={u.name}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-base-200 transition-all text-left"
                >
                  <div className="relative">
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                        u.bot ? "bg-primary/20 text-primary" : "bg-base-300"
                    )}>
                        {u.bot ? <Bot className="w-4 h-4" /> : u.name[0]}
                    </div>
                    <Circle className={cn(
                        "w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 fill-current",
                        u.online ? "text-success" : "text-base-content/20"
                    )} />
                  </div>
                  <span className="text-sm font-medium truncate">{u.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-base-100">
        {/* Chat Header */}
        <div className="p-6 border-b border-base-content/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="p-2.5 bg-primary/10 rounded-2xl">
                <Hash className="w-6 h-6 text-primary" />
             </div>
             <div>
                <h2 className="text-lg font-bold capitalize">{currentChannel}</h2>
                <div className="flex items-center gap-2 text-xs text-base-content/40">
                    <Users className="w-3 h-3" />
                    <span>8 membres • Bienvenue dans {currentChannel}</span>
                </div>
             </div>
          </div>
          <button className="btn btn-ghost btn-circle">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
            {loading ? (
                <div className="h-full flex items-center justify-center">
                    <div className="loading loading-spinner loading-lg text-primary"></div>
                </div>
            ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 italic">
                    <MessageSquare className="w-16 h-16 mb-4" />
                    <p>Début de la discussion dans #{currentChannel}</p>
                </div>
            ) : (
                messages.map((msg) => (
                    <div key={msg.id} className={cn(
                        "flex gap-4",
                        msg.user?.id === currentUser?.id ? "flex-row-reverse" : ""
                    )}>
                        <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                            msg.is_bot ? "bg-primary text-white" : "bg-base-200"
                        )}>
                            {msg.is_bot ? <Bot className="w-5 h-5" /> : (msg.user?.avatar_url ? <img src={msg.user.avatar_url} className="rounded-2xl" /> : msg.user?.full_name[0])}
                        </div>
                        <div className={cn(
                            "flex flex-col gap-1 max-w-[70%]",
                            msg.user?.id === currentUser?.id ? "items-end" : ""
                        )}>
                            <div className="flex items-center gap-2 px-1">
                                <span className="text-xs font-bold text-base-content/60">{msg.is_bot ? 'Assistant AI' : msg.user?.full_name}</span>
                                <span className="text-[10px] text-base-content/30">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className={cn(
                                "px-5 py-3 rounded-2xl text-sm transition-all leading-relaxed",
                                msg.user?.id === currentUser?.id 
                                    ? "bg-primary text-primary-content rounded-tr-sm shadow-md" 
                                    : "bg-base-200 text-base-content rounded-tl-sm"
                            )}>
                                {msg.content}
                            </div>
                            {msg.is_bot && msg.metadata?.intent && (
                                <div className="mt-3 w-full bg-base-100/50 p-4 rounded-2xl border border-primary/20 backdrop-blur-sm animate-in zoom-in-95 duration-300">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-3">
                                        <Sparkles className="w-3 h-3" />
                                        Assistant Intelligence
                                    </div>
                                    <div className="text-xs font-bold text-base-content/60 mb-4 opacity-70 italic">
                                        Voulez-vous effectuer l'action : <span className="text-primary">{msg.metadata.intent.action.replace('_', ' ')}</span> ?
                                    </div>
                                    <button 
                                        onClick={() => {
                                            toast.success(`Action confirmée : ${msg.metadata.intent.action}`);
                                        }}
                                        className="btn btn-primary btn-xs rounded-lg px-4 font-black shadow-lg shadow-primary/20 border-0"
                                    >
                                        Confirmer l'action
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-8 pt-0">
          <div className="bg-base-200/50 rounded-3xl p-4 border border-base-content/5 focus-within:border-primary/30 transition-all shadow-inner">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                }}
                placeholder={`Envoyez un message dans #${currentChannel}...`}
                className="w-full bg-transparent resize-none border-0 focus:ring-0 p-0 text-sm h-12 max-h-32 mb-2"
            />
            <div className="flex items-center justify-between border-t border-base-content/5 pt-3">
                <div className="flex items-center gap-1">
                    <button className="btn btn-ghost btn-sm btn-circle text-base-content/30 hover:text-primary">
                        <Paperclip className="w-4 h-4" />
                    </button>
                    <button className="btn btn-ghost btn-sm btn-circle text-base-content/30 hover:text-primary">
                        <AtSign className="w-4 h-4" />
                    </button>
                    <button className="btn btn-ghost btn-sm btn-circle text-base-content/30 hover:text-primary">
                        <Sparkles className="w-4 h-4" />
                    </button>
                </div>
                <button 
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="btn btn-primary btn-sm rounded-xl px-6 font-bold shadow-lg shadow-primary/20"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}

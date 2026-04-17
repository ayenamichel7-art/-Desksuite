import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  CheckCircle, 
  PenTool, 
  FileText, 
  Loader2, 
  ChevronRight,
  ShieldCheck,
  Eraser,
  Lock
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const PublicSignPage: React.FC = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState<any>(null);
  const [signerName, setSignerName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const fetchQuotation = async () => {
    try {
      const resp = await axios.get(`${API_URL}/public/quotation/${id}`);
      setData(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Canvas Drawing Logic
  const startDrawing = (e: any) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
  };

  const draw = (e: any) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0].clientY) - rect.top;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canvasRef.current || !signerName) return;

    const signature_data = canvasRef.current.toDataURL(); // Base64
    setSigning(true);

    try {
      await axios.post(`${API_URL}/public/quotation/${id}/sign`, {
        signature_data,
        signer_name: signerName
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la signature.");
    } finally {
      setSigning(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Loader2 className="animate-spin text-indigo-600 h-12 w-12" />
    </div>
  );

  if (success) {
    const downloadPdf = () => {
      window.open(`${API_URL}/public/quotation/${id}/pdf`, '_blank');
    };

    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 shadow-xl shadow-green-200/50 scale-110">
          <CheckCircle className="h-12 w-12" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">Engagement Réussi !</h1>
        <p className="text-gray-600 max-w-md text-lg leading-relaxed mb-8">
          Merci pour votre confiance. Le devis <strong>{data?.quotation.reference}</strong> a été signé électroniquement. 
          Votre facture sera émise prochainement par <strong>{data?.branding.name}</strong>.
        </p>
        
        <button 
          onClick={downloadPdf}
          className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 border-2 border-indigo-50 hover:border-indigo-100 hover:shadow-2xl transition-all flex items-center gap-3 group"
        >
          <FileText className="h-6 w-6 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
          Télécharger l'Acte Scellé (PDF)
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row p-0 lg:p-12 gap-8 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Visualisation Devis */}
      <div className="flex-1 overflow-hidden">
        <div className="bg-white rounded-none lg:rounded-[40px] shadow-2xl border border-gray-100 flex flex-col h-full ring-1 ring-gray-950/5">
          <div className="p-8 lg:p-12 border-b border-gray-50 flex items-center justify-between bg-gray-50/30 backdrop-blur-md">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{data?.quotation.reference}</h1>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Émis par {data?.branding.name}</p>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-3xl font-black text-indigo-600 tracking-tighter">
                {parseFloat(data?.quotation.total_amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Montant Total T.T.C.</div>
            </div>
          </div>

          <div className="p-8 lg:p-12 flex-1 overflow-y-auto space-y-10 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Destinataire</h3>
                <p className="text-xl font-bold text-gray-900">{data?.quotation.contact.name}</p>
                <p className="text-gray-500 font-medium mt-1">{data?.quotation.contact.email}</p>
              </div>
              <div className="sm:text-right">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Validité</h3>
                <p className="text-xl font-bold text-gray-900">
                  {new Date(data?.quotation.valid_until || data.quotation.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-gray-500 font-medium mt-1">Date d'échéance de l'offre</p>
              </div>
            </div>

            <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Description</th>
                    <th className="pb-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Qté</th>
                    <th className="pb-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.quotation.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-6 pr-4">
                        <p className="text-lg font-bold text-gray-800">{item.description}</p>
                        <p className="text-xs text-gray-400 font-medium mt-1">Article premium / Service Cloud</p>
                      </td>
                      <td className="py-6 text-center font-bold text-gray-500">{item.quantity}</td>
                      <td className="py-6 text-right text-lg font-black text-indigo-600">
                        {parseFloat(item.total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="pt-8 border-t border-dashed border-gray-200">
                <div className="flex items-start gap-4 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <ShieldCheck className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-indigo-900 mb-1">Clause d'acceptation</h4>
                        <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                            En signant ce document, vous acceptez les conditions générales de vente et vous engagez à régler le montant total à réception de la facture. 
                            La signature électronique apposée ci-contre vaut accord définitif.
                        </p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Module */}
      <div className="w-full lg:w-[450px]">
        <div className="bg-white rounded-none lg:rounded-[40px] shadow-2xl border border-gray-100 p-8 lg:p-10 flex flex-col h-full">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 justify-center lg:justify-start">
                <PenTool className="text-indigo-600 h-8 w-8" />
                Signer & Accepter
            </h2>
            <p className="text-gray-500 font-medium mt-3">Finalisez votre commande en quelques secondes.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-8">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block pl-1">Nom du Signataire</label>
              <div className="relative group">
                <input 
                  type="text" 
                  required
                  placeholder="Jean Dupont"
                  value={signerName}
                  onChange={e => setSignerName(e.target.value)}
                  className="w-full p-5 pl-14 rounded-3xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-0 transition-all text-lg font-bold shadow-sm"
                />
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3 px-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Tracé de Signature</label>
                <button 
                  type="button" 
                  onClick={clearCanvas}
                  className="text-xs font-black text-indigo-600 flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                >
                  <Eraser className="h-3.5 w-3.5" />
                  EFFACER
                </button>
              </div>
              <div className="flex-1 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 relative overflow-hidden group shadow-inner">
                <canvas 
                  ref={canvasRef}
                  width={370}
                  height={300}
                  onMouseDown={startDrawing}
                  onMouseUp={stopDrawing}
                  onMouseMove={draw}
                  onTouchStart={startDrawing}
                  onTouchEnd={stopDrawing}
                  onTouchMove={draw}
                  className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                />
                {!isDrawing && !canvasRef.current?.toDataURL().includes('base64,') && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20 transition-opacity group-hover:opacity-30">
                        <PenTool className="h-16 w-16 text-gray-900 mb-4" />
                        <p className="text-sm font-black text-gray-900 tracking-widest uppercase">Signez ici</p>
                    </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
                <button 
                type="submit"
                disabled={signing || !signerName}
                className="w-full p-6 bg-gray-900 text-white rounded-[28px] font-black text-xl shadow-2xl shadow-gray-400/30 hover:shadow-indigo-600/20 hover:bg-gray-800 transition-all active:scale-[0.98] flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {signing ? (
                    <Loader2 className="animate-spin h-6 w-6" />
                ) : (
                    <>
                    Signer & Confirmer
                    <ChevronRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                    </>
                )}
                </button>
                <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-wider px-4">
                    Signature légale horodatée sécurisée par la technologie Desksuite Workspace OS
                </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicSignPage;

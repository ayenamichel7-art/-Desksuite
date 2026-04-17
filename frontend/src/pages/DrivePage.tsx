import { useEffect, useState, useRef } from 'react';
import { driveApi } from '@/services/api';
import { DriveContents, Folder, FileItem } from '@/types';
import {
  Upload,
  FolderPlus,
  ChevronRight,
  Home,
  MoreVertical,
  Download,
  Trash2,
  RotateCcw,
  FileIcon,
  FolderIcon,
  Image,
  FileText,
  Table2,
  Film,
  Archive,
  Scan,
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const mimeIcons: Record<string, typeof FileIcon> = {
  'image/': Image,
  'text/': FileText,
  'application/pdf': FileText,
  'application/vnd': Table2,
  'video/': Film,
  'application/zip': Archive,
};

function getFileIcon(mime: string | null) {
  if (!mime) return FileIcon;
  for (const [prefix, icon] of Object.entries(mimeIcons)) {
    if (mime.startsWith(prefix)) return icon;
  }
  return FileIcon;
}

export default function DrivePage() {
  const [data, setData] = useState<DriveContents>({ folders: [], files: [], current_folder: null });
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Folder[]>([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- États OCR
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const ocrInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadContents();
  }, [currentFolderId]);

  const loadContents = async () => {
    setLoading(true);
    try {
      const res = await driveApi.list(currentFolderId);
      setData(res.data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folder: Folder) => {
    setBreadcrumbs((prev) => [...prev, folder]);
    setCurrentFolderId(folder.id);
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentFolderId(null);
      setBreadcrumbs([]);
    } else {
      setCurrentFolderId(breadcrumbs[index].id);
      setBreadcrumbs((prev) => prev.slice(0, index + 1));
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await driveApi.createFolder(newFolderName, currentFolderId);
      setNewFolderName('');
      setShowNewFolder(false);
      loadContents();
      toast.success('Dossier créé');
    } catch {
      toast.error('Erreur');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    for (const file of Array.from(files)) {
      try {
        await driveApi.upload(file, currentFolderId);
        toast.success(`${file.name} uploadé`);
      } catch {
        toast.error(`Erreur: ${file.name}`);
      }
    }
    loadContents();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTrash = async (fileId: string) => {
    await driveApi.trash(fileId);
    toast.success('Fichier mis à la corbeille');
    loadContents();
  };

  const handleOcr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    const toastId = toast.loading('Analyse de l\'image en cours...');
    try {
      const res = await driveApi.ocr(file);
      const text = res.data.text || JSON.stringify(res.data, null, 2);
      setOcrResult(text);
      toast.success('Texte extrait avec succès !', { id: toastId });
    } catch {
      toast.error('Erreur OCR. Veuillez vérifier qu\'il s\'agit d\'une image supportée.', { id: toastId });
    } finally {
      setOcrLoading(false);
      if (ocrInputRef.current) ocrInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Drive</h1>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 mt-2 text-sm">
            <button onClick={() => navigateToBreadcrumb(-1)} className="hover:text-primary flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Racine
            </button>
            {breadcrumbs.map((bc, i) => (
              <span key={bc.id} className="flex items-center gap-1">
                <ChevronRight className="w-3 h-3 text-base-content/30" />
                <button onClick={() => navigateToBreadcrumb(i)} className="hover:text-primary">
                  {bc.name}
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nouveau Bouton OCR */}
          <button onClick={() => ocrInputRef.current?.click()} className="btn btn-secondary btn-sm gap-2" disabled={ocrLoading}>
            {ocrLoading ? <span className="loading loading-spinner loading-xs" /> : <Scan className="w-4 h-4" />}
            Scan Intelligent
          </button>
          <input ref={ocrInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleOcr} />

          <button onClick={() => setShowNewFolder(true)} className="btn btn-ghost btn-sm gap-2">
            <FolderPlus className="w-4 h-4" /> Dossier
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary btn-sm gap-2">
            <Upload className="w-4 h-4" /> Upload
          </button>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleUpload} />
        </div>
      </div>

      {/* New Folder Input */}
      {showNewFolder && (
        <div className="glass-card p-4 flex items-center gap-3 animate-scale-in">
          <FolderIcon className="w-5 h-5 text-amber-500" />
          <input
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createFolder()}
            className="input input-bordered input-sm flex-1"
            placeholder="Nom du dossier..."
          />
          <button onClick={createFolder} className="btn btn-primary btn-sm">Créer</button>
          <button onClick={() => setShowNewFolder(false)} className="btn btn-ghost btn-sm">Annuler</button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : (
        <>
          {/* Folders */}
          {data.folders.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-base-content/50 mb-3">Dossiers</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {data.folders.map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() => navigateToFolder(folder)}
                    className="file-card flex items-center gap-3"
                  >
                    <FolderIcon className="w-8 h-8 text-amber-500 shrink-0" />
                    <span className="text-sm font-medium truncate">{folder.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {data.files.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-base-content/50 mb-3">Fichiers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.files.map((file) => {
                  const Icon = getFileIcon(file.mime_type);
                  return (
                    <div key={file.id} className="file-card flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="w-8 h-8 text-primary/60 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-base-content/40">{file.formatted_size}</p>
                        </div>
                      </div>
                      <div className="dropdown dropdown-end">
                        <button tabIndex={0} className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-xl w-48 z-50">
                          <li>
                            <a onClick={() => window.open(file.presigned_url || '#')}>
                              <Download className="w-4 h-4" /> Télécharger
                            </a>
                          </li>
                          <li>
                            <a onClick={() => handleTrash(file.id)} className="text-error">
                              <Trash2 className="w-4 h-4" /> Supprimer
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {data.folders.length === 0 && data.files.length === 0 && (
            <div className="glass-card p-12 text-center animate-fade-in">
              <FolderIcon className="w-16 h-16 text-base-content/10 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ce dossier est vide</h3>
              <p className="text-sm text-base-content/40 mb-6">Uploadez des fichiers ou créez un nouveau dossier</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setShowNewFolder(true)} className="btn btn-ghost btn-sm gap-2">
                  <FolderPlus className="w-4 h-4" /> Nouveau dossier
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary btn-sm gap-2">
                  <Upload className="w-4 h-4" /> Uploader
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* OCR Modal */}
      {ocrResult !== null && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl animate-fade-in shadow-2xl border border-secondary/20">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-secondary">
              <Scan className="w-6 h-6" />
              Intelligence Artificielle (OCR)
            </h3>
            <p className="text-sm text-base-content/60 mb-2">Texte extrait de votre image :</p>
            <textarea 
              className="textarea textarea-bordered w-full h-64 font-mono text-sm focus:outline-secondary" 
              readOnly 
              value={ocrResult} 
            />
            <div className="modal-action">
              <button className="btn btn-secondary" onClick={() => {
                  navigator.clipboard.writeText(ocrResult);
                  toast.success('Texte copié !');
              }}>Copier le texte</button>
              <button className="btn btn-ghost" onClick={() => setOcrResult(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

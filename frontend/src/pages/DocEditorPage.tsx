import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import { documentsApi } from '@/services/api';
import { Document } from '@/types';
import {
  ArrowLeft,
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo2,
  Redo2,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Save,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function DocEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<Document | null>(null);
  const [docName, setDocName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Commencez à écrire...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Highlight.configure({ multicolor: true }),
    ],
    content: '',
    onUpdate: () => {
      setSaved(false);
    },
  });

  useEffect(() => {
    if (id) loadDoc();
  }, [id]);

  const loadDoc = async () => {
    try {
      const res = await documentsApi.get(id!);
      const d = res.data;
      setDoc(d);
      setDocName(d.name);
      if (d.content && editor) {
        editor.commands.setContent(d.content);
      }
    } catch {
      toast.error('Document introuvable');
      navigate('/docs');
    }
  };

  // Injecter le contenu quand l'éditeur est prêt
  useEffect(() => {
    if (editor && doc?.content) {
      editor.commands.setContent(doc.content);
    }
  }, [editor, doc]);

  const saveDoc = useCallback(async () => {
    if (!editor || !id) return;
    setSaving(true);
    try {
      await documentsApi.update(id, {
        name: docName,
        content: editor.getJSON(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error('Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  }, [editor, id, docName]);

  // Auto-save toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(saveDoc, 30000);
    return () => clearInterval(interval);
  }, [saveDoc]);

  // Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDoc();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveDoc]);

  if (!editor) return null;

  const ToolBtn = ({
    action,
    isActive,
    icon: Icon,
    title,
  }: {
    action: () => void;
    isActive?: boolean;
    icon: typeof Bold;
    title: string;
  }) => (
    <button
      onClick={action}
      title={title}
      className={clsx('toolbar-btn', isActive && 'active')}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => navigate('/docs')} className="btn btn-ghost btn-sm btn-circle">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <input
          value={docName}
          onChange={(e) => { setDocName(e.target.value); setSaved(false); }}
          className="text-lg font-semibold bg-transparent border-none outline-none flex-1 focus:bg-base-200/50 px-2 py-1 rounded-lg transition-colors"
          placeholder="Nom du document..."
        />
        <button onClick={saveDoc} disabled={saving} className="btn btn-primary btn-sm gap-2">
          {saving ? (
            <span className="loading loading-spinner loading-xs" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? 'Sauvegardé' : 'Sauvegarder'}
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 flex-wrap p-2 bg-base-200/50 rounded-xl mb-3 border border-base-300/40">
        <ToolBtn action={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} title="Gras" />
        <ToolBtn action={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} title="Italique" />
        <ToolBtn action={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={UnderlineIcon} title="Souligné" />
        <ToolBtn action={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={Strikethrough} title="Barré" />
        <ToolBtn action={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} icon={Highlighter} title="Surligné" />

        <div className="w-px h-6 bg-base-300 mx-1" />

        <ToolBtn action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={Heading1} title="Titre 1" />
        <ToolBtn action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} title="Titre 2" />
        <ToolBtn action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} icon={Heading3} title="Titre 3" />
        <ToolBtn action={() => editor.chain().focus().setParagraph().run()} isActive={editor.isActive('paragraph')} icon={Type} title="Paragraphe" />

        <div className="w-px h-6 bg-base-300 mx-1" />

        <ToolBtn action={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} title="Gauche" />
        <ToolBtn action={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} title="Centre" />
        <ToolBtn action={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} icon={AlignRight} title="Droite" />

        <div className="w-px h-6 bg-base-300 mx-1" />

        <ToolBtn action={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} title="Liste à puces" />
        <ToolBtn action={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} title="Liste numérotée" />
        <ToolBtn action={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={Quote} title="Citation" />
        <ToolBtn action={() => editor.chain().focus().setHorizontalRule().run()} icon={Minus} title="Ligne horizontale" />

        <div className="w-px h-6 bg-base-300 mx-1" />

        <ToolBtn action={() => editor.chain().focus().undo().run()} icon={Undo2} title="Annuler" />
        <ToolBtn action={() => editor.chain().focus().redo().run()} icon={Redo2} title="Rétablir" />
      </div>

      {/* Editor */}
      <div className="tiptap-editor flex-1 glass-card overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}

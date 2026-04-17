<?php

namespace App\Http\Controllers\Api;

use App\Data\DocumentData;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Document;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    /**
     * Lister les documents par type.
     */
    public function index(Request $request)
    {
        $type = $request->query('type'); // doc, sheet, slide

        $documents = Document::query()
            ->when($type, fn ($q) => $q->ofType($type))
            ->orderBy('updated_at', 'desc')
            ->paginate(20);

        return response()->json($documents);
    }

    /**
     * Créer un nouveau document.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:doc,sheet,slide',
            'name' => 'required|string|max:255',
            'content' => 'nullable|array',
        ]);

        // Contenu initial par défaut selon le type
        $defaultContent = match ($validated['type']) {
            'doc' => ['type' => 'doc', 'content' => [['type' => 'paragraph']]],
            'sheet' => [['name' => 'Sheet1', 'data' => [], 'config' => []]],
            'slide' => ['slides' => [['content' => '<h1>Nouveau slide</h1>']]],
        };

        $document = Document::create([
            ...$validated,
            'content' => $validated['content'] ?? $defaultContent,
            'last_modified_by' => auth()->id(),
        ]);

        AuditLog::log('DOCUMENT_CREATED', [
            'document_id' => $document->id,
            'type' => $document->type,
            'name' => $document->name,
        ]);

        return response()->json(DocumentData::from($document), 201);
    }

    /**
     * Voir un document.
     */
    public function show(Document $document)
    {
        return response()->json(DocumentData::from($document));
    }

    /**
     * Mettre à jour le document (sauvegarde auto du contenu).
     */
    public function update(Request $request, Document $document)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'content' => 'sometimes|array',
        ]);

        $document->update([
            ...$validated,
            'last_modified_by' => auth()->id(),
        ]);

        AuditLog::log('DOCUMENT_UPDATED', [
            'document_id' => $document->id,
            'type' => $document->type,
        ]);

        return response()->json(DocumentData::from($document->fresh()));
    }

    /**
     * Supprimer un document.
     */
    public function destroy(Document $document)
    {
        $document->delete();

        AuditLog::log('DOCUMENT_DELETED', ['document_id' => $document->id]);

        return response()->json(['message' => 'Document deleted.']);
    }
}

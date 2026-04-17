<?php

namespace App\Http\Controllers\Api;

use App\Data\FileData;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\File;
use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DriveController extends Controller
{
    /**
     * Lister les fichiers et dossiers à la racine ou dans un dossier spécifique.
     */
    public function index(Request $request)
    {
        $folderId = $request->query('folder_id');
        $showTrashed = $request->boolean('trashed', false);

        $folders = Folder::where('parent_id', $folderId)
            ->when($showTrashed, fn ($q) => $q->onlyTrashed())
            ->orderBy('name')
            ->get();

        $files = File::where('folder_id', $folderId)
            ->when($showTrashed, fn ($q) => $q->where('is_trashed', true))
            ->when(! $showTrashed, fn ($q) => $q->where('is_trashed', false))
            ->orderBy('name')
            ->get()
            ->map(fn (File $file) => FileData::from([
                ...$file->toArray(),
                'formatted_size' => $file->formatted_size,
                'presigned_url' => $file->getPresignedUrl(),
            ]));

        return response()->json([
            'folders' => $folders,
            'files' => $files,
            'current_folder' => $folderId ? Folder::find($folderId) : null,
        ]);
    }

    /**
     * Créer un nouveau dossier.
     */
    public function createFolder(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|uuid|exists:folders,id',
        ]);

        $folder = Folder::create([
            ...$validated,
            'created_by' => auth()->id(),
        ]);

        AuditLog::log('FOLDER_CREATED', ['folder_id' => $folder->id, 'name' => $folder->name]);

        return response()->json($folder, 201);
    }

    /**
     * Upload d'un fichier vers MinIO.
     */
    /**
     * Scanner l'image / PDF avec l'OCR local Python
     */
    public function ocr(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg,tiff|max:15360', // Max 15MB
        ]);

        $file = $request->file('file');

        try {
            // Envoyer au Cerveau Python sans le stocker directement sur MinIO
            $response = Http::attach(
                'file', file_get_contents($file->getRealPath()), $file->getClientOriginalName()
            )->post(config('services.python_worker.url').'/ocr/extract');

            if ($response->successful()) {
                // Succès de l'extraction
                return response()->json($response->json());
            }

            return response()->json(['error' => 'Le service OCR Python a retourné une erreur.'], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Impossible de contacter le Worker Python.'], 500);
        }
    }

    public function upload(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'max:104857600', function ($attribute, $value, $fail) {
                $blocked = ['php', 'php3', 'php4', 'php5', 'phtml', 'exe', 'bat', 'sh', 'js', 'html', 'htm'];
                if (in_array(strtolower($value->getClientOriginalExtension()), $blocked)) {
                    $fail("Sécurité : Le type de fichier '.".$value->getClientOriginalExtension()."' est interdit.");
                }
            }],
            'folder_id' => 'nullable|uuid|exists:folders,id',
        ]);

        $uploadedFile = $request->file('file');
        $tenantId = auth()->user()->current_tenant_id;
        $s3Path = "{$tenantId}/".Str::uuid().'.'.$uploadedFile->getClientOriginalExtension();

        // Upload vers MinIO (S3-compatible)
        Storage::disk('s3')->put($s3Path, file_get_contents($uploadedFile));

        $file = File::create([
            'folder_id' => $request->input('folder_id'),
            'name' => $uploadedFile->getClientOriginalName(),
            'mime_type' => $uploadedFile->getClientMimeType(),
            'size_bytes' => $uploadedFile->getSize(),
            's3_path' => $s3Path,
            'created_by' => auth()->id(),
        ]);

        AuditLog::log('FILE_UPLOADED', [
            'file_id' => $file->id,
            'name' => $file->name,
            'size' => $file->size_bytes,
        ]);

        return response()->json(FileData::from([
            ...$file->toArray(),
            'formatted_size' => $file->formatted_size,
            'presigned_url' => $file->getPresignedUrl(),
        ]), 201);
    }

    /**
     * Télécharger un fichier via Pre-signed URL.
     */
    public function download(File $file)
    {
        AuditLog::log('FILE_DOWNLOAD', ['file_id' => $file->id, 'name' => $file->name]);

        return response()->json([
            'url' => $file->getPresignedUrl(),
            'name' => $file->name,
        ]);
    }

    /**
     * Mettre un fichier à la corbeille.
     */
    public function trash(File $file)
    {
        $file->update(['is_trashed' => true]);

        AuditLog::log('FILE_TRASHED', ['file_id' => $file->id]);

        return response()->json(['message' => 'File moved to trash.']);
    }

    /**
     * Restaurer un fichier de la corbeille.
     */
    public function restore(File $file)
    {
        $file->update(['is_trashed' => false]);

        AuditLog::log('FILE_RESTORED', ['file_id' => $file->id]);

        return response()->json(['message' => 'File restored.']);
    }

    /**
     * Supprimer définitivement (fichier + S3).
     */
    public function destroy(File $file)
    {
        Storage::disk('s3')->delete($file->s3_path);
        $file->forceDelete();

        AuditLog::log('FILE_DELETED_PERMANENT', ['file_id' => $file->id]);

        return response()->json(['message' => 'File permanently deleted.']);
    }
}

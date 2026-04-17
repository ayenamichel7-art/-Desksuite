<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class File extends Model
{
    use BelongsToTenant, HasUuids, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'folder_id',
        'name',
        'mime_type',
        'size_bytes',
        's3_path',
        'version_count',
        'is_trashed',
        'created_by',
    ];

    protected $casts = [
        'size_bytes' => 'integer',
        'version_count' => 'integer',
        'is_trashed' => 'boolean',
    ];

    public function folder()
    {
        return $this->belongsTo(Folder::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Génère une Pre-signed URL pour le téléchargement sécurisé depuis MinIO.
     * Durée de validité : 30 minutes par défaut.
     */
    public function getPresignedUrl(int $minutes = 30): string
    {
        return Storage::disk('s3')->temporaryUrl(
            $this->s3_path,
            now()->addMinutes($minutes)
        );
    }

    /**
     * Taille formatée pour l'affichage (ex: "2.4 MB").
     */
    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->size_bytes;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 2).' '.$units[$i];
    }
}

<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use BelongsToTenant, HasUuids, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'type',
        'name',
        'content',
        'last_modified_by',
    ];

    protected $casts = [
        'content' => 'array', // ProseMirror JSON pour Docs, FortuneSheet Data pour Sheets
    ];

    /**
     * Scope pour filtrer par type de document.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeDocs($query)
    {
        return $query->ofType('doc');
    }

    public function scopeSheets($query)
    {
        return $query->ofType('sheet');
    }

    public function scopeSlides($query)
    {
        return $query->ofType('slide');
    }

    public function lastModifiedBy()
    {
        return $this->belongsTo(User::class, 'last_modified_by');
    }
}

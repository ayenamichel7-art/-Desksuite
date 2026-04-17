<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Form extends Model
{
    use BelongsToTenant, HasUuids, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'title',
        'schema',
        'is_active',
    ];

    protected $casts = [
        'schema' => 'array',
        'is_active' => 'boolean',
    ];

    public function responses()
    {
        return $this->hasMany(FormResponse::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

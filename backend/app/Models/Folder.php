<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Folder extends Model
{
    use BelongsToTenant, HasUuids, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'parent_id',
        'name',
        'created_by',
    ];

    public function parent()
    {
        return $this->belongsTo(Folder::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Folder::class, 'parent_id');
    }

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

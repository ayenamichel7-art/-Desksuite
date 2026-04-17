<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contact extends Model
{
    use BelongsToTenant, HasUuids, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'email',
        'phone',
        'company',
        'type',
        'status',
        'portal_token',
        'industry',
        'folder_id',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function quotations()
    {
        return $this->hasMany(Quotation::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function folder()
    {
        return $this->belongsTo(Folder::class);
    }
}

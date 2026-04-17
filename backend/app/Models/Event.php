<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use BelongsToTenant, HasUuids, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'created_by',
        'task_id',
        'title',
        'description',
        'location',
        'color',
        'start_at',
        'end_at',
        'is_full_day',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'is_full_day' => 'boolean',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}

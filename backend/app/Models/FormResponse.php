<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class FormResponse extends Model
{
    use BelongsToTenant, HasUuids;

    protected $fillable = [
        'form_id',
        'tenant_id',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function form()
    {
        return $this->belongsTo(Form::class);
    }
}

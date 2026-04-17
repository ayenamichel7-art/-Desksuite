<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Expense extends Model
{
    use BelongsToTenant, HasUuids, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'created_by',
        'description',
        'amount',
        'amount_net',
        'amount_vat',
        'vat_rate',
        'currency',
        'category',
        'vendor',
        'date',
        'receipt_url',
        'status',
    ];
}

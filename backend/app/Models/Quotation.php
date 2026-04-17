<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quotation extends Model
{
    use BelongsToTenant, HasUuids, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'contact_id',
        'reference',
        'total_amount',
        'status',
        'valid_until',
        'signature_data',
        'signed_at',
        'signer_name',
        'signer_ip',
    ];

    protected $casts = [
        'signed_at' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(QuotationItem::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}

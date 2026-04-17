<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'name',
        'subdomain',
        'type',
        'config',
        'brand_name',
        'logo_url',
        'primary_color',
        'secondary_color',
        'smtp_host',
        'smtp_port',
        'smtp_username',
        'smtp_password',
        'smtp_encryption',
        'smtp_from_email',
        'smtp_from_name',
    ];

    protected $casts = [
        'config' => 'array',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'tenant_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function folders()
    {
        return $this->hasMany(Folder::class);
    }

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function forms()
    {
        return $this->hasMany(Form::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }
}

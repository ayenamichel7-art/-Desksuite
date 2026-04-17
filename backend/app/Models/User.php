<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, Notifiable;

    protected $fillable = [
        'email',
        'password',
        'full_name',
        'avatar_url',
        'telegram_chat_id',
        'timezone',
        'current_tenant_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Tous les tenants auxquels l'utilisateur appartient.
     */
    public function tenants(): BelongsToMany
    {
        return $this->belongsToMany(Tenant::class, 'tenant_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Le tenant actuellement sélectionné.
     */
    public function currentTenant()
    {
        return $this->belongsTo(Tenant::class, 'current_tenant_id');
    }

    /**
     * Vérifie si l'utilisateur a le rôle donné dans le tenant courant.
     */
    public function hasRoleInCurrentTenant(string $role): bool
    {
        return $this->tenants()
            ->where('tenant_id', $this->current_tenant_id)
            ->wherePivot('role', $role)
            ->exists();
    }

    /**
     * Vérifie si l'utilisateur est owner du tenant courant.
     */
    public function isOwnerOfCurrentTenant(): bool
    {
        return $this->hasRoleInCurrentTenant('owner');
    }
}

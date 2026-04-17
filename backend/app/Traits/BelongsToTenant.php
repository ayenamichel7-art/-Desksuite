<?php

namespace App\Traits;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Trait BelongsToTenant
 *
 * Applique automatiquement un Global Scope sur le modèle pour n'afficher
 * que les données correspondant au tenant de l'utilisateur connecté.
 * C'est le cœur de la sécurité multi-tenant.
 */
trait BelongsToTenant
{
    protected static function bootBelongsToTenant(): void
    {
        // Filtrage automatique en lecture : ne jamais retourner de données d'un autre tenant
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (auth()->check() && auth()->user()->current_tenant_id) {
                $builder->where('tenant_id', auth()->user()->current_tenant_id);
            }
        });

        // Injection automatique du tenant_id en écriture
        static::creating(function (Model $model) {
            if (auth()->check() && ! $model->tenant_id) {
                $model->tenant_id = auth()->user()->current_tenant_id;
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}

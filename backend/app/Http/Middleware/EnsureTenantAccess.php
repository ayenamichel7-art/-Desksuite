<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware EnsureTenantAccess
 *
 * Vérifie que l'utilisateur connecté appartient bien au tenant ciblé
 * et injecte le current_tenant_id dans la session.
 *
 * Ce middleware est appliqué sur toutes les routes protégées par le groupe 'tenant'.
 */
class EnsureTenantAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        // Résolution du tenant via le subdomain de la requête
        $host = $request->getHost();
        $subdomain = explode('.', $host)[0] ?? null;

        if (! $subdomain || $subdomain === 'api' || $subdomain === 'desksuite') {
            // Si pas de subdomain, utiliser le current_tenant_id de l'utilisateur
            if (! $user->current_tenant_id) {
                return response()->json([
                    'error' => 'No tenant selected. Please select a workspace first.',
                ], 403);
            }

            return $next($request);
        }

        // Vérifier que le subdomain correspond à un tenant valide
        $tenant = Tenant::where('subdomain', $subdomain)->first();

        if (! $tenant) {
            return response()->json(['error' => 'Tenant not found.'], 404);
        }

        // Vérifier que l'utilisateur a accès à ce tenant
        $isMember = $user->tenants()->where('tenant_id', $tenant->id)->exists();

        if (! $isMember) {
            return response()->json([
                'error' => 'Access denied. You are not a member of this workspace.',
            ], 403);
        }

        // Injecter le tenant courant sur l'utilisateur pour les Global Scopes
        if ($user->current_tenant_id !== $tenant->id) {
            $user->update(['current_tenant_id' => $tenant->id]);
        }

        return $next($request);
    }
}

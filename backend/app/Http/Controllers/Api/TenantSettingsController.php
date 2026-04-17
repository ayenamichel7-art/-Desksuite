<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\InvoiceMail;
use App\Mail\QuickMail;
use App\Models\Invoice;
use App\Services\TenantMailService;
use Illuminate\Http\Request;

class TenantSettingsController extends Controller
{
    /**
     * Récupère la config SMTP actuelle du tenant.
     */
    public function getSmtp()
    {
        $tenant = auth()->user()->currentTenant;

        return response()->json([
            'smtp_host' => $tenant->smtp_host,
            'smtp_port' => $tenant->smtp_port,
            'smtp_username' => $tenant->smtp_username,
            'smtp_encryption' => $tenant->smtp_encryption,
            'smtp_from_address' => $tenant->smtp_from_address,
            'smtp_from_name' => $tenant->smtp_from_name,
            'has_password' => ! empty($tenant->smtp_password),
        ]);
    }

    /**
     * Met à jour la config SMTP (White Label Email Delivery).
     */
    public function updateSmtp(Request $request)
    {
        $validated = $request->validate([
            'smtp_host' => 'nullable|string',
            'smtp_port' => 'nullable|integer',
            'smtp_username' => 'nullable|string',
            'smtp_password' => 'nullable|string',
            'smtp_encryption' => 'nullable|string|in:tls,ssl',
            'smtp_from_address' => 'nullable|email',
            'smtp_from_name' => 'nullable|string',
        ]);

        $tenant = auth()->user()->currentTenant;

        // On ne met à jour le mot de passe que s'il est fourni
        if (empty($validated['smtp_password'])) {
            unset($validated['smtp_password']);
        }

        $tenant->update($validated);

        return response()->json([
            'message' => 'Configuration SMTP mise à jour avec succès.',
            'status' => 'success',
        ]);
    }

    /**
     * Test de la configuration (Senior Validation).
     */
    public function testSmtp()
    {
        $tenant = auth()->user()->currentTenant;
        $user = auth()->user();

        if (! $tenant->smtp_host) {
            return response()->json(['message' => 'Veuillez configurer le SMTP avant de tester.'], 422);
        }

        try {
            TenantMailService::send($tenant, $user->email, new InvoiceMail(new Invoice(['reference' => 'TEST']), ''));

            return response()->json(['message' => 'Test réussi ! Un email a été envoyé à '.$user->email]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur SMTP : '.$e->getMessage()], 500);
        }
    }

    /**
     * Envoie un mail rapide (Webmail direct).
     */
    public function sendQuickMail(Request $request)
    {
        $validated = $request->validate([
            'to' => 'required|email',
            'subject' => 'required|string',
            'message' => 'required|string',
        ]);

        $tenant = auth()->user()->currentTenant;

        try {
            TenantMailService::send(
                $tenant,
                $validated['to'],
                new QuickMail($validated['subject'], $validated['message'], $tenant)
            );

            return response()->json(['message' => 'Email expédié avec succès !']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de l\'envoi : '.$e->getMessage()], 500);
        }
    }
}

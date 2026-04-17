<?php

namespace App\Http\Controllers\Api\Internal;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Quotation;
use App\Models\Task;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ReminderController extends Controller
{
    /**
     * Factures impayées — rappels automatiques
     */
    public function overdueInvoices()
    {
        $reminded = 0;

        // Pour chaque tenant, on cherche les factures impayées
        $tenants = Tenant::all();
        foreach ($tenants as $tenant) {
            $overdueInvoices = Invoice::where('tenant_id', $tenant->id)
                ->where('status', 'unpaid')
                ->where('created_at', '<', Carbon::now()->subDays(3))
                ->with('contact')
                ->get();

            foreach ($overdueInvoices as $invoice) {
                if (! $invoice->contact || ! $invoice->contact->email) {
                    continue;
                }

                $brandName = $tenant->brand_name ?? $tenant->name;
                $daysSince = Carbon::parse($invoice->created_at)->diffInDays(now());

                try {
                    // Envoi d'un email de rappel simple
                    Mail::raw(
                        "Bonjour {$invoice->contact->name},\n\n".
                        "Nous vous rappelons que la facture {$invoice->reference} d'un montant de {$invoice->total_amount}€ ".
                        "est en attente de règlement depuis {$daysSince} jours.\n\n".
                        "Merci de procéder au paiement dans les meilleurs délais.\n\n".
                        "Cordialement,\n{$brandName}",
                        function ($message) use ($invoice, $brandName) {
                            $message->to($invoice->contact->email)
                                ->subject("[{$brandName}] Rappel — Facture {$invoice->reference}");
                        }
                    );
                    $reminded++;
                    Log::info("[Reminder] Rappel envoyé pour facture {$invoice->reference} à {$invoice->contact->email}");
                } catch (\Exception $e) {
                    Log::error("[Reminder] Erreur envoi rappel facture: {$e->getMessage()}");
                }
            }
        }

        return response()->json([
            'success' => true,
            'reminded_count' => $reminded,
        ]);
    }

    /**
     * Devis expirant dans les 3 prochains jours
     */
    public function expiringQuotations()
    {
        $reminded = 0;

        $tenants = Tenant::all();
        foreach ($tenants as $tenant) {
            $expiringQuotes = Quotation::where('tenant_id', $tenant->id)
                ->where('status', '!=', 'accepted')
                ->whereNotNull('valid_until')
                ->whereBetween('valid_until', [now(), now()->addDays(3)])
                ->with('contact')
                ->get();

            foreach ($expiringQuotes as $quotation) {
                if (! $quotation->contact || ! $quotation->contact->email) {
                    continue;
                }

                $brandName = $tenant->brand_name ?? $tenant->name;
                $validUntil = Carbon::parse($quotation->valid_until)->format('d/m/Y');

                try {
                    Mail::raw(
                        "Bonjour {$quotation->contact->name},\n\n".
                        "Votre devis {$quotation->reference} expire le {$validUntil}.\n\n".
                        "Si vous souhaitez en bénéficier, merci de le signer avant cette date.\n\n".
                        "Cordialement,\n{$brandName}",
                        function ($message) use ($quotation, $brandName) {
                            $message->to($quotation->contact->email)
                                ->subject("[{$brandName}] Votre devis {$quotation->reference} expire bientôt");
                        }
                    );
                    $reminded++;
                } catch (\Exception $e) {
                    Log::error("[Reminder] Erreur envoi rappel devis: {$e->getMessage()}");
                }
            }
        }

        return response()->json([
            'success' => true,
            'reminded_count' => $reminded,
        ]);
    }

    /**
     * Tâches en retard (due_date dépassée)
     */
    public function overdueTasks()
    {
        $reminded = 0;

        $tenants = Tenant::all();
        foreach ($tenants as $tenant) {
            $overdueTasks = Task::where('tenant_id', $tenant->id)
                ->where('status', '!=', 'done')
                ->whereNotNull('due_date')
                ->where('due_date', '<', now())
                ->get();

            $reminded += $overdueTasks->count();

            if ($overdueTasks->isNotEmpty()) {
                Log::warning("[Reminder] {$overdueTasks->count()} tâches en retard pour le tenant {$tenant->name}");
            }
        }

        return response()->json([
            'success' => true,
            'reminded_count' => $reminded,
        ]);
    }
}

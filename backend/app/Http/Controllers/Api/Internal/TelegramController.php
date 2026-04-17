<?php

namespace App\Http\Controllers\Api\Internal;

use App\Http\Controllers\Controller;
use App\Mail\InvoiceMail;
use App\Models\Contact;
use App\Models\Document;
use App\Models\Event;
use App\Models\Expense;
use App\Models\File;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\Quotation;
use App\Models\Task;
use App\Models\Tenant;
use App\Models\User;
use App\Services\TenantMailService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TelegramController extends Controller
{
    public function handleAction(Request $request)
    {
        // 1. Validation Serveur-à-Serveur (Python -> Laravel)
        $internalToken = config('services.internal.token');
        if ($request->header('X-Internal-Token') !== $internalToken) {
            abort(403, 'Unauthorized access.');
        }

        $action = $request->input('action');
        $params = $request->input('params', []);
        $telegramChatId = $request->input('telegram_chat_id');

        // 2. Trouver l'utilisateur Desksuite via son ID Telegram
        $user = User::where('telegram_chat_id', $telegramChatId)->first();

        if (! $user) {
            return response()->json([
                'status' => 'error',
                'reply' => "⚠️ Votre compte Telegram n'est pas lié à Desksuite. Mettez à jour votre profil (Saisissez ce numéro chat_id : $telegramChatId dans les paramètres de votre compte).",
            ]);
        }

        // 3. Connecter virtuellement l'utilisateur (Pour le Global Scope Tenant)
        // On utilise setUser() au lieu de login() pour éviter de toucher aux sessions qui gèlent sur cette archi.
        auth()->setUser($user);

        if (! $user->current_tenant_id) {
            return response()->json([
                'status' => 'error',
                'reply' => "⚠️ Vous n'êtes associé à aucun espace de travail (workspace).",
            ]);
        }

        $reply = "🤔 Action non reconnue. Essayez 'ajoute 50€ de frais', 'cherche devis', ou 'crée note de réunion'.";

        // 4. Traitement des Intenions (NLP) du Worker
        switch ($action) {
            case 'add_expense':
                $amount = (float) ($params['amount'] ?? 0);
                $vatRate = (float) ($params['vat_rate'] ?? 20); // Taux par défaut ou celui du pays
                $desc = $params['description'] ?? 'Dépense via Telegram';

                // Calculs comptables
                $amountNet = $amount / (1 + ($vatRate / 100));
                $amountVat = $amount - $amountNet;

                $expense = Expense::create([
                    'tenant_id' => $user->current_tenant_id,
                    'created_by' => $user->id,
                    'description' => $desc,
                    'amount' => $amount,
                    'amount_net' => $amountNet,
                    'amount_vat' => $amountVat,
                    'vat_rate' => $vatRate,
                    'currency' => $params['currency'] ?? 'EUR',
                    'category' => $params['category'] ?? 'Divers',
                    'date' => now()->toDateString(),
                ]);

                $reply = "✅ [Comptabilité Senior] Dépense enregistrée :\n";
                $reply .= "🔹 Total TTC : $amount ".($params['currency'] ?? '€')."\n";
                $reply .= '🔹 Hors Taxes : '.number_format($amountNet, 2)."\n";
                $reply .= '🔹 TVA ('.$vatRate.'%) : '.number_format($amountVat, 2)."\n";
                $reply .= '📂 Catégorie : '.$expense->category;
                break;

            case 'add_task':
                $title = $params['title'] ?? 'Nouvelle tâche Telegram';

                $task = Task::create([
                    'tenant_id' => $user->current_tenant_id,
                    'assigned_to' => $user->id,
                    'title' => Str::ucfirst($title),
                    'status' => 'todo',
                    'priority' => 'medium',
                ]);

                $reply = "📝 Tâche ajoutée : \"$title\".\nElle est maintenant visible dans votre gestionnaire de projets.";
                break;

            case 'get_summary':
                $totalExpenses = Expense::where('tenant_id', $user->current_tenant_id)
                    ->whereMonth('date', now()->month)
                    ->sum('amount');

                $pendingTasks = Task::where('tenant_id', $user->current_tenant_id)
                    ->where('status', '!=', 'done')
                    ->count();

                $fileCount = File::where('tenant_id', $user->current_tenant_id)->count();

                $reply = "📊 Résumé de votre activité ce mois-ci :\n\n";
                $reply .= '💰 Dépenses : '.number_format($totalExpenses, 2)." €\n";
                $reply .= "✅ Tâches en cours : $pendingTasks\n";
                $reply .= "📁 Documents Drive : $fileCount\n\n";
                $reply .= 'Continuez à piloter votre entreprise avec Desksuite !';
                break;

            case 'search_file':
                $query = $params['query'] ?? '';
                $files = File::where('name', 'ilike', '%'.$query.'%')->limit(3)->get();
                $docs = Document::where('name', 'ilike', '%'.$query.'%')->limit(3)->get();

                if ($files->isEmpty() && $docs->isEmpty()) {
                    $reply = "🔍 Aucun fichier ou document trouvé pour '$query'.";
                } else {
                    $reply = "🔍 Voici ce que j'ai trouvé pour '$query' :\n";
                    foreach ($files as $f) {
                        $reply .= '📁 '.$f->name."\n";
                    }
                    foreach ($docs as $d) {
                        $reply .= '📄 '.$d->name.' ('.$d->type.")\n";
                    }
                    $reply .= "\nAccédez-y depuis l'application Desksuite.";
                }
                break;

            case 'create_invoice':
                $quoteRef = $params['quotation_reference'] ?? null;
                $quotation = $quoteRef ? Quotation::where('reference', $quoteRef)->first() : null;

                if ($quotation) {
                    $invoice = Invoice::create([
                        'tenant_id' => $user->current_tenant_id,
                        'contact_id' => $quotation->contact_id,
                        'quotation_id' => $quotation->id,
                        'reference' => str_replace('QT-', 'INV-', $quotation->reference),
                        'total_amount' => $quotation->total_amount,
                        'status' => 'unpaid',
                    ]);
                    $quotation->update(['status' => 'invoiced']);
                    $reply = '✅ Devis '.$quotation->reference.' converti en Facture '.$invoice->reference.' ('.$invoice->total_amount.' €).';
                } else {
                    $invoice = Invoice::create([
                        'tenant_id' => $user->current_tenant_id,
                        'contact_id' => Contact::firstOrCreate(['name' => 'Client Divers', 'tenant_id' => $user->current_tenant_id])->id,
                        'reference' => 'INV-'.strtoupper(Str::random(6)),
                        'total_amount' => (float) ($params['amount'] ?? 0),
                        'status' => 'paid',
                        'paid_at' => now(),
                    ]);
                    $reply = '🧾 Facture directe créée : '.$invoice->reference.' ('.$invoice->total_amount.' €). Marquée comme PAYÉE.';
                }
                break;

            case 'update_branding':
                $tenant = $user->currentTenant;
                if (! $tenant) {
                    $reply = '😕 Impossible de trouver votre entreprise.';
                    break;
                }

                $tenant->update([
                    'brand_name' => $params['brand_name'] ?? $tenant->brand_name,
                    'primary_color' => $params['primary_color'] ?? $tenant->primary_color,
                    'secondary_color' => $params['secondary_color'] ?? $tenant->secondary_color,
                    'logo_url' => $params['logo_url'] ?? $tenant->logo_url,
                ]);

                $reply = "🎨 C'est fait ! Votre marque '".($tenant->brand_name ?? $tenant->name)."' a été mise à jour avec vos couleurs.";
                break;

            case 'list_contacts':
                $contacts = Contact::where('tenant_id', $user->current_tenant_id)->latest()->take(10)->get();
                if ($contacts->isEmpty()) {
                    $reply = '🔍 Aucun contact trouvé dans votre CRM.';
                } else {
                    $reply = "📋 Vos derniers contacts :\n";
                    foreach ($contacts as $c) {
                        $reply .= '- '.$c->name.' ('.$c->type.")\n";
                    }
                }
                break;

            case 'add_contact':
                $name = $params['name'] ?? 'Inconnu';
                $contact = Contact::create([
                    'tenant_id' => $user->current_tenant_id,
                    'name' => Str::title($name),
                    'email' => $params['email'] ?? null,
                    'phone' => $params['phone'] ?? null,
                    'type' => $params['type'] ?? 'lead',
                ]);
                $reply = '👥 Nouveau contact ajouté : '.$contact->name.' ('.$contact->type.").\nIl est maintenant dans votre CRM Desksuite.";
                break;

            case 'add_product':
                $name = $params['name'] ?? 'Produit';
                $price = (float) ($params['price'] ?? 0);
                $product = Product::create([
                    'tenant_id' => $user->current_tenant_id,
                    'name' => $name,
                    'price' => $price,
                ]);
                $reply = '📦 Produit/Service ajouté au catalogue : '.$product->name." ($price €).";
                break;

            case 'create_quotation':
                $contactName = $params['contact_name'] ?? 'Client Rapide';
                $contact = Contact::firstOrCreate(
                    ['name' => $contactName, 'tenant_id' => $user->current_tenant_id],
                    ['type' => 'customer']
                );

                $quote = Quotation::create([
                    'tenant_id' => $user->current_tenant_id,
                    'contact_id' => $contact->id,
                    'reference' => 'QT-'.strtoupper(Str::random(6)),
                    'total_amount' => (float) ($params['amount'] ?? 0),
                    'status' => 'draft',
                    'valid_until' => now()->addDays(30),
                ]);

                $reply = '📄 Devis '.$quote->reference.' généré pour '.$contact->name.".\n";
                $reply .= '💰 Montant : '.$quote->total_amount." €\n";
                $reply .= 'Vous pouvez le finaliser dans le module Facturation.';
                break;

            case 'add_event':
                $title = $params['title'] ?? 'Rendez-vous Telegram';
                $startAt = $params['start_at'] ?? now()->addHour();

                $event = Event::create([
                    'tenant_id' => $user->current_tenant_id,
                    'created_by' => $user->id,
                    'title' => Str::ucfirst($title),
                    'start_at' => $startAt,
                ]);

                $reply = "📅 Événement ajouté à votre calendrier :\n";
                $reply .= "📌 $title\n";
                $reply .= '⏰ '.Carbon::parse($startAt)->format('d/m/Y à H:i');
                break;

            case 'send_email':
                $ref = $params['reference'] ?? null;
                $targetEmail = $params['email'] ?? null;
                $invoice = Invoice::where('reference', $ref)->first();
                $quotation = Quotation::where('reference', $ref)->first();
                $doc = $invoice ?? $quotation;

                if (! $doc) {
                    $reply = "🔍 Je n'ai pas trouvé le document $ref. Précisez la référence (ex: INV-123).";
                    break;
                }

                $email = $targetEmail ?? $doc->contact->email;
                if (! $email) {
                    $reply = "📧 Je n'ai pas l'email de destination pour ".($doc->contact->name ?? 'ce client').'. Veuillez le préciser dans votre message.';
                    break;
                }

                return response()->json([
                    'status' => 'success',
                    'reply' => "📧 [Secrétariat Senior] Je prépare l'envoi de la pièce jointe à $email via votre serveur SMTP privé...",
                    'action_data' => [
                        'doc_id' => $doc->id,
                        'doc_type' => $invoice ? 'invoice' : 'quotation',
                        'to' => $email,
                        'tenant_id' => $user->current_tenant_id,
                    ],
                    'branding' => [
                        'brand_name' => $user->currentTenant->brand_name ?? $user->currentTenant->name,
                        'primary_color' => $user->currentTenant->primary_color ?? '#4B0082',
                        'secondary_color' => $user->currentTenant->secondary_color ?? '#FF8C00',
                    ],
                ]);
                break;

            case 'create_document':
                $docType = $this->cloneDocType($params['type'] ?? 'doc');
                $name = Str::ucfirst($params['name'] ?? 'Nouveau document');

                // Secrétaire Senior : Gabarit pro si c'est une lettre ou un CR
                $content = 'Créé depuis Telegram par '.$user->full_name;
                if (Str::contains(strtolower($name), ['lettre', 'mail', 'courrier', 'redige', 'rédige'])) {
                    $content = "🏢 [DOCUMENT PROFESSIONNEL]\n\n";
                    $content .= "Objet : $name\n";
                    $content .= 'Date : '.now()->format('d/m/Y')."\n\n";
                    $content .= "Monsieur, Madame,\n\n[Rédigez votre texte ici...]\n\n";
                    $content .= "Cordialement,\n".$user->full_name;
                } elseif (Str::contains(strtolower($name), ['cr', 'reunion', 'réunion', 'compte rendu'])) {
                    $content = "📝 [COMPTE RENDU DE RÉUNION]\n\n";
                    $content .= "Sujet : $name\n";
                    $content .= 'Date : '.now()->format('d/m/Y')."\n";
                    $content .= 'Participants : '.$user->full_name."\n\n";
                    $content .= "📍 POINTS CLÉS :\n- \n\n✅ ACTIONS À MENER :\n- ";
                }

                $doc = Document::create([
                    'type' => $docType,
                    'name' => $name,
                    'content' => ['content' => $content],
                    'last_modified_by' => $user->id,
                    'tenant_id' => $user->current_tenant_id,
                ]);
                $reply = "✨ [Secrétariat Senior] Le document '$name' a été rédigé avec un gabarit professionnel. Retrouvez-le dans votre Drive.";
                break;

            case 'process_receipt':
                $ref = $params['reference'] ?? null;
                $invoice = Invoice::with('items.product')->where('reference', $ref)
                    ->where('tenant_id', $user->current_tenant_id)
                    ->first();

                if ($invoice) {
                    $invoice->update([
                        'status' => 'paid',
                        'paid_at' => now(),
                    ]);

                    $stockAlerts = [];
                    foreach ($invoice->items as $item) {
                        if ($item->product) {
                            $product = $item->product;
                            $product->decrement('stock_quantity', $item->quantity);

                            if ($product->stock_quantity <= $product->min_stock_alert) {
                                $stockAlerts[] = "⚠️ Stock critique pour **{$product->name}** : {$product->stock_quantity} restant(s).";
                            }
                        }
                    }

                    $reply = "💳 [Comptabilité] Reçu validé pour la facture $ref. Elle est désormais marquée comme COMPLÉTÉE.";
                    if (! empty($stockAlerts)) {
                        $reply .= "\n\n".implode("\n", $stockAlerts);
                    }
                } else {
                    $reply = "🔍 Facture $ref non trouvée. Impossible de valider le paiement.";
                }
                break;

            case 'get_summary':
                $tenantId = $user->current_tenant_id;
                $now = now();
                $last7Days = $now->copy()->subDays(7);

                // Chiffre d'Affaires Encaissé (Ventes)
                $sales = Invoice::where('tenant_id', $tenantId)
                    ->where('status', 'paid')
                    ->where('paid_at', '>=', $last7Days)
                    ->sum('total_amount');

                // Dépenses (Frais)
                $expenses = Expense::where('tenant_id', $tenantId)
                    ->where('date', '>=', $last7Days->toDateString())
                    ->sum('amount');

                // Rentabilité
                $net = $sales - $expenses;
                $statusIcon = $net >= 0 ? '📈' : '📉';

                // Alerte Inventaire
                $lowStockCount = Product::where('tenant_id', $tenantId)
                    ->whereColumn('stock_quantity', '<=', 'min_stock_alert')
                    ->count();

                $reply = "📊 [Bilan Senior] Vos 7 derniers jours :\n\n";
                $reply .= '💰 Encaissé : '.number_format($sales, 2, ',', ' ')." €\n";
                $reply .= '💸 Dépensé : '.number_format($expenses, 2, ',', ' ')." €\n";
                $reply .= "$statusIcon RÉSULTAT NET : ".number_format($net, 2, ',', ' ')." €\n\n";

                if ($lowStockCount > 0) {
                    $reply .= "🍎 VIGILANCE : $lowStockCount articles sont en rupture ou stock faible.";
                } else {
                    $reply .= '✅ Stocks : Tous vos articles sont bien approvisionnés.';
                }
                break;
        }

        return response()->json([
            'status' => 'success',
            'reply' => $reply,
            'branding' => [
                'brand_name' => $user->currentTenant->brand_name ?? $user->currentTenant->name,
                'primary_color' => $user->currentTenant->primary_color ?? '#4B0082',
                'secondary_color' => $user->currentTenant->secondary_color ?? '#FF8C00',
            ],
        ]);
    }

    /**
     * Endpoint interne pour que le worker envoie un mail avec pièce jointe.
     */
    public function sendInternalMail(Request $request)
    {
        $internalToken = config('services.internal.token');
        if ($request->header('X-Internal-Token') !== $internalToken) {
            abort(403);
        }

        $validated = $request->validate([
            'tenant_id' => 'required|uuid',
            'to' => 'required|email',
            'doc_type' => 'required|string',
            'doc_id' => 'required|uuid',
            'pdf_base64' => 'required|string',
        ]);

        $tenant = Tenant::find($validated['tenant_id']);
        $invoice = ($validated['doc_type'] === 'invoice') ? Invoice::find($validated['doc_id']) : null;
        $quotation = ($validated['doc_type'] === 'quotation') ? Quotation::find($validated['doc_id']) : null;
        $doc = $invoice ?? $quotation;

        // Sauvegarde temporaire du PDF
        $tempPath = storage_path('app/temp_invoice_'.time().'.pdf');
        file_put_contents($tempPath, base64_decode($validated['pdf_base64']));

        // Envoi via le service de mail dynamique
        TenantMailService::send($tenant, $validated['to'], new InvoiceMail($doc, $tempPath));

        unlink($tempPath);

        return response()->json(['status' => 'success', 'message' => 'Email sent via Tenant SMTP']);
    }

    private function cloneDocType($type)
    {
        if (in_array($type, ['sheet', 'slide'])) {
            return $type;
        }

        return 'doc';
    }
}

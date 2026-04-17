<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Invoice;

class PublicPortalController extends Controller
{
    /**
     * Accès sécurisé au Portail Client via Token (UUID).
     */
    public function show($token)
    {
        $contact = Contact::where('portal_token', $token)->firstOrFail();
        $tenant = $contact->tenant; // Accès via relations Eloquent (Souverain)

        return response()->json([
            'client' => $contact,
            'branding' => [
                'name' => $tenant->brand_name ?? $tenant->name,
                'primary' => $tenant->primary_color ?? '#4B0082',
                'secondary' => $tenant->secondary_color ?? '#D81B60',
                'logo' => $tenant->logo_url,
            ],
            'stats' => [
                'paid_invoices' => $contact->invoices()->where('status', 'paid')->count(),
                'pending_invoices' => $contact->invoices()->where('status', 'unpaid')->count(),
                'total_billed' => (float) $contact->invoices()->sum('total_amount'),
                'projects' => $contact->tasks()->count(),
            ],
            'invoices' => $contact->invoices()->orderBy('created_at', 'desc')->get(),
            'quotations' => $contact->quotations()->orderBy('created_at', 'desc')->get(),
            'tasks' => $contact->tasks()->orderBy('due_date', 'asc')->get(),
            'files' => $contact->folder ? $contact->folder->files->map(fn ($f) => [
                'id' => $f->id,
                'name' => $f->name,
                'mime_type' => $f->mime_type,
                'size' => $f->getFormattedSizeAttribute(),
                'download_url' => $f->getPresignedUrl(),
            ]) : [],
        ]);
    }

    /**
     * Download Invoice as Public (Non-auth).
     */
    public function downloadInvoice($token, $invoiceId)
    {
        $contact = Contact::where('portal_token', $token)->firstOrFail();
        $invoice = $contact->invoices()->findOrFail($invoiceId);

        // Logic handled by the Invoice controller or shared service
        return response()->json([
            'download_url' => url('/api/public/invoice/'.$invoice->id.'/pdf?token='.$token),
        ]);
    }
}

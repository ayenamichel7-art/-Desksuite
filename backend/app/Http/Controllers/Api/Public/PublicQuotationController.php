<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Quotation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PublicQuotationController extends Controller
{
    /**
     * Voir un devis publiquement (pour signature).
     */
    public function show($id)
    {
        $quotation = Quotation::with(['contact', 'tenant', 'items'])->findOrFail($id);

        return response()->json([
            'quotation' => $quotation,
            'branding' => [
                'name' => $quotation->tenant->brand_name ?? $quotation->tenant->name,
                'primary' => $quotation->tenant->primary_color ?? '#4B0082',
                'logo' => $quotation->tenant->logo_url,
            ],
        ]);
    }

    /**
     * Signer le devis (Signature Electronique Souveraine).
     */
    public function sign(Request $request, $id)
    {
        $validated = $request->validate([
            'signature_data' => 'required|string', // Base64 signature
            'signer_name' => 'required|string',
        ]);

        $quotation = Quotation::findOrFail($id);

        if ($quotation->status === 'accepted') {
            return response()->json(['message' => 'Ce devis est déjà signé.'], 422);
        }

        $quotation->update([
            'signature_data' => $validated['signature_data'],
            'signed_at' => now(),
            'signer_name' => $validated['signer_name'],
            'signer_ip' => $request->ip(),
            'status' => 'accepted',
        ]);

        return response()->json([
            'message' => 'Devis signé avec succès !',
            'download_url' => url('/api/public/quotation/'.$quotation->id.'/pdf'),
        ]);
    }

    /**
     * Télécharger le devis (signé ou non) en PDF.
     */
    public function downloadPdf($id)
    {
        $quotation = Quotation::with(['contact', 'tenant', 'items'])->findOrFail($id);
        $tenant = $quotation->tenant;

        $payload = [
            'doc_type' => 'quotation',
            'reference' => $quotation->reference,
            'client_name' => $quotation->contact->name ?? 'Client',
            'client_email' => $quotation->contact->email ?? '',
            'items' => $quotation->items->map(function ($item) {
                return [
                    'description' => $item->description,
                    'quantity' => (int) $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'total' => (float) ($item->quantity * $item->unit_price),
                ];
            })->toArray(),
            'total_ht' => (float) $quotation->total_amount, // simplifé
            'total_tva' => 0.0,
            'total_ttc' => (float) $quotation->total_amount,
            'brand_name' => $tenant->brand_name ?? $tenant->name,
            'primary_color' => $tenant->primary_color ?? '#4B0082',
            'secondary_color' => $tenant->secondary_color ?? '#FF8C00',
            'valid_until' => $quotation->valid_until ? $quotation->valid_until->format('d/m/Y') : '',
            'notes' => 'Devis soumis via le portail client.',
            'signature_data' => $quotation->signature_data ?? '',
            'signer_name' => $quotation->signer_name ?? '',
            'signer_ip' => $quotation->signer_ip ?? '',
            'signed_at' => $quotation->signed_at ? $quotation->signed_at->format('d/m/Y H:i:s') : '',
        ];

        try {
            // Appel au worker Python (en réseau inter-containers)
            $response = Http::timeout(30)->post('http://python-worker:80/pdf/generate', $payload);

            if ($response->successful()) {
                $filename = 'Devis_'.$quotation->reference.'.pdf';

                return response($response->body())
                    ->header('Content-Type', 'application/pdf')
                    ->header('Content-Disposition', 'attachment; filename="'.$filename.'"');
            }

            return response()->json(['error' => 'Erreur de génération PDF par le worker.'], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur de connexion au service PDF.'], 500);
        }
    }
}

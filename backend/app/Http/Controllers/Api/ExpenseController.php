<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ExpenseController extends Controller
{
    private $workerUrl;

    public function __construct()
    {
        $this->workerUrl = config('services.python_worker.url');
    }

    public function index(Request $request)
    {
        return response()->json(
            Expense::where('tenant_id', auth()->user()->current_tenant_id)
                ->orderBy('date', 'desc')
                ->paginate($request->query('per_page', 20))
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string',
            'amount' => 'required|numeric',
            'amount_net' => 'nullable|numeric',
            'amount_vat' => 'nullable|numeric',
            'vat_rate' => 'nullable|numeric',
            'currency' => 'nullable|string|max:3',
            'category' => 'nullable|string',
            'vendor' => 'nullable|string',
            'date' => 'required|date',
            'receipt_url' => 'nullable|string',
        ]);

        $expense = auth()->user()->currentTenant()->expenses()->create([
            'id' => Str::uuid(),
            'created_by' => auth()->id(),
            ...$validated,
            'status' => $request->receipt_url ? 'completed' : 'manual',
        ]);

        return response()->json($expense, 201);
    }

    /**
     * Reçoit un ticket, le stocke et demande l'OCR au worker.
     */
    public function ocr(Request $request)
    {
        $request->validate(['receipt' => 'required|image|max:10240']);

        $path = $request->file('receipt')->store('receipts', 's3');
        $fullPath = Storage::disk('s3')->url($path);

        try {
            // Appel au worker Python pour l'OCR
            $response = Http::attach(
                'file',
                file_get_contents($request->file('receipt')->getRealPath()),
                $request->file('receipt')->getClientOriginalName()
            )->post($this->workerUrl.'/ocr/receipt');

            if ($response->successful()) {
                $ocrData = $response->json()['data'];

                // Pré-remplissage suggéré pour le frontend
                return response()->json([
                    'success' => true,
                    'receipt_url' => $path,
                    'ocr_results' => [
                        'amount' => $ocrData['total_amount'],
                        'amount_vat' => $ocrData['tax_amount'],
                        'vendor' => $ocrData['vendor'],
                        'date' => $ocrData['date'],
                        'preview' => $ocrData['raw_text_preview'],
                    ],
                ]);
            }

            return response()->json(['success' => false, 'error' => 'OCR Worker fail'], 500);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    /**
     * Génère un rapport PDF professionnel via le worker Python.
     */
    public function generateReport(Request $request)
    {
        $tenant = auth()->user()->currentTenant();
        $expenses = $tenant->expenses()
            ->orderBy('date', 'asc')
            ->get();

        try {
            $response = Http::post($this->workerUrl.'/report/expenses', [
                'tenant_name' => $tenant->name,
                'period' => $request->query('period', 'Mois en cours'),
                'expenses' => $expenses->toArray(),
            ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json(['success' => false, 'error' => 'Report Worker fail'], 500);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}

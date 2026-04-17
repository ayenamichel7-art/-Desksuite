<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Expense;
use App\Models\Invoice;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * Get Real-time Dashboard Data (Revenue & Performance).
     */
    public function dashboard()
    {
        // Le trait BelongsToTenant gère l'isolation automatiquement
        // 1. Metrics Globaux
        $totalRevenue = Invoice::where('status', 'paid')->sum('total_amount');
        $totalExpenses = Expense::sum('amount');
        $activeContacts = Contact::count();

        // 2. Chiffres des 7 derniers mois (Historique)
        $history = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthName = $date->translatedFormat('M');

            $rev = Invoice::where('status', 'paid')
                ->whereYear('paid_at', $date->year)
                ->whereMonth('paid_at', $date->month)
                ->sum('total_amount');

            $exp = Expense::whereYear('date', $date->year)
                ->whereMonth('date', $date->month)
                ->sum('amount');

            $history[] = [
                'month' => ucfirst($monthName),
                'revenue' => (float) $rev,
                'expenses' => (float) $exp,
            ];
        }

        // 3. TVA (Estimation Senior)
        $vatCollected = Invoice::where('status', 'paid')->sum('total_amount') * 0.20; // 20% par défaut
        $vatDeductible = Expense::sum('amount_vat');

        return response()->json([
            'metrics' => [
                'revenue' => (float) $totalRevenue,
                'expenses' => (float) $totalExpenses,
                'contacts' => $activeContacts,
                'growth' => 12.5, // Simulation croissance
            ],
            'history' => $history,
            'vat' => [
                'collected' => (float) $vatCollected,
                'deductible' => (float) $vatDeductible,
            ],
        ]);
    }
}

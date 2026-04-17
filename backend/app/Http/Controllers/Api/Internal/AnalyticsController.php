<?php

namespace App\Http\Controllers\Api\Internal;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\File;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function auditSummary()
    {
        $today = Carbon::today();

        $total = AuditLog::whereDate('created_at', $today)->count();
        $logins = AuditLog::whereDate('created_at', $today)->whereIn('action', ['login_success', 'user_registered'])->count();
        $backups = AuditLog::whereDate('created_at', $today)->where('action', 'like', 'backup_%')->count();
        $uploads = AuditLog::whereDate('created_at', $today)->where('action', 'FILE_UPLOADED')->count();
        $errors = AuditLog::whereDate('created_at', $today)->where('action', 'login_failed')->count();

        return response()->json([
            'success' => true,
            'total' => $total,
            'logins' => $logins,
            'backups' => $backups,
            'uploads' => $uploads,
            'errors' => $errors,
            'date' => $today->toDateString(),
        ]);
    }

    public function systemStats()
    {
        // Stats plus globales pour le Dashboard Admin
        return response()->json([
            'users_count' => User::count(),
            'tenants_count' => Tenant::count(),
            'storage_used' => File::sum('size'),
            'recent_audits' => AuditLog::with('user')->latest()->limit(10)->get(),
        ]);
    }
}

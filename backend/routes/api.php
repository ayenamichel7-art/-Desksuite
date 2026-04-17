<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BackupController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\DriveController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\Internal\ReminderController;
use App\Http\Controllers\Api\Internal\TelegramController;
use App\Http\Controllers\Api\Public\PublicPortalController;
use App\Http\Controllers\Api\Public\PublicQuotationController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TenantSettingsController;
use App\Http\Middleware\CheckInternalToken;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Desksuite (Alternative Google Workspace)
|--------------------------------------------------------------------------
|
| Toutes les routes sont préfixées par /api automatiquement.
| Le middleware 'tenant' garantit l'isolation des données.
|
*/

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'Desksuite API',
        'version' => '1.0.0',
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::get('/public/quotation/{id}', [PublicQuotationController::class, 'show']);
Route::post('/public/quotation/{id}/sign', [PublicQuotationController::class, 'sign']);
Route::get('/public/quotation/{id}/pdf', [PublicQuotationController::class, 'downloadPdf']);

// ── Public Portal (Client Side) ──────────────────────────────────────────
Route::get('/public/portal/{token}', [PublicPortalController::class, 'show']);
Route::get('/public/portal/{token}/invoice/{invoice}', [PublicPortalController::class, 'downloadInvoice']);

// ─── Auth (Public) ──────────────────────────────────────────────────────────
Route::prefix('auth')->middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// ─── Routes protégées (Sanctum + Tenant) ────────────────────────────────────
Route::middleware(['auth:sanctum', 'tenant'])->group(function () {

    // Auth actions
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/switch-tenant', [AuthController::class, 'switchTenant']);

    // ── Drive (Fichiers & Dossiers) ─────────────────────────────────────────
    Route::prefix('drive')->group(function () {
        Route::get('/', [DriveController::class, 'index']);
        Route::post('/folders', [DriveController::class, 'createFolder']);
        Route::post('/upload', [DriveController::class, 'upload'])->middleware('throttle:uploads');
        Route::post('/ocr', [DriveController::class, 'ocr'])->middleware('throttle:uploads'); // <--- NOUVEAU
        Route::get('/files/{file}/download', [DriveController::class, 'download']);
        Route::post('/files/{file}/trash', [DriveController::class, 'trash']);
        Route::post('/files/{file}/restore', [DriveController::class, 'restore']);
        Route::delete('/files/{file}', [DriveController::class, 'destroy']);
    });

    // ─── Paramètres (Settings) ───────────────────────────────────────────
    Route::prefix('settings')->group(function () {
        Route::get('/smtp', [TenantSettingsController::class, 'getSmtp']);
        Route::post('/smtp', [TenantSettingsController::class, 'updateSmtp']);
        Route::post('/smtp/test', [TenantSettingsController::class, 'testSmtp']);
        Route::post('/smtp/quick-send', [TenantSettingsController::class, 'sendQuickMail']);
    });

    // ── Tasks & Projects ────────────────────────────────────────────────────
    Route::apiResource('tasks', TaskController::class);
    Route::post('/tasks/{task}/timer', [TaskController::class, 'toggleTimer']);
    Route::get('/analytics/dashboard', [AnalyticsController::class, 'dashboard']);

    // ── Expenses & OCR ──────────────────────────────────────────────────────
    Route::apiResource('expenses', ExpenseController::class);
    Route::post('/expenses/scan', [ExpenseController::class, 'ocr']);
    Route::get('/expenses/generate-report', [ExpenseController::class, 'generateReport']);

    Route::apiResource('events', EventController::class);

    // ── Chat (Internal Messaging) ──────────────────────────────────────────
    Route::get('/chat/messages', [ChatController::class, 'index']);
    Route::post('/chat/messages', [ChatController::class, 'store']);

    // ── Documents (Docs / Sheets / Slides) ──────────────────────────────────
    Route::apiResource('documents', DocumentController::class);

    // ── Formulaires ─────────────────────────────────────────────────────────
    Route::apiResource('forms', FormController::class);
    Route::post('/forms/{form}/submit', [FormController::class, 'submit']);

    // ── Backups (Souveraineté des données) ──────────────────────────────────
    Route::get('/backups', [BackupController::class, 'index']);
    Route::post('/backups/db', [BackupController::class, 'store']);
    Route::post('/backups/files', [BackupController::class, 'triggerFiles']);

    // ── Analytics & Dashboard (Pour l'Admin) ─────────────────────────────────
    Route::get('/analytics/stats', [App\Http\Controllers\Api\Internal\AnalyticsController::class, 'systemStats']);
});

// ─── Internal API (Python Worker → Laravel, pas de token Sanctum) ───────────
Route::prefix('internal')->middleware([CheckInternalToken::class])->group(function () {
    // Les endpoints internes pour le service Python FastAPI
    Route::post('/action', [TelegramController::class, 'handleAction']);
    Route::post('/mail/send', [TelegramController::class, 'sendInternalMail']);

    // Rappels automatiques (Scheduler Python)
    Route::get('/reminders/overdue-invoices', [ReminderController::class, 'overdueInvoices']);
    Route::get('/reminders/expiring-quotations', [ReminderController::class, 'expiringQuotations']);
    Route::get('/reminders/overdue-tasks', [ReminderController::class, 'overdueTasks']);

    // Watchdog
    Route::get('/analytics/audit-summary', [App\Http\Controllers\Api\Internal\AnalyticsController::class, 'auditSummary']);
});

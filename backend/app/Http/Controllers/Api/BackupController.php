<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Http;

class BackupController extends Controller
{
    protected $workerUrl;

    public function __construct()
    {
        $this->workerUrl = config('services.python_worker.url');
    }

    /**
     * List all available backups.
     */
    public function index()
    {
        try {
            $response = Http::get("{$this->workerUrl}/backup/list");

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Trigger a new database backup.
     */
    public function store()
    {
        AuditLog::log('backup_db_triggered', [], true);
        try {
            $response = Http::post("{$this->workerUrl}/backup/database");

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Trigger a new files backup.
     */
    public function triggerFiles()
    {
        AuditLog::log('backup_files_triggered', [], true);
        try {
            $response = Http::post("{$this->workerUrl}/backup/files");

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}

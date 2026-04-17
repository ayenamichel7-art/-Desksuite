<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AuditLog extends Model
{
    use BelongsToTenant;

    public $timestamps = false;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'action',
        'metadata',
        'ip_address',
        'created_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Helper pour logger une action.
     */
    public static function log(string $action, array $metadata = [], bool $notify = false): self
    {
        $log = static::create([
            'tenant_id' => auth()->user()?->current_tenant_id,
            'user_id' => auth()->id(),
            'action' => $action,
            'metadata' => $metadata,
            'ip_address' => request()->ip(),
            'created_at' => now(),
        ]);

        if ($notify) {
            try {
                $botToken = config('services.telegram.bot_token');
                $adminChatId = config('services.telegram.admin_chat_id');
                if ($botToken && $adminChatId) {
                    Http::withHeaders([
                        'X-Internal-Token' => config('services.internal.token'),
                    ])->post(config('services.python_worker.url').'/telegram/send', [
                        'chat_id' => $adminChatId,
                        'text' => "🔔 <b>Alerte Watchdog</b>\nAction: <code>$action</code>\nUser: ".(auth()->user()?->email ?? 'Système')."\nIP: ".request()->ip(),
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Watchdog notify failed: '.$e->getMessage());
            }
        }

        return $log;
    }
}

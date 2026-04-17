<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    /**
     * Display a listing of messages for a channel.
     */
    public function index(Request $request)
    {
        $tenantId = $request->user()->current_tenant_id;
        $channel = $request->query('channel', 'general');

        $messages = ChatMessage::where('tenant_id', $tenantId)
            ->where('channel', $channel)
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->take(100)
            ->get();

        return response()->json($messages);
    }

    /**
     * Store a newly created message.
     */
    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'channel' => 'nullable|string',
            'type' => 'nullable|string',
        ]);

        $tenantId = $request->user()->current_tenant_id;

        $message = ChatMessage::create([
            'tenant_id' => $tenantId,
            'user_id' => $request->user()->id,
            'content' => $request->content,
            'channel' => $request->channel ?? 'general',
            'type' => $request->type ?? 'text',
            'is_bot' => false,
        ]);

        $message->load('user');

        broadcast(new MessageSent($message))->toOthers();

        // ── Integrazione NLP (Worker Python) ──
        try {
            $workerUrl = config('services.python_worker.url');
            $response = Http::post("{$workerUrl}/chat/intent", [
                'text' => $message->content,
            ]);

            if ($response->successful()) {
                $intent = $response->json('intent');
                if ($intent && $intent['action'] !== 'unknown') {
                    // Simuler une réponse du bot
                    $botMessage = ChatMessage::create([
                        'tenant_id' => $tenantId,
                        'user_id' => $request->user()->id, // On réutilise l'ID mais on marque comme is_bot
                        'content' => "🤖 [AI] J'ai détecté une intention : ".$intent['action'].". Voulez-vous que je m'en occupe ?",
                        'channel' => $message->channel,
                        'type' => 'text',
                        'is_bot' => true,
                        'metadata' => ['intent' => $intent],
                    ]);
                    $botMessage->load('user');
                    broadcast(new MessageSent($botMessage));
                }
            }
        } catch (\Exception $e) {
            \Log::error('Chat NLP Error: '.$e->getMessage());
        }

        return response()->json($message);
    }
}

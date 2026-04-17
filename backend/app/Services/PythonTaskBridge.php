<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

class PythonTaskBridge
{
    /**
     * Dispatch a task to the Python Celery worker via Redis.
     * 
     * @param string $taskName (e.g. 'tasks.ocr_receipt')
     * @param array $args Ordered arguments
     * @param array $kwargs Keyword arguments
     * @return string The Task ID (UUID)
     */
    public static function dispatch(string $taskName, array $args = [], array $kwargs = []): string
    {
        $id = (string) Str::uuid();
        
        // Structure standard Celery Protocol (Task Message)
        // Note: On utilise 'celery' comme nom de queue par défaut
        $payload = [
            'body' => base64_encode(json_encode([
                $args,
                (object) $kwargs,
                [
                    'callbacks' => null,
                    'errbacks' => null,
                    'chain' => null,
                    'chord' => null,
                ]
            ])),
            'content-encoding' => 'utf-8',
            'content-type' => 'application/json',
            'headers' => [
                'lang' => 'py',
                'task' => $taskName,
                'id' => $id,
                'shadow' => null,
                'eta' => null,
                'expires' => null,
                'group' => null,
                'group_index' => null,
                'retries' => 0,
                'timelimit' => [null, null],
                'root_id' => $id,
                'parent_id' => null,
                'argsrepr' => json_encode($args),
                'kwargsrepr' => json_encode($kwargs),
                'origin' => 'laravel@' . gethostname(),
            ],
            'properties' => [
                'correlation_id' => $id,
                'reply_to' => $id,
                'delivery_mode' => 2,
                'delivery_info' => [
                    'exchange' => '',
                    'routing_key' => 'celery',
                ],
                'priority' => 0,
                'body_encoding' => 'base64',
            ],
        ];

        // On pousse dans la liste Redis 'celery'
        Redis::connection('celery')->rpush('celery', json_encode($payload));

        return $id;
    }
}

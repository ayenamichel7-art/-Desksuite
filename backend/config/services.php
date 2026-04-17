<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'telegram' => [
        'bot_token' => env('TELEGRAM_BOT_TOKEN'),
        'admin_chat_id' => env('TELEGRAM_ADMIN_CHAT_ID'),
    ],

    'python_worker' => [
        'url' => env('PYTHON_WORKER_URL', 'http://python-worker:5000'),
    ],

    'internal' => [
        'token' => env('INTERNAL_API_TOKEN', 'super-secret-internal-token'),
    ],

];

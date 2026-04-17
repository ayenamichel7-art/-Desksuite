<?php

use App\Models\User;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

$user = User::whereNotNull('telegram_chat_id')->first();
if ($user) {
    echo $user->telegram_chat_id;
} else {
    echo 'NOT_FOUND';
}

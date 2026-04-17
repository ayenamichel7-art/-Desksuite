<?php

use App\Models\User;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();
$affected = User::query()->update(['telegram_chat_id' => '6171095816']);
echo 'Utilisateurs mis a jour : '.$affected."\n";

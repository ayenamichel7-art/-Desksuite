<?php

use App\Http\Middleware\EnsureTenantAccess;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        channels: __DIR__.'/../routes/channels.php',
        api: __DIR__.'/../routes/api.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Sanctum stateful API auth
        $middleware->api(prepend: [
            SecurityHeaders::class,
            \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
        ]);

        // Custom aliases
        $middleware->alias([
            'tenant' => EnsureTenantAccess::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();

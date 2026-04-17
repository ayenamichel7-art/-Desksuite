<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Security Headers (Souveraineté & Protection)
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');

        // Strict-Transport-Security (si HTTPS)
        if ($request->secure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        // Content Security Policy (Tightened)
        $appUrl = config('app.url', 'http://desksuite.localhost');
        $csp = "default-src 'self'; ".
               "script-src 'self' 'unsafe-inline'; ".
               "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ".
               "img-src 'self' data: blob: {$appUrl}; ".
               "font-src 'self' data: https://fonts.gstatic.com; ".
               "connect-src 'self' ws: wss: {$appUrl}; ".
               "frame-src 'self'; ".
               "object-src 'none'; ".
               "base-uri 'self';";

        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }
}

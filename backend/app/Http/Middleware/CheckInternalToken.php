<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckInternalToken
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->header('X-Internal-Token');
        $expectedToken = config('app.internal_api_token');

        if (! $token || $token !== $expectedToken) {
            return response()->json(['error' => 'Unauthorized internal access.'], 403);
        }

        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class Authenticate
{
    public function handle(Request $request, Closure $next, ...$guards): Response
    {
        if (empty($guards)) {
            $guards = [null];
        }

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                Auth::shouldUse($guard);
                return $next($request);
            }
        }

        // Nếu không phải request JSON → chuyển hướng về route 'login'
        if (! $request->expectsJson()) {
            return redirect()->route('/welcome');
        }

        // Nếu là request JSON (API) → trả về 401
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }
}

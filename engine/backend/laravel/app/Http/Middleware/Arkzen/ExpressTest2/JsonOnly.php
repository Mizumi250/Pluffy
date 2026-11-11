<?php

// ============================================================
// ARKZEN GENERATED MIDDLEWARE — JsonOnly [ExpressTest2]
// Scoped to this tatemono.
// No body provided in DSL — fill in handle() logic below.
// To inject: add @arkzen:middleware:jsonOnly ... :end block to your tatemono.
// ============================================================

namespace App\Http\Middleware\Arkzen\ExpressTest2;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JsonOnly
{
    public function handle(Request $request, Closure $next): Response
    {
        // TODO: implement jsonOnly middleware logic
        return $next($request);
    }
}
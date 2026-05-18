<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     * resources/views/app.blade.php — Inertia SPA entry point.
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     * Laravel Vite plugin handles cache busting automatically.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Defines the shared props that are available to ALL Inertia pages.
     * Every page gets: auth.user, flash messages, validation errors, and tatemono slug.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Extract tatemono slug from the URL path
        // /auth-test/login → 'auth-test'
        // / → 'default'
        $path = trim($request->path(), '/');
        $segments = explode('/', $path);
        $tatemono = $segments[0] ?? 'default';

        return array_merge(parent::share($request), [
            // Tatemono slug — needed to initialize Zustand auth store with correct localStorage key
            'arkzen' => [
                'tatemono' => $tatemono,
            ],

            // Auth: current user available on every page as props.auth.user
            'auth' => [
                'user' => $request->user()?->only('id', 'name', 'email', 'role'),
            ],

            // Flash: one-time session messages (set via redirect()->with('success', '...'))
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}

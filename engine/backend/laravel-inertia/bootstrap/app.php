<?php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web:      __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health:   '/up',
        then: function () {
            // Arkzen engine routes (build trigger, health check) — still api middleware
            Route::middleware('api')
                ->prefix('arkzen')
                ->group(base_path('routes/arkzen.php'));

            // Load all Inertia module routes under web middleware
            $modulesPath = base_path('routes/modules');
            if (is_dir($modulesPath)) {
                foreach (glob($modulesPath . '/*.php') as $routeFile) {
                    require $routeFile;
                }
            }
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Inertia: share auth + flash props on every request
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'arkzen.engine' => \App\Http\Middleware\ArkzenEngineMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();

<?php

// ============================================================
// ARKZEN ENGINE — LYNX REGISTRY CONTROLLER v1.0
// app/Http/Controllers/Arkzen/ArkzenLynxRegistryController.php
//
// Serves lynx-registry.json to the Lynx hub via
// GET /arkzen/lynx-registry — mirrors
// ArkzenExpoRegistryController exactly, same prefix as all
// other arkzen engine routes in routes/arkzen.php.
//
// Path resolution (in priority order):
//   1. ARKZEN_LYNX_REGISTRY_PATH env var (custom setups)
//   2. base_path('../../frontend/lynx/lynx-registry.json')
//      — monorepo: engine/backend/laravel + engine/frontend/lynx
//   3. base_path('lynx-registry.json') — fallback
// ============================================================

namespace App\Http\Controllers\Arkzen;

use Illuminate\Routing\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;

class ArkzenLynxRegistryController extends Controller
{
    private function registryPath(): ?string
    {
        $envPath = env('ARKZEN_LYNX_REGISTRY_PATH');
        if ($envPath && File::exists($envPath)) return $envPath;

        $monorepo = base_path('../../frontend/lynx/lynx-registry.json');
        if (File::exists($monorepo)) return $monorepo;

        $root = base_path('lynx-registry.json');
        if (File::exists($root)) return $root;

        return null;
    }

    public function index(): JsonResponse
    {
        $path = $this->registryPath();

        if ($path === null) {
            return response()->json([
                'engine'  => '1.0.0',
                'project' => 'lynx',
                'modules' => [],
            ])->withHeaders($this->cors());
        }

        try {
            $registry = json_decode(File::get($path), true, 512, JSON_THROW_ON_ERROR);
            return response()->json($registry)->withHeaders($this->cors());
        } catch (\Throwable $e) {
            return response()->json([
                'engine'  => '1.0.0',
                'project' => 'lynx',
                'modules' => [],
                'error'   => $e->getMessage(),
            ], 500)->withHeaders($this->cors());
        }
    }

    private function cors(): array
    {
        return [
            'Access-Control-Allow-Origin'  => '*',
            'Access-Control-Allow-Methods' => 'GET, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Accept',
        ];
    }
}
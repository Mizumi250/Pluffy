<?php

// ============================================================
// ARKZEN ENGINE — EXPO REGISTRY CONTROLLER v1.0
// app/Http/Controllers/Arkzen/ArkzenExpoRegistryController.php
//
// Serves expo-registry.json to the Expo hub via
// GET /arkzen/expo-registry — same prefix as all other
// arkzen engine routes in routes/arkzen.php.
//
// Path resolution (in priority order):
//   1. ARKZEN_EXPO_REGISTRY_PATH env var (custom setups)
//   2. base_path('../../frontend/expo/expo-registry.json')
//      — monorepo: engine/backend/laravel + engine/frontend/expo
//   3. base_path('expo-registry.json') — fallback
// ============================================================

namespace App\Http\Controllers\Arkzen;

use Illuminate\Routing\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;

class ArkzenExpoRegistryController extends Controller
{
    private function registryPath(): ?string
    {
        $envPath = env('ARKZEN_EXPO_REGISTRY_PATH');
        if ($envPath && File::exists($envPath)) return $envPath;

        $monorepo = base_path('../../frontend/expo/expo-registry.json');
        if (File::exists($monorepo)) return $monorepo;

        $root = base_path('expo-registry.json');
        if (File::exists($root)) return $root;

        return null;
    }

    public function index(): JsonResponse
    {
        $path = $this->registryPath();

        if ($path === null) {
            return response()->json([
                'engine'  => '1.0.0',
                'project' => 'expo',
                'modules' => [],
            ])->withHeaders($this->cors());
        }

        try {
            $registry = json_decode(File::get($path), true, 512, JSON_THROW_ON_ERROR);
            return response()->json($registry)->withHeaders($this->cors());
        } catch (\Throwable $e) {
            return response()->json([
                'engine'  => '1.0.0',
                'project' => 'expo',
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

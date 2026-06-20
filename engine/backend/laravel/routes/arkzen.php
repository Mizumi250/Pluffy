<?php

// ============================================================
// ARKZEN ENGINE — INTERNAL ROUTES
// These routes are for the engine itself, not client features
// Protected by arkzen.engine middleware
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\ArkzenEngineController;
use App\Http\Controllers\Arkzen\ArkzenExpoRegistryController;
use App\Http\Controllers\Arkzen\ArkzenLynxRegistryController;

// Health check — frontend bridge pings this on startup
Route::get('/health', [ArkzenEngineController::class, 'health']);

// Registry — web Hub page polls this to display all tatemonos
Route::get('/registry', [ArkzenEngineController::class, 'registry']);

// Expo Registry — Expo Hub polls this every 3 s
// Reads expo-registry.json written by the Expo watcher
Route::get('/expo-registry', [ArkzenExpoRegistryController::class, 'index']);
Route::options('/expo-registry', fn () => response('', 204)->withHeaders([
    'Access-Control-Allow-Origin'  => '*',
    'Access-Control-Allow-Methods' => 'GET, OPTIONS',
    'Access-Control-Allow-Headers' => 'Content-Type, Accept',
]));

// Lynx Registry — Lynx Hub polls this every 3 s
// Reads lynx-registry.json written by the Lynx watcher
Route::get('/lynx-registry', [ArkzenLynxRegistryController::class, 'index']);
Route::options('/lynx-registry', fn () => response('', 204)->withHeaders([
    'Access-Control-Allow-Origin'  => '*',
    'Access-Control-Allow-Methods' => 'GET, OPTIONS',
    'Access-Control-Allow-Headers' => 'Content-Type, Accept',
]));

// Build — receives tatemono data and builds everything
Route::post('/build', [ArkzenEngineController::class, 'build']);

// Remove — removes generated files for a tatemono
Route::post('/remove', [ArkzenEngineController::class, 'remove']);
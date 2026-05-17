<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — DtrSettingController
// Tatemono: dtr-geofencing
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-17T01:23:45.990286Z
// ============================================================

namespace App\Http\Controllers\Arkzen\DtrGeofencing;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\DtrGeofencing\DtrSetting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class DtrSettingController extends Controller
{
    /**
     * Get all settings
     */
    public function index(Request $request): JsonResponse
    {
        $query = DtrSetting::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }

    /**
     * Toggle geofencing on/off
     */
    public function toggle_geofencing(Request $request): JsonResponse
    {
        $enabled = $request->input('enabled');
        \App\Models\Arkzen\DtrGeofencing\DtrSetting::updateOrCreate(
            ['key' => 'geofencing_enabled'],
            ['value' => $enabled ? 'true' : 'false']
        );
        return response()->json(['success' => true, 'geofencing_enabled' => $enabled]);
    }

    /**
     * Update office location
     */
    public function update_office(Request $request): JsonResponse
    {
        $lat    = $request->input('lat');
        $lng    = $request->input('lng');
        $radius = $request->input('radius');
        \App\Models\Arkzen\DtrGeofencing\DtrSetting::updateOrCreate(['key' => 'office_latitude'],           ['value' => (string) $lat]);
        \App\Models\Arkzen\DtrGeofencing\DtrSetting::updateOrCreate(['key' => 'office_longitude'],          ['value' => (string) $lng]);
        \App\Models\Arkzen\DtrGeofencing\DtrSetting::updateOrCreate(['key' => 'geofence_radius_meters'],    ['value' => (string) $radius]);
        return response()->json(['success' => true]);
    }
}

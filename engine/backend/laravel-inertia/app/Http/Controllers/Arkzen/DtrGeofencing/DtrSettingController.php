<?php

namespace App\Http\Controllers\Arkzen\DtrGeofencing;

use Illuminate\Routing\Controller;
use App\Models\Arkzen\DtrGeofencing\DtrSetting;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DtrSettingController extends Controller
{
    /**
     * Get all settings
     */
    public function index(Request $request): Response
    {
        $query = DtrSetting::query();


        $perPage = $request->get('per_page', 15);
        $items   = $query->paginate($perPage);

        return Inertia::render('DtrGeofencing/Index', [
            'items'   => $items,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Toggle geofencing on/off
     */
    public function toggle_geofencing(Request $request): RedirectResponse
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
    public function update_office(Request $request): RedirectResponse
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

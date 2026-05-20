<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — TimeRecordController
// Tatemono: dtr-geofencing
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-20T06:38:23.113288Z
// ============================================================

namespace App\Http\Controllers\Arkzen\DtrGeofencing;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\DtrGeofencing\TimeRecord;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\Arkzen\DtrGeofencing\TimeRecordResource;

class TimeRecordController extends Controller
{
    /**
     * Get all time records with employee
     */
    public function index(Request $request): JsonResponse
    {
        $query = TimeRecord::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json(TimeRecordResource::collection($results));
    }

    /**
     * Get records for a specific employee
     */
    public function my_records(Request $request): JsonResponse
    {
        $employeeId = $request->route('employee_id');
        $records = \App\Models\Arkzen\DtrGeofencing\TimeRecord::where('employee_id', $employeeId)
            ->with('employee')
            ->orderByDesc('timestamp')
            ->limit(50)
            ->get();
        return response()->json($records);
    }

    /**
     * Record a check-in
     */
    public function check_in(Request $request): JsonResponse
    {
        $employeeId = $request->input('employee_id');
        $latitude   = $request->input('latitude');
        $longitude  = $request->input('longitude');
        $notes      = $request->input('notes');
        
        $geofencingEnabled = \App\Models\Arkzen\DtrGeofencing\DtrSetting::where('key', 'geofencing_enabled')->value('value') === 'true';
        $withinGeofence = true;
        $reject = false;
        
        if ($geofencingEnabled && $latitude !== null && $longitude !== null) {
            $officeLat = (float) \App\Models\Arkzen\DtrGeofencing\DtrSetting::where('key', 'office_latitude')->value('value');
            $officeLng = (float) \App\Models\Arkzen\DtrGeofencing\DtrSetting::where('key', 'office_longitude')->value('value');
            $radius    = (float) \App\Models\Arkzen\DtrGeofencing\DtrSetting::where('key', 'geofence_radius_meters')->value('value');
        
            $earthRadius = 6371000;
            $lat1 = deg2rad($officeLat); $lon1 = deg2rad($officeLng);
            $lat2 = deg2rad($latitude);  $lon2 = deg2rad($longitude);
            $dlat = $lat2 - $lat1; $dlon = $lon2 - $lon1;
            $a = sin($dlat/2)**2 + cos($lat1) * cos($lat2) * sin($dlon/2)**2;
            $distance = $earthRadius * 2 * atan2(sqrt($a), sqrt(1-$a));
        
            $withinGeofence = $distance <= $radius;
            if (!$withinGeofence) {
                return response()->json([
                    'error' => 'Geofence violation',
                    'message' => 'You must be within ' . $radius . ' meters of the office to check in.',
                    'distance' => round($distance, 1),
                ], 403);
            }
        }
        
        $record = \App\Models\Arkzen\DtrGeofencing\TimeRecord::create([
            'employee_id'     => $employeeId,
            'type'            => 'in',
            'timestamp'       => now(),
            'latitude'        => $latitude,
            'longitude'       => $longitude,
            'within_geofence' => $withinGeofence,
            'notes'           => $notes,
        ]);
        
        return response()->json([
            'success'             => true,
            'record'              => $record->load('employee'),
            'within_geofence'     => $withinGeofence,
            'geofencing_enabled'  => $geofencingEnabled,
        ]);
    }

    /**
     * Record a check-out
     */
    public function check_out(Request $request): JsonResponse
    {
        $employeeId = $request->input('employee_id');
        $latitude   = $request->input('latitude');
        $longitude  = $request->input('longitude');
        $notes      = $request->input('notes');
        
        $geofencingEnabled = \App\Models\Arkzen\DtrGeofencing\DtrSetting::where('key', 'geofencing_enabled')->value('value') === 'true';
        $withinGeofence = true;
        
        if ($geofencingEnabled && $latitude !== null && $longitude !== null) {
            $officeLat = (float) \App\Models\Arkzen\DtrGeofencing\DtrSetting::where('key', 'office_latitude')->value('value');
            $officeLng = (float) \App\Models\Arkzen\DtrGeofencing\DtrSetting::where('key', 'office_longitude')->value('value');
            $radius    = (float) \App\Models\Arkzen\DtrGeofencing\DtrSetting::where('key', 'geofence_radius_meters')->value('value');
        
            $earthRadius = 6371000;
            $lat1 = deg2rad($officeLat); $lon1 = deg2rad($officeLng);
            $lat2 = deg2rad($latitude);  $lon2 = deg2rad($longitude);
            $dlat = $lat2 - $lat1; $dlon = $lon2 - $lon1;
            $a = sin($dlat/2)**2 + cos($lat1) * cos($lat2) * sin($dlon/2)**2;
            $distance = $earthRadius * 2 * atan2(sqrt($a), sqrt(1-$a));
        
            $withinGeofence = $distance <= $radius;
            if (!$withinGeofence) {
                return response()->json([
                    'error' => 'Geofence violation',
                    'message' => 'You must be within ' . $radius . ' meters of the office to check out.',
                    'distance' => round($distance, 1),
                ], 403);
            }
        }
        
        $record = \App\Models\Arkzen\DtrGeofencing\TimeRecord::create([
            'employee_id'     => $employeeId,
            'type'            => 'out',
            'timestamp'       => now(),
            'latitude'        => $latitude,
            'longitude'       => $longitude,
            'within_geofence' => $withinGeofence,
            'notes'           => $notes,
        ]);
        
        return response()->json([
            'success'            => true,
            'record'             => $record->load('employee'),
            'within_geofence'    => $withinGeofence,
            'geofencing_enabled' => $geofencingEnabled,
        ]);
    }
}

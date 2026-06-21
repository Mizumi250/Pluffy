<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — EmployeeController
// Tatemono: dtr-geofencing
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T12:05:09.756246Z
// ============================================================

namespace App\Http\Controllers\Arkzen\DtrGeofencing;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\DtrGeofencing\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\Arkzen\DtrGeofencing\EmployeeResource;

class EmployeeController extends Controller
{
    /**
     * Get all employees
     */
    public function index(Request $request): JsonResponse
    {
        $query = Employee::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json(EmployeeResource::collection($results));
    }

    /**
     * Get single employee
     */
    public function show(Employee $employee): JsonResponse
    {
        return response()->json(new EmployeeResource($employee));
    }
}

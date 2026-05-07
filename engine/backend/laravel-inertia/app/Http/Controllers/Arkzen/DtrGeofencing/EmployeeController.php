<?php

namespace App\Http\Controllers\Arkzen\DtrGeofencing;

use Illuminate\Routing\Controller;
use App\Models\Arkzen\DtrGeofencing\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    /**
     * Get all employees
     */
    public function index(Request $request): Response
    {
        $query = Employee::query();


        $perPage = $request->get('per_page', 15);
        $items   = $query->paginate($perPage);

        return Inertia::render('DtrGeofencing/Index', [
            'items'   => $items,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Get single employee
     */
    public function show(Employee $employee): Response
    {
        return Inertia::render('DtrGeofencing/Show', [
            'employee' => $employee,
        ]);
    }
}

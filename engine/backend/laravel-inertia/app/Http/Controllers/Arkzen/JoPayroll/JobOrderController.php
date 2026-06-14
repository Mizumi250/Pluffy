<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — JobOrderController
// Tatemono: jo-payroll
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T02:27:20.605633Z
// ============================================================

namespace App\Http\Controllers\Arkzen\JoPayroll;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\JoPayroll\JobOrder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\Arkzen\JoPayroll\JobOrderResource;

class JobOrderController extends Controller
{
    /**
     * List all job orders
     */
    public function index(Request $request): JsonResponse
    {
        $query = JobOrder::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json(JobOrderResource::collection($results));
    }

    /**
     * Create a new job order
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'jor_number' => 'required|integer|min:0',
            'name_of_jo' => 'required|string|max:255',
            'job_title' => 'required|string|max:255',
            'funding' => 'required|string|max:255',
            'basic_pay' => 'required|numeric|min:0',
            'disbursement_type' => 'required|string|in:CASH,ATM',
            'status' => 'string|in:active,inactive'
        ]);

        $jobOrder = JobOrder::create($validated);

        return response()->json(new JobOrderResource($jobOrder), 201);
    }

    /**
     * Get single job order
     */
    public function show(JobOrder $jobOrder): JsonResponse
    {
        return response()->json(new JobOrderResource($jobOrder));
    }

    /**
     * Update job order
     */
    public function update(Request $request, JobOrder $jobOrder): JsonResponse
    {
        $validated = $request->validate([
            'jor_number' => 'integer|min:0',
            'name_of_jo' => 'string|max:255',
            'job_title' => 'string|max:255',
            'funding' => 'string|max:255',
            'basic_pay' => 'numeric|min:0',
            'disbursement_type' => 'string|in:CASH,ATM',
            'status' => 'string|in:active,inactive'
        ]);

        $jobOrder->update($validated);

        return response()->json(new JobOrderResource($jobOrder));
    }

    /**
     * Delete job order
     */
    public function destroy(JobOrder $jobOrder): JsonResponse
    {
        $jobOrder->delete();

        return response()->json(['message' => 'Job order deleted successfully']);
    }

    /**
     * Get payroll summary statistics
     */
    public function summary(Request $request): JsonResponse
    {
        $activeJOs   = \App\Models\Arkzen\JoPayroll\JobOrder::where('status', 'active')->get();
        $inactiveJOs = \App\Models\Arkzen\JoPayroll\JobOrder::where('status', 'inactive')->count();
        $totalCash   = $activeJOs->where('disbursement_type', 'CASH')->count();
        $totalAtm    = $activeJOs->where('disbursement_type', 'ATM')->count();
        $totalBasicPay      = $activeJOs->sum('basic_pay');
        $totalSss           = $activeJOs->sum('sss_amount');
        $totalHdmfPremium   = $activeJOs->sum('hdmf_premium');
        $totalHdmfMpl       = $activeJOs->sum('hdmf_mpl');
        $totalCalamityLoan  = $activeJOs->sum('calamity_loan');
        $totalDeductions    = $totalSss + $totalHdmfPremium + $totalHdmfMpl + $totalCalamityLoan;
        $netPay             = $totalBasicPay - $totalDeductions;
        $fundingBreakdown   = $activeJOs->groupBy('funding')->map(fn($g) => ['count' => $g->count(), 'total_pay' => $g->sum('basic_pay')]);
        $groupBreakdown     = $activeJOs->groupBy('jor_pyrl_group')->map(fn($g) => $g->count());
        return response()->json([
          'total_active'        => $activeJOs->count(),
          'total_inactive'      => $inactiveJOs,
          'total_atm'           => $totalAtm,
          'total_cash'          => $totalCash,
          'total_basic_pay'     => $totalBasicPay,
          'total_sss'           => $totalSss,
          'total_hdmf_premium'  => $totalHdmfPremium,
          'total_hdmf_mpl'      => $totalHdmfMpl,
          'total_calamity_loan' => $totalCalamityLoan,
          'total_deductions'    => $totalDeductions,
          'net_pay'             => $netPay,
          'funding_breakdown'   => $fundingBreakdown,
          'group_breakdown'     => $groupBreakdown,
        ]);
    }

    /**
     * Get job orders by payroll group
     */
    public function byGroup(Request $request): JsonResponse
    {
        $group = request()->route('group');
        $orders = \App\Models\Arkzen\JoPayroll\JobOrder::where('jor_pyrl_group', $group)->where('status', 'active')->orderBy('jor_number')->get();
        return response()->json($orders);
    }

    /**
     * Get appointment sequence list
     */
    public function appointments(Request $request): JsonResponse
    {
        $orders = \App\Models\Arkzen\JoPayroll\JobOrder::whereNotNull('appointment_order')->orderBy('appointment_order')->get();
        return response()->json($orders);
    }
}

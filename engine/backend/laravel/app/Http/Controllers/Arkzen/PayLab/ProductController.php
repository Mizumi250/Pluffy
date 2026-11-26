<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — ProductController
// Tatemono: pay-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T03:48:51.943417Z
// ============================================================

namespace App\Http\Controllers\Arkzen\PayLab;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\PayLab\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * List the coffees for sale
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query();


        $perPage = $request->get('per_page', 20);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }
}

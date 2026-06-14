<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — jo-payroll [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T02:27:20.498Z
// Pages: index, job-database, cash-atm, sss, hdmf, appointments, payslip
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/jo-payroll', function () {
        return \Inertia\Inertia::render('JoPayroll/Index');
    });

    // Page: job-database
    Route::get('/jo-payroll/job-database', function () {
        return \Inertia\Inertia::render('JoPayroll/JobDatabase');
    });

    // Page: cash-atm
    Route::get('/jo-payroll/cash-atm', function () {
        return \Inertia\Inertia::render('JoPayroll/CashAtm');
    });

    // Page: sss
    Route::get('/jo-payroll/sss', function () {
        return \Inertia\Inertia::render('JoPayroll/Sss');
    });

    // Page: hdmf
    Route::get('/jo-payroll/hdmf', function () {
        return \Inertia\Inertia::render('JoPayroll/Hdmf');
    });

    // Page: appointments
    Route::get('/jo-payroll/appointments', function () {
        return \Inertia\Inertia::render('JoPayroll/Appointments');
    });

    // Page: payslip
    Route::get('/jo-payroll/payslip', function () {
        return \Inertia\Inertia::render('JoPayroll/Payslip');
    });

    // Catch-all 404 — mirrors Next.js [...catchAll] and Vite wildcard route
    Route::get('/jo-payroll/{any}', function () {
        return \Inertia\Inertia::render('JoPayroll/NotFound');
    })->where('any', '.*');

});

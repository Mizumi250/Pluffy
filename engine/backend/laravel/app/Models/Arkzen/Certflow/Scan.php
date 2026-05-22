<?php

// ============================================================
// ARKZEN GENERATED MODEL — Scan
// Tatemono: certflow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-22T06:34:37.401245Z
// ============================================================

namespace App\Models\Arkzen\Certflow;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Scan extends Model
{
    use HasFactory;

    protected $connection = 'certflow';

    protected $table = 'certflow_scans';

    protected $fillable = [
        'submission_id',
        'scanned_at',
        'ip_address',
        'user_agent'
    ];

    protected $casts = [
        'id' => 'integer',
        'scanned_at' => 'datetime'
    ];

    public function submission()
    {
        return $this->belongsTo(\App\Models\Arkzen\Certflow\CertflowSubmission::class, 'submission_id');
    }
}

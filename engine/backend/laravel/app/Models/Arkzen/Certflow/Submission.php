<?php

// ============================================================
// ARKZEN GENERATED MODEL — Submission
// Tatemono: certflow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-20T15:23:31.283534Z
// ============================================================

namespace App\Models\Arkzen\Certflow;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Submission extends Model
{
    use HasFactory;

    protected $connection = 'certflow';

    protected $table = 'certflow_submissions';

    protected $fillable = [
        'template_id',
        'submission_token',
        'form_data',
        'recipient_email',
        'certificate_path',
        'qr_code',
        'email_sent',
        'email_sent_at'
    ];

    protected $casts = [
        'id' => 'integer',
        'form_data' => 'array',
        'email_sent' => 'boolean',
        'email_sent_at' => 'datetime'
    ];

    public function template()
    {
        return $this->belongsTo(\App\Models\Arkzen\Certflow\CertflowTemplate::class, 'template_id');
    }
}

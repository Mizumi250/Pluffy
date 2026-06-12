<?php

// ============================================================
// ARKZEN GENERATED MODEL — ProbeResult
// Tatemono: body-endpoint-handler
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-12T14:14:43.532219Z
// ============================================================

namespace App\Models\Arkzen\BodyEndpointHandler;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProbeResult extends Model
{
    use HasFactory;

    protected $connection = 'body_endpoint_handler';

    protected $table = 'body_endpoint_handler_probe_results';

    protected $fillable = [
        'source',
        'probe',
        'payload',
        'result',
        'ok'
    ];

    protected $casts = [
        'id' => 'integer',
        'ok' => 'boolean'
    ];


}

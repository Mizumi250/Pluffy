<?php

// ============================================================
// ARKZEN GENERATED MODEL — Template
// Tatemono: certflow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-17T08:37:20.539215Z
// ============================================================

namespace App\Models\Arkzen\Certflow;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Template extends Model
{
    use HasFactory;

    protected $connection = 'certflow';

    protected $table = 'certflow_templates';

    protected $fillable = [
        'name',
        'description',
        'file_path',
        'file_type',
        'global_font',
        'is_default',
        'link_token'
    ];

    protected $casts = [
        'id' => 'integer',
        'is_default' => 'boolean'
    ];


}

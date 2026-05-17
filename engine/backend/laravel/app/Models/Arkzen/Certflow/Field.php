<?php

// ============================================================
// ARKZEN GENERATED MODEL — Field
// Tatemono: certflow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-17T03:10:02.159420Z
// ============================================================

namespace App\Models\Arkzen\Certflow;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Field extends Model
{
    use HasFactory;

    protected $connection = 'certflow';

    protected $table = 'certflow_fields';

    protected $fillable = [
        'template_id',
        'label',
        'field_type',
        'placeholder',
        'x',
        'y',
        'width',
        'height',
        'font_size',
        'font_family',
        'font_weight',
        'font_style',
        'text_align',
        'color',
        'layer_order',
        'is_required'
    ];

    protected $casts = [
        'id' => 'integer',
        'x' => 'integer',
        'y' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'font_size' => 'integer',
        'layer_order' => 'integer',
        'is_required' => 'boolean'
    ];

    public function template()
    {
        return $this->belongsTo(\App\Models\Arkzen\Certflow\CertflowTemplate::class, 'template_id');
    }
}

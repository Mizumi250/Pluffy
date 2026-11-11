<?php

// ============================================================
// ARKZEN GENERATED MODEL — UiRelease
// Tatemono: mobile-sdui
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:54.637486Z
// ============================================================

namespace App\Models\Arkzen\MobileSdui;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UiRelease extends Model
{
    use HasFactory;

    protected $connection = 'mobile_sdui';

    protected $table = 'mobile_sdui_ui_releases';

    protected $fillable = [
        'configuration',
        'activate_at'
    ];

    protected $casts = [
        'id' => 'integer'
    ];


}

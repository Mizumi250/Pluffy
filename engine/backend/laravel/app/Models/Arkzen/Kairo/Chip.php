<?php

// ============================================================
// ARKZEN GENERATED MODEL — Chip
// Tatemono: kairo
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-27T06:51:35.276071Z
// ============================================================

namespace App\Models\Arkzen\Kairo;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Chip extends Model
{
    use HasFactory;

    protected $connection = 'kairo';

    protected $table = 'kairo_chips';

    protected $fillable = [
        'name',
        'author',
        'note',
        'blueprint'
    ];

    protected $casts = [

    ];


}

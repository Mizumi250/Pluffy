<?php

// ============================================================
// ARKZEN GENERATED MODEL — VocabCard
// Tatemono: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:08:59.499498Z
// ============================================================

namespace App\Models\Arkzen\Kotoba;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VocabCard extends Model
{
    use HasFactory;

    protected $connection = 'kotoba';

    protected $table = 'kotoba_vocab_cards';

    protected $fillable = [
        'user_id',
        'lang',
        'term',
        'meaning',
        'example',
        'source',
        'ease',
        'interval_days',
        'reps',
        'lapses',
        'due_date'
    ];

    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer',
        'ease' => 'float',
        'interval_days' => 'integer',
        'reps' => 'integer',
        'lapses' => 'integer',
        'due_date' => 'date'
    ];


}

<?php

// ============================================================
// ARKZEN GENERATED MODEL — Photo
// Tatemono: church-community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-23T12:54:57.413245Z
// ============================================================

namespace App\Models\Arkzen\ChurchCommunity;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Photo extends Model
{
    use HasFactory;

    protected $connection = 'church_community';

    protected $table = 'church_community_photos';

    protected $fillable = [
        'event_id',
        'uploader_id',
        'url',
        'thumbnail_url',
        'caption',
        'file_name',
        'file_size',
        'tags',
        'likes_count'
    ];

    protected $casts = [
        'id' => 'integer',
        'file_size' => 'integer',
        'tags' => 'array',
        'likes_count' => 'integer'
    ];

    public function event()
    {
        return $this->belongsTo(\App\Models\Arkzen\ChurchCommunity\ChurchCommunityEvent::class, 'event_id');
    }

    public function uploader()
    {
        return $this->belongsTo(\App\Models\Arkzen\ChurchCommunity\ChurchCommunityUser::class, 'uploader_id');
    }
}

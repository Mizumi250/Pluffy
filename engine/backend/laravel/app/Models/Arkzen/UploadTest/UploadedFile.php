<?php

// ============================================================
// ARKZEN GENERATED MODEL — UploadedFile
// Tatemono: upload-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-25T07:15:09.304798Z
// ============================================================

namespace App\Models\Arkzen\UploadTest;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UploadedFile extends Model
{
    use HasFactory;

    protected $connection = 'upload_test';

    protected $table = 'upload_test_uploaded_files';

    protected $fillable = [
        'user_id',
        'original_name',
        'stored_name',
        'mime_type',
        'size_bytes',
        'disk_path',
        'is_image'
    ];

    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer',
        'size_bytes' => 'integer',
        'is_image' => 'boolean'
    ];


}

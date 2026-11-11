<?php

// ============================================================
// ARKZEN GENERATED MODEL — UploadedFile
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:30.980979Z
// ============================================================

namespace App\Models\Arkzen\ExpressTest2;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UploadedFile extends Model
{
    use HasFactory;

    protected $connection = 'express_test_2';

    protected $table = 'express_test_2_uploaded_files';

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
        'size_bytes' => 'integer',
        'is_image' => 'boolean'
    ];


}

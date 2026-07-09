<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeroBanner extends Model
{
    protected $fillable = [
        'image_path',
        'title',
        'subtitle',
        'button_text',
        'button_link',
        'sort_order',
        'active',
        'show_text',
    ];

    protected $casts = [
        'active' => 'boolean',
        'show_text' => 'boolean',
    ];
}

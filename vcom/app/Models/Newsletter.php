<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Newsletter extends Model
{
    protected $fillable = ['email', 'active', 'unsubscribe_token'];

    protected $casts = [
        'active' => 'boolean',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($newsletter) {
            if (empty($newsletter->unsubscribe_token)) {
                $newsletter->unsubscribe_token = Str::random(64);
            }
        });
    }

    /**
     * Generate a new unsubscribe token if it doesn't exist.
     */
    public function generateUnsubscribeToken()
    {
        if (empty($this->unsubscribe_token)) {
            $this->unsubscribe_token = Str::random(64);
            $this->save();
        }
        return $this->unsubscribe_token;
    }
}

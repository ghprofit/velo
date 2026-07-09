<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExternalPayment extends Model
{
    protected $fillable = [
        'reference', 'source', 'amount', 'currency', 'email', 'description',
        'return_url', 'status', 'payment_reference', 'paid_at', 'webhook_sent_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'webhook_sent_at' => 'datetime',
    ];

    public function getRouteKeyName()
    {
        return 'reference';
    }

    /**
     * Mark as paid. Idempotent — safe to call from both the return-page
     * fallback verification and the Paystack webhook.
     */
    public function markAsPaid(?string $paymentReference = null): bool
    {
        if ($this->status === 'paid') {
            return false;
        }

        $this->update([
            'status' => 'paid',
            'paid_at' => now(),
            'payment_reference' => $paymentReference ?? $this->payment_reference ?? $this->reference,
        ]);

        return true;
    }

    public function markAsFailed(): void
    {
        if ($this->status === 'paid') {
            return;
        }

        $this->update(['status' => 'failed']);
    }
}

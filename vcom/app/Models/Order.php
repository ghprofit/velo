<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'order_number', 'status', 'subtotal', 'shipping_cost', 'shipping_fee', 'total',
        'payment_method', 'payment_status', 'payment_reference', 'payment_provider',
        'payment_completed_at', 'shipping_name', 'shipping_email',
        'shipping_phone', 'shipping_address', 'shipping_city', 'shipping_state',
        'shipping_zip', 'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'total' => 'decimal:2',
        'payment_completed_at' => 'datetime',
    ];

    public function getRouteKeyName()
    {
        return 'order_number';
    }

    public static function generateOrderNumber(): string
    {
        return 'STRYD-' . strtoupper(uniqid());
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Mark the order as paid and decrement stock. Idempotent — safe to call
     * from both the payment redirect and the webhook without double-decrementing.
     */
    public function markAsPaid(?string $reference = null): bool
    {
        if ($this->payment_status === 'paid') {
            return false;
        }

        $this->update([
            'payment_status' => 'paid',
            'payment_completed_at' => now(),
            'payment_reference' => $reference ?? $this->payment_reference ?? $this->order_number,
            'status' => $this->status === 'pending' ? 'processing' : $this->status,
        ]);

        foreach ($this->items as $item) {
            if ($item->product_variant_id) {
                ProductVariant::find($item->product_variant_id)?->decrement('stock', $item->quantity);
                continue;
            }

            $product = Product::find($item->product_id);
            if ($product && !$product->is_digital) {
                $product->decrement('stock', $item->quantity);
            }
        }

        return true;
    }

    public function markAsFailed(): void
    {
        if ($this->payment_status === 'paid') {
            return;
        }

        $this->update(['payment_status' => 'failed']);
    }
}

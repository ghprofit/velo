<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;

class CartService
{
    public function add(int $productId, ?int $variantId, int $quantity): array
    {
        $product = Product::findOrFail($productId);
        $variant = null;

        if ($variantId) {
            $variant = ProductVariant::where('product_id', $productId)->find($variantId);
            if (!$variant) {
                return ['success' => false, 'message' => 'The selected size is no longer available.'];
            }
        } elseif ($product->hasVariants()) {
            return ['success' => false, 'message' => 'Please select a size.'];
        }

        $key = $this->keyFor($productId, $variantId);
        $cart = session()->get('cart', []);
        $newQuantity = ($cart[$key]['quantity'] ?? 0) + $quantity;

        $availableStock = $variant ? $variant->stock : $product->stock;
        if (!$product->is_digital && $newQuantity > $availableStock) {
            return ['success' => false, 'message' => 'Not enough stock available.'];
        }

        $cart[$key] = [
            'product_id' => $productId,
            'variant_id' => $variantId,
            'quantity' => $newQuantity,
        ];

        session()->put('cart', $cart);

        return ['success' => true, 'message' => 'Product added to cart.'];
    }

    public function update(string $key, int $quantity): void
    {
        $cart = session()->get('cart', []);

        if (!isset($cart[$key])) {
            return;
        }

        if ($quantity <= 0) {
            unset($cart[$key]);
        } else {
            $cart[$key]['quantity'] = $quantity;
        }

        session()->put('cart', $cart);
    }

    public function remove(string $key): void
    {
        $cart = session()->get('cart', []);
        unset($cart[$key]);
        session()->put('cart', $cart);
    }

    public function count(): int
    {
        return count(session()->get('cart', []));
    }

    /**
     * Resolve session cart entries into display-ready line items.
     * Entries whose product/variant no longer exist are dropped silently.
     */
    public function items(): array
    {
        $cart = session()->get('cart', []);
        $items = [];

        foreach ($cart as $key => $entry) {
            $product = Product::with(['images', 'primaryImage'])->find($entry['product_id']);
            if (!$product) {
                continue;
            }

            $variant = null;
            if (!empty($entry['variant_id'])) {
                $variant = ProductVariant::with('color')->find($entry['variant_id']);
                if (!$variant) {
                    continue;
                }
            }

            $price = $product->sale_price ?? $product->price;
            $quantity = $entry['quantity'];
            $subtotal = $price * $quantity;

            $image = $product->primaryImage
                ?? ($variant?->color?->images->first())
                ?? $product->images->first();

            $items[] = [
                'key' => $key,
                'product' => $product,
                'variant' => $variant,
                'variant_label' => $variant ? trim(($variant->color->name ?? '') . ' · EU ' . $variant->size, ' ·') : null,
                'image' => $image,
                'quantity' => $quantity,
                'price' => $price,
                'subtotal' => $subtotal,
                'max_stock' => $variant ? $variant->stock : $product->stock,
            ];
        }

        return $items;
    }

    public function total(array $items): float
    {
        return array_sum(array_column($items, 'subtotal'));
    }

    public function keyFor(int $productId, ?int $variantId): string
    {
        return $variantId ? "v{$variantId}" : "p{$productId}";
    }
}

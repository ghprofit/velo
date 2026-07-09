<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductColor;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductVariantController extends Controller
{
    public function storeColor(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'hex_color' => 'nullable|string|max:7',
        ]);

        $product->colors()->create([
            'name' => $validated['name'],
            'hex_color' => $validated['hex_color'] ?? null,
            'sort_order' => $product->colors()->max('sort_order') + 1,
        ]);

        return back()->with('success', 'Color added successfully.');
    }

    public function destroyColor(ProductColor $color)
    {
        $color->delete();

        return back()->with('success', 'Color removed successfully.');
    }

    public function storeVariant(Request $request, Product $product)
    {
        $validated = $request->validate([
            'product_color_id' => ['nullable', Rule::exists('product_colors', 'id')->where('product_id', $product->id)],
            'size' => 'required|string|max:20',
            'stock' => 'required|integer|min:0',
        ]);

        $exists = ProductVariant::where('product_id', $product->id)
            ->where('product_color_id', $validated['product_color_id'] ?? null)
            ->where('size', $validated['size'])
            ->exists();

        if ($exists) {
            return back()->with('error', 'That size already exists for this color.');
        }

        $product->variants()->create([
            'product_color_id' => $validated['product_color_id'] ?? null,
            'size' => $validated['size'],
            'stock' => $validated['stock'],
        ]);

        return back()->with('success', 'Size added successfully.');
    }

    public function updateVariant(Request $request, ProductVariant $variant)
    {
        $validated = $request->validate([
            'stock' => 'required|integer|min:0',
        ]);

        $variant->update($validated);

        return back()->with('success', 'Stock updated successfully.');
    }

    public function destroyVariant(ProductVariant $variant)
    {
        $variant->delete();

        return back()->with('success', 'Size removed successfully.');
    }

    public function assignImageColor(Request $request, ProductImage $image)
    {
        $validated = $request->validate([
            'product_color_id' => ['nullable', Rule::exists('product_colors', 'id')->where('product_id', $image->product_id)],
        ]);

        $image->update(['product_color_id' => $validated['product_color_id'] ?? null]);

        return back()->with('success', 'Image updated successfully.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::active()->with('primaryImage', 'category', 'approvedReviews', 'variants');

        if ($request->filled('category')) {
            $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        }

        if ($request->boolean('on_sale')) {
            $query->whereNotNull('sale_price')->whereColumn('sale_price', '<', 'price');
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('sort')) {
            match ($request->sort) {
                'price_low' => $query->orderBy('price', 'asc'),
                'price_high' => $query->orderBy('price', 'desc'),
                'newest' => $query->latest(),
                default => $query->latest(),
            };
        } else {
            $query->latest();
        }

        $products = $query->paginate(12)->withQueryString();
        $categories = Category::where('active', true)->whereNull('parent_id')->get();

        return view('shop.index', compact('products', 'categories'));
    }

    public function show(Product $product)
    {
        $product->load('images', 'category', 'approvedReviews.user', 'colors.images', 'colors.variants', 'variants');

        $relatedProducts = Product::active()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with('primaryImage')
            ->take(4)->get();

        // Check if user has this product in wishlist
        $inWishlist = auth()->check() ? 
            auth()->user()->wishlists()->where('product_id', $product->id)->exists() : false;

        // Check if user has purchased this product (any status)
        $hasPurchasedAny = auth()->check() ?
            \App\Models\OrderItem::whereHas('order', function($query) {
                $query->where('user_id', auth()->id())
                      ->where('payment_status', 'paid');
            })->where('product_id', $product->id)->exists() : false;

        // Check if user has purchased this product AND it has been delivered
        $hasPurchased = auth()->check() ?
            \App\Models\OrderItem::whereHas('order', function($query) {
                $query->where('user_id', auth()->id())
                      ->where('payment_status', 'paid')
                      ->where('status', 'delivered');
            })->where('product_id', $product->id)->exists() : false;

        return view('shop.show', compact('product', 'relatedProducts', 'inWishlist', 'hasPurchased', 'hasPurchasedAny'));
    }
}

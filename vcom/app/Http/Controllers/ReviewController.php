<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string|max:1000',
        ]);

        // Check if user has already reviewed this product
        if ($product->reviews()->where('user_id', Auth::id())->exists()) {
            return back()->with('error', 'You have already reviewed this product.');
        }

        // Check if this is a verified purchase AND the order has been delivered
        $verifiedPurchase = OrderItem::whereHas('order', function($query) {
            $query->where('user_id', Auth::id())
                  ->where('payment_status', 'paid')
                  ->where('status', 'delivered');
        })->where('product_id', $product->id)->exists();

        if (!$verifiedPurchase) {
            return back()->with('error', 'You can only review products after your order has been delivered.');
        }

        $product->reviews()->create([
            'user_id' => Auth::id(),
            'rating' => $validated['rating'],
            'title' => $validated['title'],
            'comment' => $validated['comment'],
            'verified_purchase' => true,
        ]);

        return back()->with('success', 'Thank you for your review!');
    }

    public function destroy(Review $review)
    {
        // Only allow user to delete their own review
        if ($review->user_id !== Auth::id()) {
            abort(403);
        }

        $review->delete();
        return back()->with('success', 'Review deleted successfully.');
    }
}

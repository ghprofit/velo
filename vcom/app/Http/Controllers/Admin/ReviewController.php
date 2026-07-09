<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Mail\ReviewApproved;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with('user', 'product');

        // Filter by approval status
        if ($request->filled('status')) {
            if ($request->status === 'approved') {
                $query->where('approved', true);
            } elseif ($request->status === 'pending') {
                $query->where('approved', false);
            }
        }

        // Filter by rating
        if ($request->filled('rating')) {
            $query->where('rating', $request->rating);
        }

        $reviews = $query->latest()->paginate(20)->withQueryString();

        return view('admin.reviews.index', compact('reviews'));
    }

    public function approve(Review $review)
    {
        $review->update(['approved' => true]);

        // Send approval email to the reviewer
        try {
            Mail::to($review->user->email)->send(new ReviewApproved($review));
        } catch (\Exception $e) {
            \Log::error('Failed to send review approval email: ' . $e->getMessage());
        }

        return redirect()->route('admin.reviews.index')
            ->with('success', 'Review approved successfully.');
    }

    public function reject(Review $review)
    {
        $review->update(['approved' => false]);

        return redirect()->route('admin.reviews.index')
            ->with('success', 'Review rejected successfully.');
    }

    public function destroy(Review $review)
    {
        $review->delete();

        return redirect()->route('admin.reviews.index')
            ->with('success', 'Review deleted successfully.');
    }
}

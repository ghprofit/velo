<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Newsletter;
use App\Mail\NewsletterEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class NewsletterController extends Controller
{
    public function index(Request $request)
    {
        $query = Newsletter::query();

        // Filter by active status
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('active', false);
            }
        }

        $subscribers = $query->latest()->paginate(50)->withQueryString();
        $totalSubscribers = Newsletter::where('active', true)->count();

        return view('admin.newsletters.index', compact('subscribers', 'totalSubscribers'));
    }

    public function destroy(Newsletter $newsletter)
    {
        $newsletter->delete();

        return redirect()->route('admin.newsletters.index')
            ->with('success', 'Subscriber removed successfully.');
    }

    public function toggleStatus(Newsletter $newsletter)
    {
        $newsletter->update(['active' => !$newsletter->active]);

        $status = $newsletter->active ? 'activated' : 'deactivated';
        return redirect()->route('admin.newsletters.index')
            ->with('success', "Subscriber {$status} successfully.");
    }

    public function export()
    {
        $subscribers = Newsletter::where('active', true)->pluck('email')->toArray();
        
        $csv = implode("\n", $subscribers);
        
        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="newsletter-subscribers-' . date('Y-m-d') . '.csv"');
    }

    public function compose(Request $request)
    {
        $subscriber = null;
        
        // If subscriber ID is provided, we're composing for a single subscriber
        if ($request->filled('subscriber')) {
            $subscriber = Newsletter::findOrFail($request->subscriber);
        }

        return view('admin.newsletters.compose', compact('subscriber'));
    }

    public function send(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'recipient_type' => 'required|in:all,single',
            'subscriber_id' => 'required_if:recipient_type,single|exists:newsletters,id',
        ]);

        $subject = $validated['subject'];
        $message = $validated['message'];
        $sentCount = 0;
        $failedCount = 0;

        try {
            if ($validated['recipient_type'] === 'all') {
                // Send to all active subscribers
                $subscribers = Newsletter::where('active', true)->get();
                
                foreach ($subscribers as $subscriber) {
                    try {
                        // Ensure subscriber has an unsubscribe token
                        $subscriber->generateUnsubscribeToken();
                        
                        Mail::to($subscriber->email)->send(new NewsletterEmail($subject, $message, $subscriber->unsubscribe_token));
                        $sentCount++;
                    } catch (\Exception $e) {
                        \Log::error("Failed to send newsletter to {$subscriber->email}: " . $e->getMessage());
                        $failedCount++;
                    }
                }

                $successMessage = "Newsletter sent successfully to {$sentCount} subscriber(s).";
                if ($failedCount > 0) {
                    $successMessage .= " {$failedCount} email(s) failed to send.";
                }

                return redirect()->route('admin.newsletters.index')
                    ->with('success', $successMessage);
            } else {
                // Send to single subscriber
                $subscriber = Newsletter::findOrFail($validated['subscriber_id']);
                
                try {
                    // Ensure subscriber has an unsubscribe token
                    $subscriber->generateUnsubscribeToken();
                    
                    Mail::to($subscriber->email)->send(new NewsletterEmail($subject, $message, $subscriber->unsubscribe_token));
                    
                    return redirect()->route('admin.newsletters.index')
                        ->with('success', "Newsletter sent successfully to {$subscriber->email}.");
                } catch (\Exception $e) {
                    \Log::error("Failed to send newsletter to {$subscriber->email}: " . $e->getMessage());
                    
                    return back()
                        ->with('error', 'Failed to send newsletter: ' . $e->getMessage())
                        ->withInput();
                }
            }
        } catch (\Exception $e) {
            \Log::error('Newsletter send error: ' . $e->getMessage());
            return back()->with('error', 'An error occurred while sending the newsletter: ' . $e->getMessage())
                ->withInput();
        }
    }
}

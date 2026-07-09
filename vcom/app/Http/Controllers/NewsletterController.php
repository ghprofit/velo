<?php

namespace App\Http\Controllers;

use App\Models\Newsletter;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255|unique:newsletters,email',
        ]);

        Newsletter::create($validated);

        return back()->with('success', 'Successfully subscribed to our newsletter!');
    }

    public function unsubscribe($token)
    {
        $subscriber = Newsletter::where('unsubscribe_token', $token)->firstOrFail();
        
        return view('newsletter.unsubscribe', compact('subscriber'));
    }

    public function confirmUnsubscribe(Request $request, $token)
    {
        $subscriber = Newsletter::where('unsubscribe_token', $token)->firstOrFail();
        
        $subscriber->update(['active' => false]);
        
        return view('newsletter.unsubscribed', compact('subscriber'));
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Mail\ContactAutoReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function index()
    {
        return view('contact');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
        ]);

        $contact = Contact::create($validated);

        // Send auto-reply email
        try {
            Mail::to($contact->email)->send(new ContactAutoReply($contact));
        } catch (\Exception $e) {
            \Log::error('Failed to send contact auto-reply: ' . $e->getMessage());
        }

        return back()->with('success', 'Thank you for contacting us! We will get back to you soon.');
    }
}

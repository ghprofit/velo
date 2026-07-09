<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $query = Contact::query();

        // Filter by read status
        if ($request->filled('status')) {
            if ($request->status === 'read') {
                $query->where('read', true);
            } elseif ($request->status === 'unread') {
                $query->where('read', false);
            }
        }

        $contacts = $query->latest()->paginate(20)->withQueryString();

        return view('admin.contacts.index', compact('contacts'));
    }

    public function show(Contact $contact)
    {
        // Mark as read when viewing
        if (!$contact->read) {
            $contact->update(['read' => true]);
        }

        return view('admin.contacts.show', compact('contact'));
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();

        return redirect()->route('admin.contacts.index')
            ->with('success', 'Contact message deleted successfully.');
    }

    public function markAsRead(Contact $contact)
    {
        $contact->update(['read' => true]);

        return redirect()->route('admin.contacts.index')
            ->with('success', 'Contact marked as read.');
    }

    public function markAsUnread(Contact $contact)
    {
        $contact->update(['read' => false]);

        return redirect()->route('admin.contacts.index')
            ->with('success', 'Contact marked as unread.');
    }
}

@extends('layouts.admin')

@section('title', 'Contact Message Details')

@section('content')
    <div class="mb-6">
        <div class="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <a href="{{ route('admin.contacts.index') }}" class="hover:text-gray-900">Contact Messages</a>
            <span>/</span>
            <span class="text-gray-900">View Message</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Contact Message Details</h1>
    </div>

    @if(session('success'))
        <div class="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
            {{ session('success') }}
        </div>
    @endif

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
            <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Name</label>
                <p class="text-gray-900 font-medium">{{ $contact->name }}</p>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Status</label>
                @if($contact->read)
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Read
                    </span>
                @else
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Unread
                    </span>
                @endif
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p class="text-gray-900">
                    <a href="mailto:{{ $contact->email }}" class="text-indigo-600 hover:text-indigo-800">{{ $contact->email }}</a>
                </p>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                <p class="text-gray-900">
                    @if($contact->phone)
                        <a href="tel:{{ $contact->phone }}" class="text-indigo-600 hover:text-indigo-800">{{ $contact->phone }}</a>
                    @else
                        <span class="text-gray-400">Not provided</span>
                    @endif
                </p>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Date Received</label>
                <p class="text-gray-900">{{ $contact->created_at->format('F d, Y \a\t h:i A') }}</p>
            </div>
        </div>

        <div class="mb-6">
            <label class="block text-sm font-medium text-gray-500 mb-2">Subject</label>
            <p class="text-lg font-semibold text-gray-900">{{ $contact->subject }}</p>
        </div>

        <div class="mb-6">
            <label class="block text-sm font-medium text-gray-500 mb-2">Message</label>
            <div class="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-700">{{ $contact->message }}</div>
        </div>

        <div class="flex items-center justify-between pt-6 border-t border-gray-200">
            <a href="{{ route('admin.contacts.index') }}" class="text-gray-600 hover:text-gray-900">
                ← Back to Messages
            </a>
            <div class="flex gap-3">
                @if(!$contact->read)
                    <form action="{{ route('admin.contacts.markAsRead', $contact) }}" method="POST">
                        @csrf
                        @method('PATCH')
                        <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                            Mark as Read
                        </button>
                    </form>
                @else
                    <form action="{{ route('admin.contacts.markAsUnread', $contact) }}" method="POST">
                        @csrf
                        @method('PATCH')
                        <button type="submit" class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition">
                            Mark as Unread
                        </button>
                    </form>
                @endif
                <form action="{{ route('admin.contacts.destroy', $contact) }}" method="POST" onsubmit="return confirm('Are you sure you want to delete this message?')">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                        Delete
                    </button>
                </form>
            </div>
        </div>
    </div>
@endsection

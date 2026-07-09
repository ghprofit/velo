@extends('layouts.admin')

@section('title', $subscriber ? 'Send Newsletter to Subscriber' : 'Send Newsletter to All Subscribers')

@section('content')
<div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
        <div class="flex items-center mb-6">
            <a href="{{ route('admin.newsletters.index') }}" class="text-gray-600 hover:text-gray-900 mr-4">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
            </a>
            <h1 class="text-3xl font-bold text-gray-800">
                {{ $subscriber ? 'Send Newsletter to ' . $subscriber->email : 'Send Newsletter to All Subscribers' }}
            </h1>
        </div>

        @if($subscriber)
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p class="text-blue-800">
                        This newsletter will be sent to: <strong>{{ $subscriber->email }}</strong>
                    </p>
                </div>
            </div>
        @else
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    <p class="text-yellow-800">
                        This newsletter will be sent to <strong>all active subscribers</strong>. Please review your message carefully.
                    </p>
                </div>
            </div>
        @endif

        <div class="bg-white shadow-md rounded-lg p-6">
            <form action="{{ route('admin.newsletters.send') }}" method="POST" id="newsletter-form">
                @csrf

                <input type="hidden" name="recipient_type" value="{{ $subscriber ? 'single' : 'all' }}">
                @if($subscriber)
                    <input type="hidden" name="subscriber_id" value="{{ $subscriber->id }}">
                @endif

                <!-- Subject -->
                <div class="mb-6">
                    <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                    <input type="text" name="subject" id="subject" value="{{ old('subject') }}" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 @error('subject') border-red-500 @enderror"
                        placeholder="e.g., New Products Available, Special Offers, etc.">
                    @error('subject')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Message -->
                <div class="mb-6">
                    <label for="message" class="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                    <textarea name="message" id="message" rows="12"
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 @error('message') border-red-500 @enderror"
                        placeholder="Write your newsletter message here...">{{ old('message') }}</textarea>
                    @error('message')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                    <p class="text-sm text-gray-500 mt-2">
                        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Use the editor toolbar to format your message with bold, italic, lists, links, and more.
                    </p>
                </div>

                <!-- Preview Section -->
                <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        Preview
                    </h3>
                    <p class="text-xs text-gray-500 mb-3">This is how your newsletter will appear to subscribers</p>
                    <div class="bg-white p-4 rounded border border-gray-300" id="preview-container">
                        <div class="mb-3 pb-3 border-b border-gray-200">
                            <strong class="text-gray-800" id="preview-subject">Newsletter Subject</strong>
                        </div>
                        <div class="text-gray-700" id="preview-message">Your message will appear here...</div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-4 justify-end pt-4 border-t border-gray-200">
                    <a href="{{ route('admin.newsletters.index') }}" class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition">
                        Cancel
                    </a>
                    <button type="submit" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        Send Newsletter
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- TinyMCE CDN -->
<script src="https://cdn.tiny.cloud/1/{{ \App\Models\Setting::get('tinymce_api_key', 'no-api-key') }}/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>

<script>
    // Initialize TinyMCE
    tinymce.init({
        selector: '#message',
        height: 400,
        menubar: false,
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | formatselect | bold italic underline strikethrough | ' +
            'forecolor backcolor | alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | link image | removeformat | code | preview',
        content_style: 'body { font-family: Helvetica, Arial, sans-serif; font-size: 14px; }',
        branding: false,
        promotion: false,
        setup: function(editor) {
            // Update preview when content changes
            editor.on('keyup change', function() {
                updatePreview();
            });
        }
    });

    // Live preview functionality
    document.getElementById('subject').addEventListener('input', function(e) {
        const preview = document.getElementById('preview-subject');
        preview.textContent = e.target.value || 'Newsletter Subject';
    });

    function updatePreview() {
        const preview = document.getElementById('preview-message');
        const content = tinymce.get('message').getContent();
        preview.innerHTML = content || 'Your message will appear here...';
    }

    // Form validation
    document.getElementById('newsletter-form').addEventListener('submit', function(e) {
        const subject = document.getElementById('subject').value.trim();
        const messageContent = tinymce.get('message').getContent();
        const messageText = tinymce.get('message').getContent({format: 'text'}).trim();

        if (!subject) {
            e.preventDefault();
            alert('Please enter a subject for your newsletter.');
            document.getElementById('subject').focus();
            return false;
        }

        if (!messageText) {
            e.preventDefault();
            alert('Please enter a message for your newsletter.');
            tinymce.get('message').focus();
            return false;
        }

        // Update the textarea with TinyMCE content before submission
        tinymce.get('message').save();
        
        // Show confirmation
        const confirmMessage = '{{ $subscriber ? 'Are you sure you want to send this newsletter?' : 'Are you sure you want to send this newsletter to ALL active subscribers? This action cannot be undone.' }}';
        if (!confirm(confirmMessage)) {
            e.preventDefault();
            return false;
        }

        return true;
    });
</script>
@endsection

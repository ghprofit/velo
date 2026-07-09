<x-app-layout>
<div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
        <div class="bg-white shadow-lg rounded-lg p-8">
            <!-- Success Icon -->
            <div class="flex justify-center mb-6">
                <div class="bg-green-100 rounded-full p-4">
                    <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>

            <!-- Title -->
            <h2 class="text-2xl font-bold text-center text-gray-900 mb-2">
                You've Been Unsubscribed
            </h2>
            
            <p class="text-center text-gray-600 mb-8">
                We've successfully removed you from our newsletter list.
            </p>

            <!-- Email Confirmation -->
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <p class="text-sm text-gray-500 mb-1">Unsubscribed Email:</p>
                <p class="text-lg font-medium text-gray-900">{{ $subscriber->email }}</p>
            </div>

            <!-- Info Message -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div class="flex">
                    <svg class="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                    <div class="text-sm text-blue-800">
                        <p class="font-medium mb-1">What happens next?</p>
                        <p>You will no longer receive newsletter emails from us. This may take up to 48 hours to take effect.</p>
                    </div>
                </div>
            </div>

            <!-- Resubscribe Message -->
            <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <p class="text-sm text-purple-800 text-center">
                    Changed your mind? You can resubscribe anytime on our <a href="{{ route('home') }}" class="font-medium underline hover:text-purple-900">homepage</a>.
                </p>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
                <a href="{{ route('home') }}" class="block w-full text-center bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200">
                    Return to Homepage
                </a>

                <a href="{{ route('shop.index') }}" class="block w-full text-center bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200">
                    Continue Shopping
                </a>
            </div>

            <!-- Feedback -->
            <p class="text-center text-sm text-gray-500 mt-6">
                We'd love to hear your feedback. <a href="{{ route('contact') }}" class="text-indigo-600 hover:text-indigo-800 font-medium">Contact us</a>
            </p>
        </div>
    </div>
</div>
</x-app-layout>

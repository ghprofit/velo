<x-app-layout>
<div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
        <div class="bg-white shadow-lg rounded-lg p-8">
            <!-- Icon -->
            <div class="flex justify-center mb-6">
                <div class="bg-yellow-100 rounded-full p-4">
                    <svg class="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
            </div>

            <!-- Title -->
            <h2 class="text-2xl font-bold text-center text-gray-900 mb-2">
                Unsubscribe from Newsletter
            </h2>
            
            <p class="text-center text-gray-600 mb-8">
                We're sorry to see you go!
            </p>

            <!-- Email -->
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <p class="text-sm text-gray-500 mb-1">Email Address:</p>
                <p class="text-lg font-medium text-gray-900">{{ $subscriber->email }}</p>
            </div>

            <!-- Warning Message -->
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div class="flex">
                    <svg class="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <div>
                        <p class="text-sm text-yellow-800">
                            If you unsubscribe, you will no longer receive:
                        </p>
                        <ul class="mt-2 text-sm text-yellow-700 list-disc list-inside">
                            <li>Exclusive promotions and discounts</li>
                            <li>New product announcements</li>
                            <li>Special offers and updates</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <form action="{{ route('newsletter.confirm-unsubscribe', $subscriber->unsubscribe_token) }}" method="POST">
                @csrf
                <button type="submit" class="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 mb-3">
                    Yes, Unsubscribe Me
                </button>
            </form>

            <a href="{{ route('home') }}" class="block w-full text-center bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200">
                No, Keep Me Subscribed
            </a>

            <!-- Support Link -->
            <p class="text-center text-sm text-gray-500 mt-6">
                Having issues? <a href="{{ route('contact') }}" class="text-indigo-600 hover:text-indigo-800 font-medium">Contact us</a>
            </p>
        </div>
    </div>
</div>
</x-app-layout>

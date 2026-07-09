<x-guest-layout>
    <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Verify Your Phone Number</h2>
        <p class="mt-1 text-sm text-gray-500">We need to verify your phone number for security and order updates</p>
    </div>

    @if (session('message'))
        <div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex">
                <svg class="w-5 h-5 text-green-500 me-2 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span class="text-sm font-medium text-green-800">{{ session('message') }}</span>
            </div>
        </div>
    @endif

    @if ($errors->any())
        <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex">
                <svg class="w-5 h-5 text-red-500 me-2 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <div>
                    <h3 class="text-sm font-medium text-red-800">Error</h3>
                    <ul class="mt-1 text-sm text-red-700 list-disc list-inside">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            </div>
        </div>
    @endif

    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="flex">
            <svg class="w-5 h-5 text-blue-500 me-2 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
            <div>
                <p class="text-sm font-medium text-blue-800">Your phone number</p>
                <p class="text-sm text-blue-700 mt-1">{{ Auth::user()->phone }}</p>
            </div>
        </div>
    </div>

    <!-- Send Code Form -->
    <form method="POST" action="{{ route('phone.verification.send') }}" class="mb-6">
        @csrf
        <button type="submit" class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition">
            Send Verification Code
        </button>
    </form>

    <!-- Verify Code Form -->
    <form method="POST" action="{{ route('phone.verification.verify') }}">
        @csrf

        <div>
            <x-input-label for="code" :value="__('Verification Code')" />
            <x-text-input id="code" class="block mt-1 w-full text-center text-2xl tracking-widest font-mono" 
                type="text" name="code" maxlength="6" pattern="[0-9]{6}" 
                placeholder="000000" required autofocus />
            <p class="mt-1 text-xs text-gray-500">Enter the 6-digit code sent to your phone</p>
            <x-input-error :messages="$errors->get('code')" class="mt-2" />
        </div>

        <div class="mt-6">
            <button type="submit" class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition">
                Verify Phone Number
            </button>
        </div>
    </form>

    <div class="mt-6 text-center">
        <p class="text-sm text-gray-500">
            Didn't receive the code?
            <form method="POST" action="{{ route('phone.verification.resend') }}" class="inline">
                @csrf
                <button type="submit" class="font-medium text-red-600 hover:text-red-700">Resend Code</button>
            </form>
        </p>
    </div>

    <div class="mt-4 text-center">
        <a href="{{ route('home') }}" class="text-sm text-gray-500 hover:text-gray-700">
            Skip for now (you can verify later from your profile)
        </a>
    </div>
</x-guest-layout>

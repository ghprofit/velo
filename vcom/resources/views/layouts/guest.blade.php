<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])

        <!-- Custom Color Scheme -->
        <style>
            :root {
                --primary-color: {{ $siteColors['primary'] ?? '#ef4444' }};
                --secondary-color: {{ $siteColors['secondary'] ?? '#10b981' }};
            }
            
            /* Primary color overrides (red) */
            .bg-red-600, .hover\:bg-red-600:hover { background-color: var(--primary-color) !important; }
            .bg-red-700, .hover\:bg-red-700:hover { background-color: color-mix(in srgb, var(--primary-color) 90%, black) !important; }
            .bg-red-900, .active\:bg-red-900:active { background-color: color-mix(in srgb, var(--primary-color) 70%, black) !important; }
            .bg-red-500, .hover\:bg-red-500:hover { background-color: var(--primary-color) !important; }
            .bg-red-100 { background-color: color-mix(in srgb, var(--primary-color) 15%, white) !important; }
            .bg-red-200, .hover\:bg-red-200:hover { background-color: color-mix(in srgb, var(--primary-color) 25%, white) !important; }
            .bg-red-50 { background-color: color-mix(in srgb, var(--primary-color) 10%, white) !important; }
            .text-red-600, .hover\:text-red-600:hover { color: var(--primary-color) !important; }
            .text-red-700, .hover\:text-red-700:hover { color: color-mix(in srgb, var(--primary-color) 85%, black) !important; }
            .text-red-800 { color: color-mix(in srgb, var(--primary-color) 75%, black) !important; }
            .text-red-500 { color: var(--primary-color) !important; }
            .text-red-400, .hover\:text-red-400:hover { color: color-mix(in srgb, var(--primary-color) 60%, white) !important; }
            .text-red-300 { color: color-mix(in srgb, var(--primary-color) 45%, white) !important; }
            .text-red-200 { color: color-mix(in srgb, var(--primary-color) 40%, white) !important; }
            .text-red-100 { color: color-mix(in srgb, var(--primary-color) 20%, white) !important; }
            .from-red-600 { --tw-gradient-from: var(--primary-color) !important; }
            .to-red-700 { --tw-gradient-to: color-mix(in srgb, var(--primary-color) 90%, black) !important; }
            .border-red-500 { border-color: var(--primary-color) !important; }
            .border-red-200 { border-color: color-mix(in srgb, var(--primary-color) 25%, white) !important; }
            .focus\:ring-red-500:focus { --tw-ring-color: var(--primary-color) !important; }
            
            /* Indigo colors - use primary */
            .bg-indigo-600, .hover\:bg-indigo-600:hover { background-color: var(--primary-color) !important; }
            .bg-indigo-700, .hover\:bg-indigo-700:hover { background-color: color-mix(in srgb, var(--primary-color) 90%, black) !important; }
            .bg-indigo-900, .active\:bg-indigo-900:active { background-color: color-mix(in srgb, var(--primary-color) 70%, black) !important; }
            .bg-indigo-100 { background-color: color-mix(in srgb, var(--primary-color) 15%, white) !important; }
            .text-indigo-600, .hover\:text-indigo-600:hover { color: var(--primary-color) !important; }
            .text-indigo-700, .hover\:text-indigo-700:hover { color: color-mix(in srgb, var(--primary-color) 85%, black) !important; }
            .border-indigo-600 { border-color: var(--primary-color) !important; }
            .focus\:ring-indigo-500:focus { --tw-ring-color: var(--primary-color) !important; }
            
            /* Blue colors - use secondary */
            .bg-blue-600, .hover\:bg-blue-600:hover { background-color: var(--secondary-color) !important; }
            .bg-blue-50 { background-color: color-mix(in srgb, var(--secondary-color) 8%, white) !important; }
            .text-blue-600 { color: var(--secondary-color) !important; }
            .text-blue-700 { color: color-mix(in srgb, var(--secondary-color) 85%, black) !important; }
            .text-blue-800 { color: color-mix(in srgb, var(--secondary-color) 75%, black) !important; }
            .text-blue-500 { color: var(--secondary-color) !important; }
            .border-blue-200 { border-color: color-mix(in srgb, var(--secondary-color) 25%, white) !important; }
            
            /* Secondary color overrides (green) */
            .bg-green-600, .hover\:bg-green-600:hover { background-color: var(--secondary-color) !important; }
            .bg-green-500, .hover\:bg-green-500:hover { background-color: var(--secondary-color) !important; }
            .bg-green-700, .hover\:bg-green-700:hover { background-color: color-mix(in srgb, var(--secondary-color) 90%, black) !important; }
            .bg-green-800 { background-color: color-mix(in srgb, var(--secondary-color) 80%, black) !important; }
            .bg-green-100 { background-color: color-mix(in srgb, var(--secondary-color) 15%, white) !important; }
            .bg-green-50 { background-color: color-mix(in srgb, var(--secondary-color) 8%, white) !important; }
            .text-green-600, .hover\:text-green-600:hover { color: var(--secondary-color) !important; }
            .text-green-700 { color: color-mix(in srgb, var(--secondary-color) 85%, black) !important; }
            .text-green-800 { color: color-mix(in srgb, var(--secondary-color) 75%, black) !important; }
            .text-green-500 { color: var(--secondary-color) !important; }
            .text-green-400 { color: color-mix(in srgb, var(--secondary-color) 70%, white) !important; }
            .text-green-100 { color: color-mix(in srgb, var(--secondary-color) 25%, white) !important; }
            .border-green-200 { border-color: color-mix(in srgb, var(--secondary-color) 25%, white) !important; }
            .border-green-500 { border-color: var(--secondary-color) !important; }
        </style>
    </head>
    <body class="font-sans text-gray-900 antialiased">
        <div class="min-h-screen flex">
            <!-- Left: Branding Panel (desktop only) -->
            <div class="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden">
                <div class="absolute inset-0 opacity-10">
                    <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="auth-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                                <circle cx="30" cy="30" r="1.5" fill="white" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#auth-pattern)" />
                    </svg>
                </div>

                <div class="relative z-10 flex flex-col justify-center px-12 xl:px-20 w-full">
                    <a href="{{ route('home') }}" class="flex items-center space-x-3 mb-10">
                        <span class="text-2xl font-extrabold text-white tracking-tight">{{ $siteName ?? 'STRYD' }}</span>
                    </a>

                    <h2 class="text-3xl xl:text-4xl font-bold text-white leading-tight">Step Into Style<br>New Season Sneakers</h2>
                    <p class="mt-4 text-gray-400 text-lg max-w-md">New arrivals, classic silhouettes, and everyday essentials for men, women, and kids.</p>

                    <div class="mt-10 space-y-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                            </div>
                            <span class="text-gray-300 text-sm">Free shipping on orders over {{ currency(50) }}</span>
                        </div>
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                            </div>
                            <span class="text-gray-300 text-sm">30-day money-back guarantee</span>
                        </div>
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                            </div>
                            <span class="text-gray-300 text-sm">Track your orders anytime</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right: Form Panel -->
            <div class="w-full lg:w-1/2 flex flex-col justify-center items-center bg-gray-50 px-6 py-12">
                <!-- Mobile logo -->
                <div class="lg:hidden mb-8">
                    <a href="{{ route('home') }}" class="flex items-center space-x-2">
                        <span class="text-xl font-extrabold text-gray-900 tracking-tight">{{ $siteName ?? 'STRYD' }}</span>
                    </a>
                </div>

                <div class="w-full sm:max-w-md">
                    <div class="bg-white rounded-md border border-gray-200 px-8 py-8">
                        {{ $slot }}
                    </div>
                    <p class="text-center text-xs text-gray-400 mt-6">&copy; {{ date('Y') }} {{ $siteName ?? 'STRYD' }}. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
</html>

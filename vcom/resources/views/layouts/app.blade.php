<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://api.fontshare.com">
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap" rel="stylesheet" />

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
    <body class="font-sans antialiased">
        <div class="min-h-screen bg-brand-cream">
            @include('layouts.navigation')

            <!-- Page Heading -->
            @isset($header)
                <header class="bg-white shadow">
                    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {{ $header }}
                    </div>
                </header>
            @endisset

            <!-- Page Content -->
            <main>
                {{ $slot }}
            </main>

            @include('layouts.footer')
        </div>
    </body>
</html>

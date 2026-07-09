<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>@yield('title', 'Admin') - {{ $siteName ?? 'STRYD' }}</title>

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
    <body class="font-sans antialiased">
        <div class="min-h-screen flex bg-gray-100">
            {{-- Mobile Menu Overlay --}}
            <div id="mobile-menu-overlay" class="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden hidden"></div>
            
            {{-- Sidebar --}}
            <aside id="sidebar" class="fixed md:static inset-y-0 left-0 transform -translate-x-full md:translate-x-0 transition-transform duration-300 ease-in-out z-30 w-64 min-h-screen bg-gray-800 text-white flex-shrink-0">
                <div class="p-6 flex items-center justify-between">
                    <div>
                        <a href="{{ route('admin.dashboard') }}" class="text-xl font-bold text-white tracking-wide">
                            {{ $siteName ?? 'STRYD' }}
                        </a>
                        <p class="text-gray-400 text-xs mt-1">Admin Panel</p>
                    </div>
                    {{-- Close button for mobile --}}
                    <button id="close-sidebar" class="md:hidden text-gray-400 hover:text-white">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <nav class="mt-2">
                    <a href="{{ route('admin.dashboard') }}"
                       class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 {{ request()->routeIs('admin.dashboard') ? 'bg-gray-700 text-white border-r-4 border-red-500' : '' }}">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"></path>
                        </svg>
                        Dashboard
                    </a>

                    <a href="{{ route('admin.categories.index') }}"
                       class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 {{ request()->routeIs('admin.categories.*') ? 'bg-gray-700 text-white border-r-4 border-red-500' : '' }}">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        Categories
                    </a>

                    <a href="{{ route('admin.products.index') }}"
                       class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 {{ request()->routeIs('admin.products.*') ? 'bg-gray-700 text-white border-r-4 border-red-500' : '' }}">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                        Products
                    </a>

                    <a href="{{ route('admin.shipping.index') }}"
                       class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 {{ request()->routeIs('admin.shipping.*') ? 'bg-gray-700 text-white border-r-4 border-red-500' : '' }}">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                        </svg>
                        Shipping
                    </a>

                    <a href="{{ route('admin.orders.index') }}"
                       class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 {{ request()->routeIs('admin.orders.*') ? 'bg-gray-700 text-white border-r-4 border-red-500' : '' }}">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                        </svg>
                        Orders
                    </a>

                    <a href="{{ route('admin.users.index') }}"
                       class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 {{ request()->routeIs('admin.users.*') ? 'bg-gray-700 text-white border-r-4 border-red-500' : '' }}">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                        Users
                    </a>

                    <a href="{{ route('admin.reviews.index') }}"
                       class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 {{ request()->routeIs('admin.reviews.*') ? 'bg-gray-700 text-white border-r-4 border-red-500' : '' }}">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                        </svg>
                        Reviews
                    </a>

                    <a href="{{ route('admin.contacts.index') }}"
                       class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 {{ request()->routeIs('admin.contacts.*') ? 'bg-gray-700 text-white border-r-4 border-red-500' : '' }}">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        Contacts
                    </a>

                    <a href="{{ route('admin.newsletters.index') }}"
                       class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 {{ request()->routeIs('admin.newsletters.*') ? 'bg-gray-700 text-white border-r-4 border-red-500' : '' }}">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                        </svg>
                        Newsletter
                    </a>

                    <a href="{{ route('admin.settings.index') }}"
                       class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 {{ request()->routeIs('admin.settings.*') ? 'bg-gray-700 text-white border-r-4 border-red-500' : '' }}">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        Settings
                    </a>

                    <div class="border-t border-gray-700 my-4"></div>

                    <a href="{{ url('/') }}"
                       class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Back to Store
                    </a>
                </nav>
            </aside>

            {{-- Main Content --}}
            <div class="flex-1 flex flex-col overflow-hidden w-full">
                {{-- Top Bar --}}
                <header class="bg-white shadow-sm border-b border-gray-200">
                    <div class="flex items-center justify-between px-4 md:px-6 py-4">
                        <div class="flex items-center space-x-4">
                            {{-- Mobile menu toggle --}}
                            <button id="mobile-menu-toggle" class="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                </svg>
                            </button>
                            <h2 class="text-lg font-semibold text-gray-700">
                                @yield('title', 'Dashboard')
                            </h2>
                        </div>
                        <div class="flex items-center space-x-2 md:space-x-4">
                            <span class="text-xs md:text-sm text-gray-500 truncate max-w-32 md:max-w-none">{{ Auth::user()->name ?? 'Admin' }}</span>
                            <form method="POST" action="{{ route('logout') }}">
                                @csrf
                                <button type="submit" class="text-xs md:text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
                                    Logout
                                </button>
                            </form>
                        </div>
                    </div>
                </header>

                {{-- Flash Messages --}}
                <div class="px-4 md:px-6 pt-4">
                    @if(session('success'))
                        <div class="mb-4 rounded-md bg-green-50 border border-green-200 p-4">
                            <div class="flex">
                                <svg class="h-5 w-5 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                </svg>
                                <p class="text-sm text-green-700">{{ session('success') }}</p>
                            </div>
                        </div>
                    @endif

                    @if(session('error'))
                        <div class="mb-4 rounded-md bg-red-50 border border-red-200 p-4">
                            <div class="flex">
                                <svg class="h-5 w-5 text-red-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                                </svg>
                                <p class="text-sm text-red-700">{{ session('error') }}</p>
                            </div>
                        </div>
                    @endif
                </div>

                {{-- Page Content --}}
                <main class="flex-1 overflow-y-auto p-4 md:p-6">
                    @yield('content')
                </main>
            </div>
        </div>

        {{-- Mobile Menu JavaScript --}}
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const menuToggle = document.getElementById('mobile-menu-toggle');
                const closeSidebar = document.getElementById('close-sidebar');
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('mobile-menu-overlay');

                function openSidebar() {
                    sidebar.classList.remove('-translate-x-full');
                    overlay.classList.remove('hidden');
                    document.body.classList.add('overflow-hidden');
                }

                function closeSidebarFunc() {
                    sidebar.classList.add('-translate-x-full');
                    overlay.classList.add('hidden');
                    document.body.classList.remove('overflow-hidden');
                }

                if (menuToggle) {
                    menuToggle.addEventListener('click', openSidebar);
                }

                if (closeSidebar) {
                    closeSidebar.addEventListener('click', closeSidebarFunc);
                }

                if (overlay) {
                    overlay.addEventListener('click', closeSidebarFunc);
                }

                // Close sidebar when clicking nav links on mobile
                const navLinks = sidebar.querySelectorAll('nav a');
                navLinks.forEach(link => {
                    link.addEventListener('click', function() {
                        if (window.innerWidth < 768) {
                            closeSidebarFunc();
                        }
                    });
                });
            });
        </script>
    </body>
</html>

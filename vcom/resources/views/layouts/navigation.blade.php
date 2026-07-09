@php
    $cartCount = session('cart') ? count(session('cart')) : 0;
@endphp

<!-- Row 1: Announcement Bar -->
<div class="bg-brand-black text-white text-xs py-2 overflow-hidden">
    <div class="marquee-track flex animate-marquee whitespace-nowrap">
        @for($i = 0; $i < 4; $i++)
            <span class="mx-6">Free Shipping on Orders Over {{ currency(50) }}</span>
            <span class="mx-3 text-gray-600">&bull;</span>
            <span class="mx-6">New Drops Every Week</span>
            <span class="mx-3 text-gray-600">&bull;</span>
            <span class="mx-6">Cash on Delivery Accepted</span>
            <span class="mx-3 text-gray-600">&bull;</span>
        @endfor
    </div>
</div>

<!-- Row 2: Main Header -->
<div class="bg-brand-cream border-b border-black/10" x-data="{ mobileMenu: false }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between gap-4">
            <!-- Logo -->
            <a href="{{ route('home') }}" class="shrink-0 flex items-center">
                <span class="text-2xl font-extrabold text-brand-black tracking-tight">{{ $siteName ?? 'STRYD' }}<span class="text-brand-yellow">.</span></span>
            </a>

            <!-- Nav Links (desktop) -->
            <nav class="hidden lg:flex items-center h-full space-x-7">
                @foreach($allCategories ?? [] as $cat)
                    <a href="{{ route('shop.index', ['category' => $cat->slug]) }}" class="{{ request('category') == $cat->slug ? 'text-black' : 'text-gray-600' }} hover:text-black text-sm font-medium transition">{{ $cat->name }}</a>
                @endforeach
                <a href="{{ route('shop.index') }}" class="{{ request()->routeIs('shop.*') && !request()->hasAny(['category', 'sort', 'on_sale']) ? 'text-black' : 'text-gray-600' }} hover:text-black text-sm font-medium transition">Brands</a>
                <a href="{{ route('shop.index', ['sort' => 'newest']) }}" class="{{ request('sort') == 'newest' ? 'text-black' : 'text-gray-600' }} hover:text-black text-sm font-medium transition">New</a>
                <a href="{{ route('shop.index', ['on_sale' => 1]) }}" class="text-rose-600 hover:text-rose-700 text-sm font-semibold transition">Sale</a>
            </nav>

            <!-- Search Bar -->
            <div class="hidden md:block flex-1 max-w-sm">
                <form action="{{ route('shop.index') }}" method="GET" class="relative">
                    <input type="text" name="search" placeholder="Search"
                           class="w-full bg-white border-black/10 rounded-full text-sm py-2 pl-10 pr-4 focus:ring-brand-black focus:border-brand-black">
                    <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-grey" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                </form>
            </div>

            <!-- Right: Auth + Cart + Hamburger -->
            <div class="flex items-center space-x-6">
                <!-- Cart -->
                <a href="{{ route('cart.index') }}" class="flex flex-col items-center gap-1 text-gray-700 hover:text-black transition">
                    <span class="relative">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>
                        @if($cartCount > 0)
                            <span class="absolute -top-2 -right-2.5 bg-brand-yellow text-brand-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{{ $cartCount }}</span>
                        @endif
                    </span>
                    <span class="hidden sm:inline text-[11px] font-medium">Cart</span>
                </a>

                <!-- Wishlist -->
                @auth
                    <a href="{{ route('wishlist.index') }}" class="flex flex-col items-center gap-1 text-gray-700 hover:text-black transition">
                        <span class="relative">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            </svg>
                            @if(auth()->user()->wishlists()->count() > 0)
                                <span class="absolute -top-2 -right-2.5 bg-brand-yellow text-brand-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{{ auth()->user()->wishlists()->count() }}</span>
                            @endif
                        </span>
                        <span class="hidden sm:inline text-[11px] font-medium">Favorites</span>
                    </a>
                @else
                    <a href="{{ route('login') }}" class="hidden sm:flex flex-col items-center gap-1 text-gray-700 hover:text-black transition">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                        <span class="text-[11px] font-medium">Favorites</span>
                    </a>
                @endauth

                <!-- User / Auth -->
                @auth
                    <div class="hidden sm:block" x-data="{ userOpen: false }">
                        <button @click="userOpen = !userOpen" @click.away="userOpen = false" class="relative flex items-center">
                            <span class="w-9 h-9 rounded-full bg-brand-black text-white flex items-center justify-center text-xs font-bold uppercase ring-1 ring-black/10">
                                {{ substr(auth()->user()->name ?? 'U', 0, 1) }}
                            </span>
                        </button>
                        <div x-show="userOpen" x-transition class="absolute right-4 sm:right-auto mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1">
                            <a href="{{ route('profile.edit') }}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</a>
                            <a href="{{ route('orders.index') }}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Orders</a>
                            @if(auth()->user()->is_admin ?? false)
                                <a href="{{ route('admin.dashboard') }}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Admin Panel</a>
                            @endif
                            <div class="border-t border-gray-100 my-1"></div>
                            <form method="POST" action="{{ route('logout') }}">
                                @csrf
                                <button type="submit" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Log Out</button>
                            </form>
                        </div>
                    </div>
                @else
                    <a href="{{ route('login') }}" class="hidden sm:flex items-center">
                        <span class="w-9 h-9 rounded-full bg-brand-grey/30 text-brand-black flex items-center justify-center ring-1 ring-black/10 hover:ring-black/30 transition">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                        </span>
                    </a>
                @endauth

                <!-- Hamburger (mobile) -->
                <button @click="mobileMenu = !mobileMenu" class="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:bg-gray-100 transition">
                    <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path :class="{'hidden': mobileMenu, 'inline-flex': !mobileMenu}" class="inline-flex" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        <path :class="{'hidden': !mobileMenu, 'inline-flex': mobileMenu}" class="hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Mobile Menu -->
    <div :class="{'block': mobileMenu, 'hidden': !mobileMenu}" class="hidden lg:hidden bg-brand-cream border-t border-black/10">
        <!-- Mobile Search -->
        <div class="px-4 py-3 border-b border-gray-100">
            <form action="{{ route('shop.index') }}" method="GET" class="relative">
                <input type="text" name="search" placeholder="Search" class="w-full bg-gray-50 border-gray-200 rounded-full text-sm py-2 pl-10 pr-4 focus:ring-black focus:border-black">
                <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            </form>
        </div>

        <!-- Mobile Nav Links -->
        <div class="py-2 space-y-1">
            <a href="{{ route('home') }}" class="block px-4 py-2 text-sm font-medium {{ request()->routeIs('home') ? 'text-black bg-gray-50' : 'text-gray-700' }}">Home</a>
            <a href="{{ route('shop.index') }}" class="block px-4 py-2 text-sm font-medium {{ request()->routeIs('shop.*') ? 'text-black bg-gray-50' : 'text-gray-700' }}">Shop</a>
            @foreach($allCategories ?? [] as $cat)
                <a href="{{ route('shop.index', ['category' => $cat->slug]) }}" class="block px-4 py-2 text-sm font-medium text-gray-700">{{ $cat->name }}</a>
            @endforeach
            <a href="{{ route('pages.about') }}" class="block px-4 py-2 text-sm font-medium {{ request()->routeIs('pages.about') ? 'text-black bg-gray-50' : 'text-gray-700' }}">About</a>
            <a href="{{ route('shop.index', ['on_sale' => 1]) }}" class="block px-4 py-2 text-sm font-semibold text-rose-600">Sale</a>
            <a href="{{ route('contact') }}" class="block px-4 py-2 text-sm font-medium {{ request()->routeIs('contact') ? 'text-black bg-gray-50' : 'text-gray-700' }}">Contact</a>
            <a href="{{ route('cart.index') }}" class="block px-4 py-2 text-sm font-medium {{ request()->routeIs('cart.*') ? 'text-black bg-gray-50' : 'text-gray-700' }}">
                Cart
                @if($cartCount > 0)
                    <span class="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-black rounded-full">{{ $cartCount }}</span>
                @endif
            </a>
            @auth
                <a href="{{ route('orders.index') }}" class="block px-4 py-2 text-sm font-medium text-gray-700">My Orders</a>
                @if(auth()->user()->is_admin ?? false)
                    <a href="{{ route('admin.dashboard') }}" class="block px-4 py-2 text-sm font-medium text-gray-700">Admin Panel</a>
                @endif
            @endauth
        </div>

        <!-- Mobile Auth -->
        <div class="border-t border-gray-100 py-2">
            @auth
                <div class="px-4 py-2">
                    <p class="text-sm font-medium text-gray-900">{{ Auth::user()->name }}</p>
                    <p class="text-xs text-gray-500">{{ Auth::user()->email }}</p>
                </div>
                <a href="{{ route('profile.edit') }}" class="block px-4 py-2 text-sm text-gray-700">Profile</a>
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit" class="block w-full text-left px-4 py-2 text-sm text-gray-700">Log Out</button>
                </form>
            @else
                <a href="{{ route('login') }}" class="block px-4 py-2 text-sm font-medium text-gray-700">Login</a>
                <a href="{{ route('register') }}" class="block px-4 py-2 text-sm font-medium text-gray-700">Register</a>
            @endauth
        </div>
    </div>
</div>

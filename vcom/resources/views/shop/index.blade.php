<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-900 leading-tight">
            {{ __('Shop') }}
        </h2>
    </x-slot>

    <div class="py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col lg:flex-row gap-8">

                <!-- Sidebar -->
                <aside class="lg:w-72 shrink-0">
                    <div class="bg-white rounded-md border border-gray-200 p-6 sticky top-8">
                        <!-- Search -->
                        <div class="mb-8">
                            <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Search</h3>
                            <form action="{{ route('shop.index') }}" method="GET">
                                @if(request('category'))
                                    <input type="hidden" name="category" value="{{ request('category') }}">
                                @endif
                                @if(request('sort'))
                                    <input type="hidden" name="sort" value="{{ request('sort') }}">
                                @endif
                                <div class="relative">
                                    <input type="text"
                                           name="search"
                                           value="{{ request('search') }}"
                                           placeholder="Search products..."
                                           class="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm pe-10">
                                    <button type="submit" class="absolute inset-y-0 right-0 flex items-center pe-3 text-gray-400 hover:text-black">
                                        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- Categories -->
                        <div>
                            <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Categories</h3>
                            <ul class="space-y-1">
                                <li>
                                    <a href="{{ route('shop.index', array_merge(request()->except('category', 'page'))) }}"
                                       class="flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 {{ !request('category') ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' }}">
                                        <svg class="w-4 h-4 me-2 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
                                        </svg>
                                        All Products
                                    </a>
                                </li>
                                @foreach($categories as $category)
                                    <li>
                                        <a href="{{ route('shop.index', array_merge(request()->except('page'), ['category' => $category->slug])) }}"
                                           class="flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 {{ request('category') == $category->slug ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' }}">
                                            <svg class="w-4 h-4 me-2 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
                                            </svg>
                                            {{ $category->name }}
                                        </a>
                                    </li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                </aside>

                <!-- Main Content -->
                <div class="flex-1 min-w-0">
                    <!-- Top Bar: Result count and Sort -->
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                        <p class="text-sm text-gray-600">
                            Showing <span class="font-medium">{{ $products->firstItem() ?? 0 }}</span> - <span class="font-medium">{{ $products->lastItem() ?? 0 }}</span> of <span class="font-medium">{{ $products->total() }}</span> products
                        </p>

                        <form action="{{ route('shop.index') }}" method="GET" class="flex items-center">
                            @if(request('category'))
                                <input type="hidden" name="category" value="{{ request('category') }}">
                            @endif
                            @if(request('search'))
                                <input type="hidden" name="search" value="{{ request('search') }}">
                            @endif
                            <label for="sort" class="text-sm text-gray-600 me-2 whitespace-nowrap">Sort by:</label>
                            <select name="sort" id="sort" onchange="this.form.submit()"
                                    class="rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm">
                                <option value="newest" {{ request('sort', 'newest') == 'newest' ? 'selected' : '' }}>Newest</option>
                                <option value="price_low" {{ request('sort') == 'price_low' ? 'selected' : '' }}>Price: Low to High</option>
                                <option value="price_high" {{ request('sort') == 'price_high' ? 'selected' : '' }}>Price: High to Low</option>
                            </select>
                        </form>
                    </div>

                    <!-- Active Filters -->
                    @if(request('search') || request('category'))
                        <div class="flex flex-wrap items-center gap-2 mb-6">
                            <span class="text-sm text-gray-500">Active filters:</span>
                            @if(request('search'))
                                <a href="{{ route('shop.index', array_merge(request()->except('search', 'page'))) }}"
                                   class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors">
                                    Search: "{{ request('search') }}"
                                    <svg class="w-3 h-3 ms-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </a>
                            @endif
                            @if(request('category'))
                                @php
                                    $activeCategory = $categories->firstWhere('slug', request('category'));
                                @endphp
                                @if($activeCategory)
                                    <a href="{{ route('shop.index', array_merge(request()->except('category', 'page'))) }}"
                                       class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors">
                                        Category: {{ $activeCategory->name }}
                                        <svg class="w-3 h-3 ms-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    </a>
                                @endif
                            @endif
                            <a href="{{ route('shop.index') }}" class="text-xs text-gray-500 hover:text-black underline transition-colors">
                                Clear all
                            </a>
                        </div>
                    @endif

                    <!-- Product Grid -->
                    @if($products->count() > 0)
                        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            @foreach($products as $product)
                                <div class="group" x-data="{
                                    @auth
                                    inWishlist: {{ auth()->user()->wishlists()->where('product_id', $product->id)->exists() ? 'true' : 'false' }},
                                    toggleWishlist() {
                                        fetch('{{ route('wishlist.toggle', $product) }}', {
                                            method: 'POST',
                                            headers: {
                                                'X-CSRF-TOKEN': '{{ csrf_token() }}',
                                                'Accept': 'application/json',
                                                'Content-Type': 'application/json'
                                            }
                                        })
                                        .then(response => response.json())
                                        .then(data => {
                                            this.inWishlist = data.status === 'added';
                                        })
                                        .catch(error => console.error('Error:', error));
                                    }
                                    @endauth
                                }">
                                    <!-- Product Image -->
                                    <a href="{{ route('shop.show', $product) }}" class="block relative overflow-hidden aspect-square rounded-md bg-gray-100">
                                        @if($product->images && $product->images->count() > 0)
                                            <img src="{{ asset('storage/' . $product->images->first()->image_path) }}"
                                                 alt="{{ $product->name }}"
                                                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                                        @else
                                            <div class="w-full h-full flex items-center justify-center">
                                                <span class="text-5xl font-bold text-gray-300">{{ strtoupper(substr($product->name, 0, 1)) }}</span>
                                            </div>
                                        @endif

                                        @if($product->sale_price && $product->sale_price < $product->price)
                                            <div class="absolute top-3 left-3">
                                                <span class="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-semibold bg-rose-600 text-white">
                                                    SALE
                                                </span>
                                            </div>
                                        @endif

                                        @auth
                                            <button type="button" @click.prevent="toggleWishlist()"
                                                    class="absolute top-3 right-3 p-2 rounded-full bg-white shadow-md hover:scale-110 transition-transform duration-200 focus:outline-none">
                                                <svg class="w-5 h-5 transition-colors" :class="inWishlist ? 'text-black' : 'text-gray-400'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" :fill="inWishlist ? 'currentColor' : 'none'">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                                </svg>
                                            </button>
                                        @endauth
                                    </a>

                                    <!-- Product Info -->
                                    <div class="pt-4">
                                        @if($product->category)
                                            <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                                                {{ $product->category->name }}
                                            </p>
                                        @endif

                                        <a href="{{ route('shop.show', $product) }}" class="block">
                                            <h3 class="text-base font-semibold text-gray-900 hover:text-gray-600 transition-colors duration-200 line-clamp-2">
                                                {{ $product->name }}
                                            </h3>
                                        </a>

                                        @if($product->approvedReviews->count() > 0)
                                            <div class="flex items-center gap-1 mt-2">
                                                <div class="flex">
                                                    @php
                                                        $avgRating = $product->averageRating();
                                                        $fullStars = floor($avgRating);
                                                    @endphp
                                                    @for($i = 1; $i <= 5; $i++)
                                                        <svg class="w-3.5 h-3.5 {{ $i <= $fullStars ? 'text-yellow-400' : 'text-gray-200' }} fill-current" viewBox="0 0 20 20">
                                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                                        </svg>
                                                    @endfor
                                                </div>
                                                <span class="text-xs text-gray-500">({{ $product->approvedReviews->count() }})</span>
                                            </div>
                                        @endif

                                        <div class="mt-2 flex items-baseline space-x-2">
                                            @if($product->sale_price && $product->sale_price < $product->price)
                                                <span class="text-lg font-bold text-gray-900">{{ currency($product->sale_price) }}</span>
                                                <span class="text-sm text-gray-400 line-through">{{ currency($product->price) }}</span>
                                            @else
                                                <span class="text-lg font-bold text-gray-900">{{ currency($product->price) }}</span>
                                            @endif
                                        </div>

                                        @if($product->hasVariants())
                                            <a href="{{ route('shop.show', $product) }}"
                                               class="mt-3 w-full inline-flex items-center justify-center px-4 py-2.5 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-900 uppercase tracking-widest hover:border-black hover:bg-black hover:text-white transition ease-in-out duration-150">
                                                View Options
                                            </a>
                                        @else
                                            <form action="{{ route('cart.add') }}" method="POST" class="mt-3">
                                                @csrf
                                                <input type="hidden" name="product_id" value="{{ $product->id }}">
                                                <input type="hidden" name="quantity" value="1">
                                                <button type="submit"
                                                        class="w-full inline-flex items-center justify-center px-4 py-2.5 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-900 uppercase tracking-widest hover:border-black hover:bg-black hover:text-white transition ease-in-out duration-150">
                                                    Add to Cart
                                                </button>
                                            </form>
                                        @endif
                                    </div>
                                </div>
                            @endforeach
                        </div>

                        <!-- Pagination -->
                        <div class="mt-8">
                            {{ $products->withQueryString()->links() }}
                        </div>
                    @else
                        <div class="bg-white rounded-md border border-gray-200 p-12 text-center">
                            <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                            <h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                            <p class="text-gray-500 mb-6">Try adjusting your search or filter to find what you are looking for.</p>
                            <a href="{{ route('shop.index') }}"
                               class="inline-flex items-center px-4 py-2 bg-black border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-800 transition ease-in-out duration-150">
                                Clear Filters
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</x-app-layout>

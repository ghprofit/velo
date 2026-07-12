<x-app-layout>
    <div class="py-12 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-gray-900">My Wishlist</h1>
                <p class="text-gray-600">{{ $wishlists->count() }} {{ Str::plural('item', $wishlists->count()) }}</p>
            </div>

            @if(session('success'))
                <div class="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
                    {{ session('success') }}
                </div>
            @endif

            @if($wishlists->isEmpty())
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                    <p class="text-gray-600 mb-6">Start adding products you love!</p>
                    <a href="{{ route('shop.index') }}" class="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-lg transition">
                        Continue Shopping
                    </a>
                </div>
            @else
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    @foreach($wishlists as $wishlist)
                        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
                            <div class="relative">
                                <a href="{{ route('shop.show', $wishlist->product) }}">
                                    @if($wishlist->product->primaryImage)
                                        <img src="{{ asset('storage/' . $wishlist->product->primaryImage->image_path) }}" 
                                             alt="{{ $wishlist->product->name }}" 
                                             class="w-full h-48 object-cover group-hover:scale-105 transition duration-300">
                                    @else
                                        <div class="w-full h-48 bg-gray-200 flex items-center justify-center">
                                            <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                            </svg>
                                        </div>
                                    @endif
                                </a>
                                
                                <!-- Remove from Wishlist -->
                                <form action="{{ route('wishlist.destroy', $wishlist) }}" method="POST" class="absolute top-2 right-2">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="bg-white/90 hover:bg-white text-red-600 p-2 rounded-full shadow-lg transition">
                                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                        </svg>
                                    </button>
                                </form>
                            </div>

                            <div class="p-4">
                                <p class="text-xs text-gray-500 mb-1">{{ $wishlist->product->category->name }}</p>
                                <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">
                                    <a href="{{ route('shop.show', $wishlist->product) }}" class="hover:text-red-600 transition">
                                        {{ $wishlist->product->name }}
                                    </a>
                                </h3>

                                <div class="flex items-center justify-between mb-3">
                                    @if($wishlist->product->is_on_sale)
                                        <div>
                                            <span class="text-lg font-bold text-red-600">{{ currency($wishlist->product->sale_price) }}</span>
                                            <span class="text-sm text-gray-500 line-through ml-2">{{ currency($wishlist->product->price) }}</span>
                                        </div>
                                    @else
                                        <span class="text-lg font-bold text-gray-900">{{ currency($wishlist->product->price) }}</span>
                                    @endif
                                </div>

                                @if($wishlist->product->stock > 0)
                                    <form action="{{ route('cart.add') }}" method="POST">
                                        @csrf
                                        <input type="hidden" name="product_id" value="{{ $wishlist->product->id }}">
                                        <input type="hidden" name="quantity" value="1">
                                        <button type="submit" class="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 rounded-lg transition">
                                            Add to Cart
                                        </button>
                                    </form>
                                @else
                                    <button disabled class="w-full bg-gray-300 text-gray-500 text-sm font-semibold py-2 rounded-lg cursor-not-allowed">
                                        Out of Stock
                                    </button>
                                @endif
                            </div>
                        </div>
                    @endforeach
                </div>
            @endif
        </div>
    </div>
</x-app-layout>

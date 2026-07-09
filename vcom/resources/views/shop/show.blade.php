<x-app-layout>
    @php
        $colorsData = $product->colors->map(fn($color) => [
            'id' => $color->id,
            'name' => $color->name,
            'hex' => $color->hex_color,
            'images' => $color->images->map(fn($img) => asset('storage/' . $img->image_path))->values(),
            'variants' => $color->variants->map(fn($v) => ['id' => $v->id, 'size' => $v->size, 'stock' => $v->stock])->values(),
        ])->values();

        $generalImages = $product->images->whereNull('product_color_id')->map(fn($img) => asset('storage/' . $img->image_path))->values();
        $noColorVariants = $product->variants->whereNull('product_color_id')->map(fn($v) => ['id' => $v->id, 'size' => $v->size, 'stock' => $v->stock])->values();

        $avgRating = $product->averageRating();
        $reviewCount = $product->approvedReviews->count();
        $ratingCounts = [5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0];
        foreach ($product->approvedReviews as $r) {
            $ratingCounts[$r->rating] = ($ratingCounts[$r->rating] ?? 0) + 1;
        }
    @endphp

    <div class="py-8" x-data="{
        colors: @js($colorsData),
        generalImages: @js($generalImages),
        noColorVariants: @js($noColorVariants),
        activeColorId: {{ $product->colors->first()->id ?? 'null' }},
        activeImage: 0,
        selectedVariantId: null,
        activeTab: 'details',
        inWishlist: {{ $inWishlist ? 'true' : 'false' }},
        sizeGuideOpen: false,
        get currentColor() { return this.colors.find(c => c.id === this.activeColorId) || null },
        get images() {
            const c = this.currentColor;
            if (c && c.images.length) return c.images;
            return this.generalImages;
        },
        get variants() {
            const c = this.currentColor;
            return c ? c.variants : this.noColorVariants;
        },
        get selectedVariant() {
            return this.variants.find(v => v.id === this.selectedVariantId) || null;
        },
        selectColor(id) {
            this.activeColorId = id;
            this.activeImage = 0;
            this.selectedVariantId = null;
        },
        selectVariant(v) {
            if (v.stock > 0) this.selectedVariantId = v.id;
        },
        toggleWishlist() {
            fetch('{{ route('wishlist.toggle', $product) }}', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': '{{ csrf_token() }}', 'Accept': 'application/json', 'Content-Type': 'application/json' }
            }).then(r => r.json()).then(data => { this.inWishlist = data.status === 'added'; });
        }
    }">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Breadcrumb -->
            <nav class="mb-6">
                <ol class="flex items-center flex-wrap gap-1.5 text-xs text-gray-400">
                    <li><a href="{{ route('home') }}" class="hover:text-black transition-colors">Home</a></li>
                    <li>/</li>
                    <li><a href="{{ route('shop.index') }}" class="hover:text-black transition-colors">Shop</a></li>
                    @if($product->category)
                        <li>/</li>
                        <li>
                            <a href="{{ route('shop.index', ['category' => $product->category->slug]) }}" class="hover:text-black transition-colors">
                                {{ $product->category->name }}
                            </a>
                        </li>
                    @endif
                    <li>/</li>
                    <li class="text-gray-900 font-medium truncate">{{ $product->name }}</li>
                </ol>
            </nav>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <!-- Gallery -->
                <div>
                    <template x-if="images.length > 0">
                        <div>
                            <div class="relative overflow-hidden rounded-md bg-gray-100 aspect-square mb-4">
                                <template x-for="(src, index) in images" :key="index">
                                    <img x-show="activeImage === index" :src="src" alt="{{ $product->name }}"
                                         class="w-full h-full object-cover"
                                         x-transition:enter="transition ease-out duration-300"
                                         x-transition:enter-start="opacity-0"
                                         x-transition:enter-end="opacity-100">
                                </template>

                                @if($product->sale_price && $product->sale_price < $product->price)
                                    <div class="absolute top-4 left-4">
                                        <span class="inline-flex items-center px-3 py-1 rounded-sm text-xs font-semibold bg-rose-600 text-white">
                                            -{{ round((1 - $product->sale_price / $product->price) * 100) }}%
                                        </span>
                                    </div>
                                @endif
                            </div>

                            <div class="grid grid-cols-5 gap-3" x-show="images.length > 1">
                                <template x-for="(src, index) in images.slice(0, 4)" :key="index">
                                    <button @click="activeImage = index"
                                            :class="activeImage === index ? 'border-black' : 'border-transparent hover:border-gray-300'"
                                            class="aspect-square rounded-md overflow-hidden bg-gray-100 border-2 transition-colors">
                                        <img :src="src" alt="{{ $product->name }}" class="w-full h-full object-cover">
                                    </button>
                                </template>
                                <button x-show="images.length > 5" @click="activeImage = 4"
                                        class="aspect-square rounded-md bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 hover:bg-gray-200 transition-colors">
                                    +<span x-text="images.length - 4"></span> more
                                </button>
                            </div>
                        </div>
                    </template>
                    <template x-if="images.length === 0">
                        <div class="aspect-square rounded-md bg-gray-100 flex items-center justify-center">
                            <span class="text-8xl font-bold text-gray-300">{{ strtoupper(substr($product->name, 0, 1)) }}</span>
                        </div>
                    </template>
                </div>

                <!-- Info -->
                <div class="flex flex-col">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2">
                            <span class="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center text-white text-[10px] font-bold">
                                {{ strtoupper(substr($product->category->name ?? $product->name, 0, 1)) }}
                            </span>
                            <span class="text-sm font-medium text-gray-700">{{ $product->category->name ?? 'STRYD' }}</span>
                        </div>
                        @if($product->sku)
                            <span class="text-xs text-gray-400 uppercase tracking-wide">{{ $product->sku }}</span>
                        @endif
                    </div>

                    <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{{ $product->name }}</h1>

                    @if($reviewCount > 0)
                        <div class="flex items-center gap-2 mb-4">
                            <div class="flex items-center">
                                @php $fullStars = floor($avgRating); $hasHalfStar = ($avgRating - $fullStars) >= 0.5; @endphp
                                @for($i = 1; $i <= 5; $i++)
                                    @if($i <= $fullStars)
                                        <svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                                    @elseif($i == $fullStars + 1 && $hasHalfStar)
                                        <svg class="w-4 h-4 text-yellow-400" viewBox="0 0 20 20">
                                            <defs><linearGradient id="half-{{ $product->id }}"><stop offset="50%" stop-color="#FBBF24"/><stop offset="50%" stop-color="#D1D5DB"/></linearGradient></defs>
                                            <path fill="url(#half-{{ $product->id }})" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                        </svg>
                                    @else
                                        <svg class="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                                    @endif
                                @endfor
                            </div>
                            <span class="text-sm text-gray-500">{{ $reviewCount }} {{ Str::plural('review', $reviewCount) }}</span>
                        </div>
                    @endif

                    <div class="flex items-baseline gap-3 mb-6">
                        @if($product->sale_price && $product->sale_price < $product->price)
                            <span class="text-2xl font-bold text-gray-900">{{ currency($product->sale_price) }}</span>
                            <span class="text-base text-gray-400 line-through">{{ currency($product->price) }}</span>
                        @else
                            <span class="text-2xl font-bold text-gray-900">{{ currency($product->price) }}</span>
                        @endif
                    </div>

                    <!-- Color -->
                    <template x-if="colors.length > 0">
                        <div class="mb-6">
                            <p class="text-sm text-gray-700 mb-2">
                                Color · <span class="font-medium text-gray-900" x-text="currentColor ? currentColor.name : ''"></span>
                            </p>
                            <div class="flex items-center gap-2.5">
                                <template x-for="color in colors" :key="color.id">
                                    <button @click="selectColor(color.id)"
                                            :class="activeColorId === color.id ? 'ring-2 ring-offset-2 ring-black' : 'ring-1 ring-gray-200 hover:ring-gray-400'"
                                            class="w-11 h-11 rounded-md overflow-hidden transition-all bg-gray-100"
                                            :style="!color.images.length ? ('background-color: ' + (color.hex || '#e5e7eb')) : ''"
                                            :title="color.name">
                                        <img x-show="color.images.length" :src="color.images[0]" class="w-full h-full object-cover" alt="">
                                    </button>
                                </template>
                            </div>
                        </div>
                    </template>

                    <!-- Size -->
                    <template x-if="variants.length > 0">
                        <div class="mb-6">
                            <div class="flex items-center justify-between mb-2">
                                <p class="text-sm text-gray-700">Size · EU</p>
                            </div>
                            <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                <template x-for="v in variants" :key="v.id">
                                    <button @click="selectVariant(v)" :disabled="v.stock <= 0"
                                            :class="{
                                                'bg-black text-white border-black': selectedVariantId === v.id,
                                                'border-gray-300 text-gray-900 hover:border-black': selectedVariantId !== v.id && v.stock > 0,
                                                'border-gray-100 text-gray-300 cursor-not-allowed line-through': v.stock <= 0
                                            }"
                                            class="py-2 text-sm font-medium border rounded-md transition-colors">
                                        <span x-text="v.size"></span>
                                    </button>
                                </template>
                            </div>
                            <button type="button" @click="sizeGuideOpen = true" class="mt-2 text-xs font-semibold text-amber-600 hover:underline">Size guide</button>
                        </div>
                    </template>

                    <!-- Size guide modal -->
                    <div x-show="sizeGuideOpen"
                         class="fixed inset-0 z-50 flex items-center justify-center p-4"
                         style="display: none;">
                        <div class="absolute inset-0 bg-black/50" @click="sizeGuideOpen = false"></div>
                        <div x-show="sizeGuideOpen" x-transition class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-base font-bold text-gray-900">Size guide</h3>
                                <button @click="sizeGuideOpen = false" class="text-gray-400 hover:text-black">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="text-left text-gray-400 text-xs uppercase tracking-wide">
                                        <th class="py-2">EU</th>
                                        <th class="py-2">UK</th>
                                        <th class="py-2">US</th>
                                        <th class="py-2">CM</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100 text-gray-700">
                                    @foreach([['40','6.5','7.5','25.4'],['40.5','7','8','25.7'],['41','7.5','8.5','26'],['42','8','9','26.7'],['42.5','8.5','9.5','27'],['43','9','10','27.3'],['44','9.5','10.5','28'],['44.5','10','11','28.3'],['45','10.5','11.5','28.9'],['46','11.5','12.5','29.4']] as $row)
                                        <tr>
                                            @foreach($row as $cell)
                                                <td class="py-1.5">{{ $cell }}</td>
                                            @endforeach
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                            <p class="mt-4 text-xs text-gray-400">Measurements are approximate. If you're between sizes, we recommend sizing up.</p>
                        </div>
                    </div>

                    <!-- Stock (no-variant fallback) -->
                    @if($product->colors->isEmpty() && $product->variants->isEmpty())
                        <div class="mb-6 text-sm">
                            @if(($product->stock ?? 0) > 0)
                                <span class="text-gray-700 font-medium">In stock</span>
                                <span class="text-gray-400">— {{ $product->stock }} available</span>
                            @else
                                <span class="text-rose-600 font-medium">Out of stock</span>
                            @endif
                        </div>
                    @endif

                    <!-- Add to cart -->
                    <div class="mt-auto pt-2">
                        <form action="{{ route('cart.add') }}" method="POST">
                            @csrf
                            <input type="hidden" name="product_id" value="{{ $product->id }}">
                            <input type="hidden" name="quantity" value="1">
                            <input type="hidden" name="variant_id" :value="selectedVariantId">

                            <div class="flex items-center gap-3">
                                <button type="submit"
                                        :disabled="variants.length > 0 && !selectedVariantId"
                                        :class="(variants.length > 0 && !selectedVariantId) ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-800'"
                                        class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-black rounded-md font-semibold text-sm text-white transition">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>
                                    Add to cart
                                </button>

                                @auth
                                    <button type="button" @click="toggleWishlist()"
                                            class="shrink-0 w-14 h-[52px] inline-flex items-center justify-center border rounded-md transition-colors"
                                            :class="inWishlist ? 'bg-black border-black text-white' : 'border-gray-300 text-gray-700 hover:border-black'">
                                        <svg class="w-5 h-5" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" :fill="inWishlist ? 'currentColor' : 'none'">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                        </svg>
                                    </button>
                                @endauth
                            </div>
                            <p x-show="variants.length > 0 && !selectedVariantId" class="mt-2 text-xs text-rose-600">Please select a size.</p>
                        </form>

                        <p class="mt-4 flex items-center gap-2 text-xs text-gray-500">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0H21M3.375 14.25h6.75M21 12.75H3.375m17.25 0a1.125 1.125 0 0 0 .375-.839V6.375a1.125 1.125 0 0 0-1.125-1.125H3.375A1.125 1.125 0 0 0 2.25 6.375v5.536c0 .315.132.616.375.839" /></svg>
                            Free delivery on orders over {{ currency(30) }}
                        </p>

                        @if(session('success'))
                            <div class="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700">{{ session('success') }}</div>
                        @endif
                        @if(session('error'))
                            <div class="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-md text-sm text-rose-700">{{ session('error') }}</div>
                        @endif
                    </div>
                </div>
            </div>

            <!-- Tabs: Details / Reviews -->
            <div class="mt-16 border-t border-gray-200">
                <div class="flex items-center gap-8 border-b border-gray-200">
                    <button @click="activeTab = 'details'"
                            :class="activeTab === 'details' ? 'border-black text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'"
                            class="py-4 text-sm font-semibold border-b-2 transition-colors">Details</button>
                    <button @click="activeTab = 'reviews'"
                            :class="activeTab === 'reviews' ? 'border-black text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'"
                            class="py-4 text-sm font-semibold border-b-2 transition-colors">Reviews ({{ $reviewCount }})</button>
                </div>

                <!-- Details panel -->
                <div x-show="activeTab === 'details'" class="py-8 max-w-3xl">
                    <div class="prose prose-sm text-gray-600 max-w-none">
                        {!! nl2br(e($product->description)) !!}
                    </div>
                </div>

                <!-- Reviews panel -->
                <div x-show="activeTab === 'reviews'" class="py-8">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <!-- Review list -->
                        <div class="lg:col-span-2 order-2 lg:order-1">
                            @if($reviewCount > 0)
                                <div class="space-y-6">
                                    @foreach($product->approvedReviews as $review)
                                        <div class="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                            <div class="flex items-start justify-between mb-2">
                                                <div class="flex items-center gap-3">
                                                    <span class="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
                                                        {{ strtoupper(substr($review->user->name, 0, 1)) }}
                                                    </span>
                                                    <div>
                                                        <div class="flex items-center gap-2">
                                                            <span class="font-semibold text-gray-900 text-sm">{{ $review->user->name }}</span>
                                                            @if($review->verified_purchase)
                                                                <span class="text-[10px] uppercase tracking-wide text-gray-400">Verified</span>
                                                            @endif
                                                        </div>
                                                        <span class="text-xs text-gray-400">{{ $review->created_at->diffForHumans() }}</span>
                                                    </div>
                                                </div>
                                                @auth
                                                    @if($review->user_id === auth()->id())
                                                        <form action="{{ route('reviews.destroy', $review) }}" method="POST" onsubmit="return confirm('Are you sure you want to delete this review?')">
                                                            @csrf
                                                            @method('DELETE')
                                                            <button type="submit" class="text-xs text-gray-400 hover:text-rose-600">Delete</button>
                                                        </form>
                                                    @endif
                                                @endauth
                                            </div>
                                            <div class="flex mb-2">
                                                @for($i = 1; $i <= 5; $i++)
                                                    <svg class="w-3.5 h-3.5 {{ $i <= $review->rating ? 'text-yellow-400' : 'text-gray-200' }} fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                                                @endfor
                                            </div>
                                            @if($review->title)
                                                <h4 class="font-semibold text-gray-900 text-sm mb-1">{{ $review->title }}</h4>
                                            @endif
                                            @if($review->comment)
                                                <p class="text-gray-600 text-sm">{{ $review->comment }}</p>
                                            @endif
                                        </div>
                                    @endforeach
                                </div>
                            @else
                                <p class="text-gray-400 text-sm">No reviews yet. Be the first to review this product.</p>
                            @endif

                            <!-- Review Form -->
                            @auth
                                @php $userReview = $product->reviews()->where('user_id', auth()->id())->first(); @endphp
                                @if(!$userReview)
                                    @if($hasPurchased)
                                        <div class="mt-10 pt-8 border-t border-gray-100" x-data="{ rating: 0 }">
                                            <h3 class="text-sm font-semibold text-gray-900 mb-4">Write a review</h3>
                                            <form action="{{ route('reviews.store', $product) }}" method="POST">
                                                @csrf
                                                <div class="mb-4">
                                                    <div class="flex items-center gap-1">
                                                        @for($i = 1; $i <= 5; $i++)
                                                            <button type="button" @click="rating = {{ $i }}" class="focus:outline-none">
                                                                <svg class="w-7 h-7 transition-colors" :class="rating >= {{ $i }} ? 'text-yellow-400' : 'text-gray-200'" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                                                            </button>
                                                        @endfor
                                                        <input type="hidden" name="rating" :value="rating" required>
                                                    </div>
                                                    @error('rating') <p class="mt-1 text-sm text-rose-600">{{ $message }}</p> @enderror
                                                </div>
                                                <div class="mb-4">
                                                    <input type="text" name="title" value="{{ old('title') }}"
                                                           class="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-black focus:border-black"
                                                           placeholder="Review title">
                                                </div>
                                                <div class="mb-4">
                                                    <textarea name="comment" rows="4"
                                                              class="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-black focus:border-black"
                                                              placeholder="Tell us about your experience">{{ old('comment') }}</textarea>
                                                </div>
                                                <button type="submit" class="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition">Submit review</button>
                                            </form>
                                        </div>
                                    @elseif($hasPurchasedAny)
                                        <p class="mt-10 pt-8 border-t border-gray-100 text-sm text-gray-500">You can review this product once your order has been delivered.</p>
                                    @else
                                        <p class="mt-10 pt-8 border-t border-gray-100 text-sm text-gray-500">You must purchase this product to leave a review.</p>
                                    @endif
                                @else
                                    <p class="mt-10 pt-8 border-t border-gray-100 text-sm text-gray-500">You have already reviewed this product.</p>
                                @endif
                            @else
                                <p class="mt-10 pt-8 border-t border-gray-100 text-sm text-gray-500">
                                    <a href="{{ route('login') }}" class="text-black underline">Sign in</a> to write a review.
                                </p>
                            @endauth
                        </div>

                        <!-- Rating summary -->
                        <div class="order-1 lg:order-2">
                            <div class="flex items-center gap-3 mb-6">
                                <div class="flex">
                                    @for($i = 1; $i <= 5; $i++)
                                        <svg class="w-4 h-4 {{ $i <= floor($avgRating) ? 'text-yellow-400' : 'text-gray-200' }} fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                                    @endfor
                                </div>
                                <span class="text-lg font-bold text-gray-900">{{ number_format($avgRating, 1) }}</span>
                            </div>
                            <div class="space-y-2">
                                @for($star = 5; $star >= 1; $star--)
                                    <div class="flex items-center gap-3 text-xs text-gray-500">
                                        <span class="w-3">{{ $star }}</span>
                                        <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div class="h-full bg-gray-900" style="width: {{ $reviewCount > 0 ? ($ratingCounts[$star] / $reviewCount * 100) : 0 }}%"></div>
                                        </div>
                                        <span class="w-6 text-right">{{ $ratingCounts[$star] }}</span>
                                    </div>
                                @endfor
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Related Products -->
            @if($relatedProducts->count() > 0)
                <div class="mt-16">
                    <h2 class="text-xl font-bold text-gray-900 mb-8">You may also like</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        @foreach($relatedProducts as $relatedProduct)
                            <div class="group">
                                <a href="{{ route('shop.show', $relatedProduct) }}" class="block relative overflow-hidden aspect-square rounded-md bg-gray-100">
                                    @if($relatedProduct->images && $relatedProduct->images->count() > 0)
                                        <img src="{{ asset('storage/' . $relatedProduct->images->first()->image_path) }}"
                                             alt="{{ $relatedProduct->name }}"
                                             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                                    @else
                                        <div class="w-full h-full flex items-center justify-center">
                                            <span class="text-5xl font-bold text-gray-300">{{ strtoupper(substr($relatedProduct->name, 0, 1)) }}</span>
                                        </div>
                                    @endif
                                    @if($relatedProduct->sale_price && $relatedProduct->sale_price < $relatedProduct->price)
                                        <span class="absolute top-3 left-3 inline-flex items-center px-2 py-1 rounded-sm text-xs font-semibold bg-rose-600 text-white">SALE</span>
                                    @endif
                                </a>
                                <div class="pt-4">
                                    @if($relatedProduct->category)
                                        <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">{{ $relatedProduct->category->name }}</p>
                                    @endif
                                    <a href="{{ route('shop.show', $relatedProduct) }}" class="block">
                                        <h3 class="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors line-clamp-2">{{ $relatedProduct->name }}</h3>
                                    </a>
                                    <div class="mt-1.5 flex items-baseline gap-2">
                                        @if($relatedProduct->sale_price && $relatedProduct->sale_price < $relatedProduct->price)
                                            <span class="text-sm font-bold text-gray-900">{{ currency($relatedProduct->sale_price) }}</span>
                                            <span class="text-xs text-gray-400 line-through">{{ currency($relatedProduct->price) }}</span>
                                        @else
                                            <span class="text-sm font-bold text-gray-900">{{ currency($relatedProduct->price) }}</span>
                                        @endif
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif
        </div>
    </div>
</x-app-layout>

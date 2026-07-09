<x-app-layout>

    @if($settings['show_banner'] == '1' && $settings['banner_text'])
    <div class="bg-brand-black text-white py-2">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p class="text-sm font-medium">{{ $settings['banner_text'] }}</p>
        </div>
    </div>
    @endif

    <!-- ============================================ -->
    <!-- Hero                                          -->
    <!-- ============================================ -->
    <section class="bg-brand-cream">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
            <div x-data="{ currentSlide: 0, totalSlides: {{ max($heroBanners->count(), 1) }}, interval: null }"
                 x-init="totalSlides > 1 && (interval = setInterval(() => currentSlide = (currentSlide + 1) % totalSlides, 6000))"
                 class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

                @if($heroBanners->count() > 0)
                    @foreach($heroBanners as $index => $banner)
                        <div x-show="currentSlide === {{ $index }}" x-transition.opacity.duration.500ms>
                            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-brand-grey mb-4">New Season</p>
                            <h1 class="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-brand-black leading-[1.05] tracking-tight">
                                {{ $banner->title ?? $settings['hero_title'] }}
                            </h1>
                            @if($banner->subtitle ?? $settings['hero_subtitle'])
                                <p class="mt-5 text-brand-grey text-lg max-w-md">{{ $banner->subtitle ?? $settings['hero_subtitle'] }}</p>
                            @endif
                            <a href="{{ $banner->button_link ?? route('shop.index') }}"
                               class="mt-8 inline-flex items-center gap-2 bg-brand-black text-white font-semibold px-7 py-3.5 rounded-full hover:bg-black transition text-sm">
                                {{ $banner->button_text ?? 'Shop Now' }}
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" /></svg>
                            </a>
                        </div>
                    @endforeach
                @else
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-brand-grey mb-4">New Season</p>
                        <h1 class="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-brand-black leading-[1.05] tracking-tight">
                            {{ $settings['hero_title'] }}
                        </h1>
                        @if($settings['hero_subtitle'])
                            <p class="mt-5 text-brand-grey text-lg max-w-md">{{ $settings['hero_subtitle'] }}</p>
                        @endif
                        <a href="{{ route('shop.index') }}"
                           class="mt-8 inline-flex items-center gap-2 bg-brand-black text-white font-semibold px-7 py-3.5 rounded-full hover:bg-black transition text-sm">
                            Shop Now
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" /></svg>
                        </a>
                    </div>
                @endif

                <!-- Image panel -->
                <div class="relative aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden bg-white">
                    @if($heroBanners->count() > 0)
                        @foreach($heroBanners as $index => $banner)
                            <img x-show="currentSlide === {{ $index }}" x-transition.opacity.duration.500ms
                                 src="{{ asset('storage/' . $banner->image_path) }}" alt="{{ $banner->title ?? 'Hero' }}"
                                 class="absolute inset-0 w-full h-full object-cover">
                        @endforeach
                    @elseif($settings['hero_image'])
                        <img src="{{ asset('storage/' . $settings['hero_image']) }}" alt="Hero" class="absolute inset-0 w-full h-full object-cover">
                    @else
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-9xl font-extrabold text-brand-grey/30">{{ substr($siteName ?? 'STRYD', 0, 1) }}</span>
                        </div>
                    @endif
                </div>

                @if($heroBanners->count() > 1)
                    <div class="lg:col-span-2 flex justify-center gap-2 -mt-4">
                        <template x-for="i in totalSlides" :key="i">
                            <button @click="currentSlide = i - 1"
                                    :class="currentSlide === i - 1 ? 'bg-brand-black w-6' : 'bg-brand-grey/40 w-2'"
                                    class="h-2 rounded-full transition-all duration-300"></button>
                        </template>
                    </div>
                @endif
            </div>
        </div>
    </section>

    <!-- ============================================ -->
    <!-- Shop by Category                              -->
    <!-- ============================================ -->
    @if($categories->count() > 0)
    <section class="py-14 lg:py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-end justify-between mb-8">
                <h2 class="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight">Shop by Category</h2>
                <a href="{{ route('shop.index') }}" class="text-sm font-semibold text-brand-black hover:text-brand-grey transition hidden sm:inline-flex items-center gap-1">
                    View all
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" /></svg>
                </a>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                @foreach($categories as $category)
                    <a href="{{ route('shop.index', ['category' => $category->slug]) }}"
                       class="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-brand-cream">
                        @if($category->image)
                            <img src="{{ asset('storage/' . $category->image) }}" alt="{{ $category->name }}"
                                 class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                            <div class="absolute inset-0 bg-gradient-to-t from-brand-black/70 via-transparent to-transparent"></div>
                        @else
                            <div class="absolute inset-0 bg-gradient-to-br from-brand-black to-brand-black/80 group-hover:from-black transition-colors duration-500"></div>
                        @endif
                        <div class="absolute inset-0 flex flex-col justify-end p-5">
                            <h3 class="text-lg font-bold text-white">{{ $category->name }}</h3>
                            <p class="text-white/60 text-xs mt-0.5">{{ $category->products_count }} {{ Str::plural('style', $category->products_count) }}</p>
                        </div>
                        <div class="absolute top-4 right-4 w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg class="w-4 h-4 text-brand-black" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" /></svg>
                        </div>
                    </a>
                @endforeach
            </div>
        </div>
    </section>
    @endif

    <!-- ============================================ -->
    <!-- Featured                                      -->
    <!-- ============================================ -->
    @php $featured = $featuredProducts->count() > 0 ? $featuredProducts : $newArrivals->take(4); @endphp
    @if($featured->count() > 0)
    <section class="py-14 lg:py-20 bg-brand-cream">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-end justify-between mb-8">
                <h2 class="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight">Featured Picks</h2>
                <a href="{{ route('shop.index') }}" class="text-sm font-semibold text-brand-black hover:text-brand-grey transition hidden sm:inline-flex items-center gap-1">
                    View all
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" /></svg>
                </a>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                @foreach($featured as $product)
                    <a href="{{ route('shop.show', $product) }}" class="group block">
                        <div class="relative aspect-square rounded-2xl overflow-hidden bg-white mb-4">
                            @if($product->primaryImage)
                                <img src="{{ asset('storage/' . $product->primaryImage->image_path) }}" alt="{{ $product->name }}"
                                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                            @else
                                <div class="w-full h-full flex items-center justify-center">
                                    <span class="text-4xl font-extrabold text-brand-grey/30">{{ strtoupper(substr($product->name, 0, 1)) }}</span>
                                </div>
                            @endif
                            @if($product->sale_price && $product->sale_price < $product->price)
                                <span class="absolute top-3 left-3 bg-brand-yellow text-brand-black text-[11px] font-bold px-2.5 py-1 rounded-full">SALE</span>
                            @endif
                        </div>
                        @if($product->category)
                            <p class="text-[11px] font-semibold text-brand-grey uppercase tracking-wider mb-1">{{ $product->category->name }}</p>
                        @endif
                        <h3 class="text-sm font-semibold text-brand-black group-hover:text-brand-grey transition line-clamp-1">{{ $product->name }}</h3>
                        <div class="mt-1 flex items-baseline gap-2">
                            @if($product->sale_price && $product->sale_price < $product->price)
                                <span class="text-sm font-bold text-brand-black">{{ currency($product->sale_price) }}</span>
                                <span class="text-xs text-brand-grey line-through">{{ currency($product->price) }}</span>
                            @else
                                <span class="text-sm font-bold text-brand-black">{{ currency($product->price) }}</span>
                            @endif
                        </div>
                    </a>
                @endforeach
            </div>
        </div>
    </section>
    @endif

    <!-- ============================================ -->
    <!-- Promo banner                                  -->
    <!-- ============================================ -->
    @if($saleProducts->count() > 0)
    <section class="bg-brand-black">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 text-center">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-brand-yellow mb-4">Limited Time</p>
            <h2 class="text-3xl lg:text-4xl font-extrabold text-white tracking-tight max-w-2xl mx-auto">End of Season Sale — Up to 30% Off</h2>
            <p class="mt-4 text-brand-grey max-w-md mx-auto">Selected styles across men's, women's, and kids'. While stocks last.</p>
            <a href="{{ route('shop.index', ['on_sale' => 1]) }}"
               class="mt-8 inline-flex items-center gap-2 bg-brand-yellow text-brand-black font-semibold px-7 py-3.5 rounded-full hover:bg-white transition text-sm">
                Shop the Sale
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" /></svg>
            </a>
        </div>
    </section>
    @endif

    <!-- ============================================ -->
    <!-- New Arrivals                                  -->
    <!-- ============================================ -->
    @if($newArrivals->count() > 0)
    <section class="py-14 lg:py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-end justify-between mb-8">
                <h2 class="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight">New In</h2>
                <a href="{{ route('shop.index') }}" class="text-sm font-semibold text-brand-black hover:text-brand-grey transition hidden sm:inline-flex items-center gap-1">
                    View all
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" /></svg>
                </a>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                @foreach($newArrivals->take(4) as $product)
                    <a href="{{ route('shop.show', $product) }}" class="group block">
                        <div class="relative aspect-square rounded-2xl overflow-hidden bg-brand-cream mb-4">
                            @if($product->primaryImage)
                                <img src="{{ asset('storage/' . $product->primaryImage->image_path) }}" alt="{{ $product->name }}"
                                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                            @else
                                <div class="w-full h-full flex items-center justify-center">
                                    <span class="text-4xl font-extrabold text-brand-grey/30">{{ strtoupper(substr($product->name, 0, 1)) }}</span>
                                </div>
                            @endif
                            <span class="absolute top-3 left-3 bg-white text-brand-black text-[11px] font-bold px-2.5 py-1 rounded-full">NEW</span>
                        </div>
                        @if($product->category)
                            <p class="text-[11px] font-semibold text-brand-grey uppercase tracking-wider mb-1">{{ $product->category->name }}</p>
                        @endif
                        <h3 class="text-sm font-semibold text-brand-black group-hover:text-brand-grey transition line-clamp-1">{{ $product->name }}</h3>
                        <div class="mt-1">
                            <span class="text-sm font-bold text-brand-black">{{ currency($product->price) }}</span>
                        </div>
                    </a>
                @endforeach
            </div>
        </div>
    </section>
    @endif

    <!-- ============================================ -->
    <!-- Trust strip                                   -->
    <!-- ============================================ -->
    <section class="border-t border-black/10 bg-brand-cream">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div class="flex items-center gap-3">
                    <svg class="w-6 h-6 text-brand-black shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0H21M3.375 14.25h6.75M21 12.75H3.375m17.25 0a1.125 1.125 0 0 0 .375-.839V6.375a1.125 1.125 0 0 0-1.125-1.125H3.375A1.125 1.125 0 0 0 2.25 6.375v5.536c0 .315.132.616.375.839" /></svg>
                    <div>
                        <p class="text-sm font-semibold text-brand-black">Free Shipping</p>
                        <p class="text-xs text-brand-grey">On orders over {{ currency(50) }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <svg class="w-6 h-6 text-brand-black shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    <div>
                        <p class="text-sm font-semibold text-brand-black">Easy Returns</p>
                        <p class="text-xs text-brand-grey">30-day return policy</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <svg class="w-6 h-6 text-brand-black shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m6 1.5a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    <div>
                        <p class="text-sm font-semibold text-brand-black">Secure Checkout</p>
                        <p class="text-xs text-brand-grey">Cash on delivery accepted</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <svg class="w-6 h-6 text-brand-black shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>
                    <div>
                        <p class="text-sm font-semibold text-brand-black">Dedicated Support</p>
                        <p class="text-xs text-brand-grey">We're here to help</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- ============================================ -->
    <!-- Newsletter                                    -->
    <!-- ============================================ -->
    <section class="bg-brand-black">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
            <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div class="text-center lg:text-left">
                    <h2 class="text-2xl font-bold text-white tracking-tight">Stay in the loop</h2>
                    <p class="mt-2 text-brand-grey">New drops, restocks, and exclusive offers — straight to your inbox.</p>
                </div>
                <form action="{{ route('newsletter.subscribe') }}" method="POST" class="flex w-full lg:w-auto max-w-md">
                    @csrf
                    <input type="email" name="email" placeholder="Your email address" required
                           class="flex-1 bg-white/10 border-white/10 rounded-l-full text-sm px-5 py-3 text-white placeholder-brand-grey focus:ring-brand-yellow focus:border-brand-yellow">
                    <button type="submit" class="bg-brand-yellow hover:bg-white text-brand-black font-semibold px-6 rounded-r-full transition text-sm">
                        Subscribe
                    </button>
                </form>
            </div>
        </div>
    </section>

</x-app-layout>

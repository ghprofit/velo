<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-900 leading-tight">
            {{ __('Shopping Cart') }}
        </h2>
    </x-slot>

    <div class="py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Success / Error Messages -->
            @if(session('success'))
                <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <div class="flex items-center">
                        <svg class="w-5 h-5 text-gray-700 me-2 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <span class="text-sm font-medium text-gray-800">{{ session('success') }}</span>
                    </div>
                </div>
            @endif

            @if(session('error'))
                <div class="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-md">
                    <div class="flex items-center">
                        <svg class="w-5 h-5 text-rose-500 me-2 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                        <span class="text-sm font-medium text-rose-800">{{ session('error') }}</span>
                    </div>
                </div>
            @endif

            @if(count($cartItems) > 0)
                <div class="bg-white rounded-md border border-gray-200 overflow-hidden">
                    <!-- Cart Table - Desktop -->
                    <div class="hidden md:block">
                        <table class="w-full">
                            <thead>
                                <tr class="bg-gray-50 border-b border-gray-200">
                                    <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Product</th>
                                    <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Price</th>
                                    <th class="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Quantity</th>
                                    <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Subtotal</th>
                                    <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 w-20"></th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                @foreach($cartItems as $item)
                                    <tr class="hover:bg-gray-50 transition-colors">
                                        <!-- Product -->
                                        <td class="px-6 py-4">
                                            <div class="flex items-center">
                                                <div class="w-16 h-16 rounded-md overflow-hidden bg-gray-100 shrink-0 me-4">
                                                    @if($item['image'])
                                                        <img src="{{ asset('storage/' . $item['image']->image_path) }}"
                                                             alt="{{ $item['product']->name }}"
                                                             class="w-full h-full object-cover">
                                                    @else
                                                        <div class="w-full h-full flex items-center justify-center">
                                                            <span class="text-lg font-bold text-gray-300">{{ strtoupper(substr($item['product']->name, 0, 1)) }}</span>
                                                        </div>
                                                    @endif
                                                </div>
                                                <div>
                                                    <a href="{{ route('shop.show', $item['product']) }}" class="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors">
                                                        {{ $item['product']->name }}
                                                    </a>
                                                    @if($item['variant_label'])
                                                        <p class="text-xs text-gray-500 mt-0.5">{{ $item['variant_label'] }}</p>
                                                    @endif
                                                </div>
                                            </div>
                                        </td>

                                        <!-- Price -->
                                        <td class="px-6 py-4">
                                            <span class="text-sm font-medium text-gray-900">{{ currency($item['price']) }}</span>
                                        </td>

                                        <!-- Quantity -->
                                        <td class="px-6 py-4">
                                            <form action="{{ route('cart.update') }}" method="POST" class="flex items-center justify-center gap-2">
                                                @csrf
                                                @method('PATCH')
                                                <input type="hidden" name="cart_key" value="{{ $item['key'] }}">
                                                <input type="number"
                                                       name="quantity"
                                                       value="{{ $item['quantity'] }}"
                                                       min="1"
                                                       max="{{ $item['max_stock'] }}"
                                                       class="w-20 text-center rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm">
                                                <button type="submit"
                                                        class="inline-flex items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition ease-in-out duration-150">
                                                    Update
                                                </button>
                                            </form>
                                        </td>

                                        <!-- Subtotal -->
                                        <td class="px-6 py-4 text-right">
                                            <span class="text-sm font-semibold text-gray-900">{{ currency($item['subtotal']) }}</span>
                                        </td>

                                        <!-- Remove -->
                                        <td class="px-6 py-4 text-right">
                                            <form action="{{ route('cart.remove') }}" method="POST">
                                                @csrf
                                                @method('DELETE')
                                                <input type="hidden" name="cart_key" value="{{ $item['key'] }}">
                                                <button type="submit"
                                                        class="inline-flex items-center p-2 text-gray-400 hover:text-rose-600 transition-colors duration-200"
                                                        title="Remove item">
                                                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>

                    <!-- Cart Cards - Mobile -->
                    <div class="md:hidden divide-y divide-gray-200">
                        @foreach($cartItems as $item)
                            <div class="p-4">
                                <div class="flex gap-4">
                                    <div class="w-20 h-20 rounded-md overflow-hidden bg-gray-100 shrink-0">
                                        @if($item['image'])
                                            <img src="{{ asset('storage/' . $item['image']->image_path) }}"
                                                 alt="{{ $item['product']->name }}"
                                                 class="w-full h-full object-cover">
                                        @else
                                            <div class="w-full h-full flex items-center justify-center">
                                                <span class="text-xl font-bold text-gray-300">{{ strtoupper(substr($item['product']->name, 0, 1)) }}</span>
                                            </div>
                                        @endif
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <a href="{{ route('shop.show', $item['product']) }}" class="text-sm font-medium text-gray-900 hover:text-gray-600">
                                            {{ $item['product']->name }}
                                        </a>
                                        @if($item['variant_label'])
                                            <p class="text-xs text-gray-500">{{ $item['variant_label'] }}</p>
                                        @endif
                                        <p class="text-sm text-gray-500 mt-1">{{ currency($item['price']) }} each</p>

                                        <div class="flex items-center justify-between mt-3">
                                            <form action="{{ route('cart.update') }}" method="POST" class="flex items-center gap-2">
                                                @csrf
                                                @method('PATCH')
                                                <input type="hidden" name="cart_key" value="{{ $item['key'] }}">
                                                <input type="number"
                                                       name="quantity"
                                                       value="{{ $item['quantity'] }}"
                                                       min="1"
                                                       max="{{ $item['max_stock'] }}"
                                                       class="w-16 text-center rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-xs">
                                                <button type="submit" class="text-xs text-gray-900 hover:text-black font-medium underline">Update</button>
                                            </form>

                                            <div class="flex items-center gap-3">
                                                <span class="text-sm font-semibold text-gray-900">{{ currency($item['subtotal']) }}</span>
                                                <form action="{{ route('cart.remove') }}" method="POST">
                                                    @csrf
                                                    @method('DELETE')
                                                    <input type="hidden" name="cart_key" value="{{ $item['key'] }}">
                                                    <button type="submit" class="text-gray-400 hover:text-rose-600 transition-colors">
                                                        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>

                    <!-- Cart Footer -->
                    <div class="bg-gray-50 border-t border-gray-200 px-6 py-6">
                        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <a href="{{ route('shop.index') }}"
                               class="inline-flex items-center text-sm font-medium text-gray-900 hover:text-black transition-colors">
                                <svg class="w-5 h-5 me-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                </svg>
                                Continue Shopping
                            </a>

                            <div class="flex items-center gap-6">
                                <div class="text-right">
                                    <p class="text-sm text-gray-500">Cart Total</p>
                                    <p class="text-2xl font-bold text-gray-900">{{ currency($total) }}</p>
                                </div>

                                <a href="{{ route('checkout.index') }}"
                                   class="inline-flex items-center px-8 py-3 bg-black border border-transparent rounded-md font-semibold text-sm text-white uppercase tracking-widest hover:bg-gray-800 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition ease-in-out duration-150">
                                    Proceed to Checkout
                                    <svg class="w-5 h-5 ms-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            @else
                <!-- Empty Cart -->
                <div class="bg-white rounded-md border border-gray-200 p-12 text-center">
                    <svg class="w-24 h-24 mx-auto text-gray-300 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                    </svg>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                    <p class="text-gray-500 mb-8 max-w-md mx-auto">Looks like you have not added any products to your cart yet. Browse our shop to find something you like.</p>
                    <a href="{{ route('shop.index') }}"
                       class="inline-flex items-center px-6 py-3 bg-black border border-transparent rounded-md font-semibold text-sm text-white uppercase tracking-widest hover:bg-gray-800 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition ease-in-out duration-150">
                        <svg class="w-5 h-5 me-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                        Start Shopping
                    </a>
                </div>
            @endif
        </div>
    </div>
</x-app-layout>

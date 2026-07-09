<x-app-layout>
    <div class="py-12">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            @php
                $isFailedPayment = $order->payment_method === 'paystack' && $order->payment_status === 'failed';
            @endphp
            <!-- Success Card -->
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <!-- Success Header -->
                @if($isFailedPayment)
                    <div class="bg-gradient-to-r from-rose-500 to-red-500 px-6 py-10 text-center">
                        <div class="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-10 h-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 class="text-2xl sm:text-3xl font-bold text-white">Payment Not Completed</h1>
                        <p class="mt-2 text-rose-100">Your order was saved, but the payment did not go through.</p>
                    </div>
                @else
                    <div class="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-10 text-center">
                        <div class="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-10 h-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        </div>
                        <h1 class="text-2xl sm:text-3xl font-bold text-white">Order Placed Successfully!</h1>
                        <p class="mt-2 text-green-100">Thank you for your purchase. Your order has been confirmed.</p>
                    </div>
                @endif

                <!-- Order Details -->
                <div class="p-6 lg:p-8">
                    <!-- Order Number -->
                    <div class="text-center mb-8 pb-6 border-b border-gray-200">
                        <p class="text-sm text-gray-500 mb-1">Order Number</p>
                        <p class="text-2xl font-bold text-gray-900">{{ $order->order_number }}</p>
                        <p class="text-sm text-gray-500 mt-2">
                            Placed on {{ $order->created_at->format('F j, Y \a\t g:i A') }}
                        </p>
                    </div>

                    <!-- Order Items -->
                    <div class="mb-8">
                        <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Order Items</h3>
                        <div class="space-y-3">
                            @foreach($order->items as $item)
                                <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                            <span class="text-sm font-semibold text-indigo-600">{{ $item->quantity }}x</span>
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium text-gray-900">{{ $item->product_name ?? ($item->product->name ?? 'Product') }}</p>
                                            <p class="text-xs text-gray-500">{{ currency($item->price) }} each</p>
                                        </div>
                                    </div>
                                    <span class="text-sm font-medium text-gray-900">{{ currency($item->price * $item->quantity) }}</span>
                                </div>
                            @endforeach
                        </div>
                    </div>

                    <!-- Order Total -->
                    <div class="bg-gray-50 rounded-lg p-4 mb-8">
                        <div class="flex justify-between items-center">
                            <span class="text-base font-semibold text-gray-900">Order Total</span>
                            <span class="text-xl font-bold text-gray-900">{{ currency($order->total) }}</span>
                        </div>
                        <div class="flex justify-between items-center mt-2">
                            <span class="text-sm text-gray-500">Payment Method</span>
                            <span class="text-sm font-medium text-gray-700">{{ $order->payment_method === 'paystack' ? 'Paystack' : 'Cash on Delivery' }}</span>
                        </div>
                        @if($order->payment_method === 'paystack')
                            <div class="flex justify-between items-center mt-2">
                                <span class="text-sm text-gray-500">Payment Status</span>
                                <span class="text-sm font-medium {{ $order->payment_status === 'paid' ? 'text-emerald-600' : ($order->payment_status === 'failed' ? 'text-rose-600' : 'text-amber-600') }}">{{ ucfirst($order->payment_status) }}</span>
                            </div>
                        @endif
                    </div>

                    <!-- Info Notice -->
                    @if($isFailedPayment)
                        <div class="p-4 bg-rose-50 border border-rose-200 rounded-lg mb-8">
                            <div class="flex items-start">
                                <svg class="w-5 h-5 text-rose-500 me-2 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                </svg>
                                <div>
                                    <p class="text-sm font-medium text-rose-800">What happens next?</p>
                                    <p class="text-sm text-rose-700 mt-1">No funds were charged. Please contact support or place a new order to try again.</p>
                                </div>
                            </div>
                        </div>
                    @else
                        <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-8">
                            <div class="flex items-start">
                                <svg class="w-5 h-5 text-blue-500 me-2 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                </svg>
                                <div>
                                    <p class="text-sm font-medium text-blue-800">What happens next?</p>
                                    <p class="text-sm text-blue-700 mt-1">We will process your order and notify you when it ships. You can track your order status from the "My Orders" page.</p>
                                </div>
                            </div>
                        </div>
                    @endif

                    <!-- Action Buttons -->
                    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                        @auth
                            <a href="{{ route('orders.show', $order) }}"
                               class="inline-flex items-center px-6 py-3 bg-indigo-600 border border-transparent rounded-lg font-semibold text-sm text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                <svg class="w-5 h-5 me-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                                View Order Details
                            </a>
                        @endauth

                        <a href="{{ route('shop.index') }}"
                           class="inline-flex items-center px-6 py-3 border-2 border-indigo-600 rounded-lg font-semibold text-sm text-indigo-600 uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all duration-200">
                            <svg class="w-5 h-5 me-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                            Continue Shopping
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>

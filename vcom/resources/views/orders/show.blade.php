<x-app-layout>
    <x-slot name="header">
        <div class="flex items-center justify-between">
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                {{ __('Order Details') }}
            </h2>
            <a href="{{ route('orders.index') }}" class="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                <svg class="w-4 h-4 me-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Back to Orders
            </a>
        </div>
    </x-slot>

    <div class="py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <!-- Order Info & Items -->
                <div class="lg:col-span-2 space-y-8">
                    <!-- Order Header Card -->
                    <div class="bg-white rounded-xl shadow-sm p-6 lg:p-8">
                        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900">Order {{ $order->order_number }}</h3>
                                <p class="text-sm text-gray-500 mt-1">Placed on {{ $order->created_at->format('F j, Y \a\t g:i A') }}</p>
                            </div>
                            @php
                                $statusClasses = match(strtolower($order->status)) {
                                    'pending' => 'bg-yellow-100 text-yellow-800 border-yellow-200',
                                    'processing' => 'bg-blue-100 text-blue-800 border-blue-200',
                                    'shipped' => 'bg-purple-100 text-purple-800 border-purple-200',
                                    'delivered', 'completed' => 'bg-green-100 text-green-800 border-green-200',
                                    'cancelled' => 'bg-red-100 text-red-800 border-red-200',
                                    default => 'bg-gray-100 text-gray-800 border-gray-200',
                                };
                            @endphp
                            <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold border {{ $statusClasses }}">
                                {{ ucfirst($order->status) }}
                            </span>
                        </div>

                        <!-- Order Status Timeline -->
                        @php
                            $statuses = ['pending', 'processing', 'shipped', 'delivered'];
                            $currentIndex = array_search(strtolower($order->status), $statuses);
                            if ($currentIndex === false) $currentIndex = -1;
                        @endphp
                        @if(strtolower($order->status) !== 'cancelled')
                            <div class="flex items-center justify-between mb-2">
                                @foreach($statuses as $index => $status)
                                    <div class="flex flex-col items-center flex-1 {{ $index < count($statuses) - 1 ? 'relative' : '' }}">
                                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                                            {{ $index <= $currentIndex ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500' }}">
                                            @if($index <= $currentIndex)
                                                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                </svg>
                                            @else
                                                {{ $index + 1 }}
                                            @endif
                                        </div>
                                        <span class="text-xs mt-1 {{ $index <= $currentIndex ? 'text-indigo-600 font-medium' : 'text-gray-400' }}">
                                            {{ ucfirst($status) }}
                                        </span>
                                    </div>
                                    @if($index < count($statuses) - 1)
                                        <div class="flex-1 h-0.5 {{ $index < $currentIndex ? 'bg-indigo-600' : 'bg-gray-200' }} mx-2 mb-5"></div>
                                    @endif
                                @endforeach
                            </div>
                        @endif
                    </div>

                    <!-- Order Items Table -->
                    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">Order Items</h3>
                        </div>

                        <!-- Desktop Table -->
                        <div class="hidden sm:block">
                            <table class="w-full">
                                <thead>
                                    <tr class="bg-gray-50 border-b border-gray-200">
                                        <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Product</th>
                                        <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Price</th>
                                        <th class="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Qty</th>
                                        <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Total</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    @foreach($order->items as $item)
                                        <tr>
                                            <td class="px-6 py-4">
                                                <div class="flex items-center">
                                                    <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 me-3">
                                                        @if($item->product && $item->product->images && $item->product->images->count() > 0)
                                                            <img src="{{ asset('storage/' . $item->product->images->first()->image_path) }}"
                                                                 alt="{{ $item->product_name ?? $item->product->name }}"
                                                                 class="w-full h-full object-cover">
                                                        @else
                                                            <div class="w-full h-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                                                                <span class="text-sm font-bold text-indigo-300">{{ strtoupper(substr($item->product_name ?? ($item->product->name ?? 'P'), 0, 1)) }}</span>
                                                            </div>
                                                        @endif
                                                    </div>
                                                    <div>
                                                        <p class="text-sm font-medium text-gray-900">{{ $item->product_name ?? ($item->product->name ?? 'Product') }}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 text-right">
                                                <span class="text-sm text-gray-600">{{ currency($item->price) }}</span>
                                            </td>
                                            <td class="px-6 py-4 text-center">
                                                <span class="text-sm text-gray-600">{{ $item->quantity }}</span>
                                            </td>
                                            <td class="px-6 py-4 text-right">
                                                <span class="text-sm font-semibold text-gray-900">{{ currency($item->price * $item->quantity) }}</span>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                                <tfoot>
                                    <tr class="bg-gray-50 border-t border-gray-200">
                                        <td colspan="3" class="px-6 py-4 text-right">
                                            <span class="text-sm font-semibold text-gray-900">Order Total</span>
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            <span class="text-lg font-bold text-gray-900">{{ currency($order->total) }}</span>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <!-- Mobile Cards -->
                        <div class="sm:hidden divide-y divide-gray-200">
                            @foreach($order->items as $item)
                                <div class="p-4 flex items-center gap-3">
                                    <div class="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                        @if($item->product && $item->product->images && $item->product->images->count() > 0)
                                            <img src="{{ asset('storage/' . $item->product->images->first()->image_path) }}"
                                                 alt="{{ $item->product_name ?? $item->product->name }}"
                                                 class="w-full h-full object-cover">
                                        @else
                                            <div class="w-full h-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                                                <span class="text-lg font-bold text-indigo-300">{{ strtoupper(substr($item->product_name ?? ($item->product->name ?? 'P'), 0, 1)) }}</span>
                                            </div>
                                        @endif
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium text-gray-900 truncate">{{ $item->product_name ?? ($item->product->name ?? 'Product') }}</p>
                                        <p class="text-xs text-gray-500">{{ currency($item->price) }} x {{ $item->quantity }}</p>
                                    </div>
                                    <span class="text-sm font-semibold text-gray-900">{{ currency($item->price * $item->quantity) }}</span>
                                </div>
                            @endforeach
                            <div class="p-4 bg-gray-50 flex justify-between items-center">
                                <span class="text-sm font-semibold text-gray-900">Order Total</span>
                                <span class="text-lg font-bold text-gray-900">{{ currency($order->total) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sidebar - Shipping & Payment Info -->
                <div class="lg:col-span-1 space-y-8">
                    <!-- Shipping Info -->
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                            <svg class="w-4 h-4 me-2 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                            </svg>
                            Shipping Address
                        </h3>
                        <div class="space-y-2 text-sm text-gray-600">
                            <p class="font-medium text-gray-900">{{ $order->shipping_name ?? $order->name ?? 'N/A' }}</p>
                            @if($order->shipping_email ?? $order->email ?? null)
                                <p>{{ $order->shipping_email ?? $order->email }}</p>
                            @endif
                            @if($order->shipping_phone ?? $order->phone ?? null)
                                <p>{{ $order->shipping_phone ?? $order->phone }}</p>
                            @endif
                            @if($order->shipping_address ?? $order->address ?? null)
                                <p>{{ $order->shipping_address ?? $order->address }}</p>
                            @endif
                            <p>
                                @if($order->shipping_city ?? $order->city ?? null)
                                    {{ $order->shipping_city ?? $order->city }},
                                @endif
                                @if($order->shipping_state ?? $order->state ?? null)
                                    {{ $order->shipping_state ?? $order->state }}
                                @endif
                                @if($order->shipping_zip ?? $order->zip ?? null)
                                    {{ $order->shipping_zip ?? $order->zip }}
                                @endif
                            </p>
                        </div>
                    </div>

                    <!-- Payment Info -->
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                            <svg class="w-4 h-4 me-2 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                            </svg>
                            Payment Information
                        </h3>
                        <div class="space-y-3">
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">Method</span>
                                <span class="font-medium text-gray-900">{{ ucfirst($order->payment_method ?? 'Cash on Delivery') }}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">Payment Status</span>
                                @php
                                    $paymentStatus = $order->payment_status ?? 'pending';
                                    $paymentClasses = match(strtolower($paymentStatus)) {
                                        'paid', 'completed' => 'text-green-700 bg-green-50',
                                        'pending' => 'text-yellow-700 bg-yellow-50',
                                        'failed' => 'text-red-700 bg-red-50',
                                        default => 'text-gray-700 bg-gray-50',
                                    };
                                @endphp
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium {{ $paymentClasses }}">
                                    {{ ucfirst($paymentStatus) }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Order Summary -->
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                            <svg class="w-4 h-4 me-2 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                            </svg>
                            Order Summary
                        </h3>
                        <div class="space-y-3">
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">Items ({{ $order->items->sum('quantity') }})</span>
                                <span class="font-medium text-gray-900">{{ currency($order->total) }}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">Shipping</span>
                                <span class="font-medium text-green-600">Free</span>
                            </div>
                            <div class="border-t border-gray-200 pt-3 flex justify-between">
                                <span class="text-base font-semibold text-gray-900">Total</span>
                                <span class="text-xl font-bold text-gray-900">{{ currency($order->total) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Order Notes -->
                    @if($order->notes)
                        <div class="bg-white rounded-xl shadow-sm p-6">
                            <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                                <svg class="w-4 h-4 me-2 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                                </svg>
                                Order Notes
                            </h3>
                            <p class="text-sm text-gray-600">{{ $order->notes }}</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</x-app-layout>

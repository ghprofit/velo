<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Checkout') }}
        </h2>
    </x-slot>

    <div class="py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Payment / Order Errors -->
            @if(session('error'))
                <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div class="flex items-start">
                        <svg class="w-5 h-5 text-red-500 me-2 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                        <p class="text-sm font-medium text-red-800">{{ session('error') }}</p>
                    </div>
                </div>
            @endif

            <!-- Validation Errors -->
            @if($errors->any())
                <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div class="flex items-start">
                        <svg class="w-5 h-5 text-red-500 me-2 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                        <div>
                            <h3 class="text-sm font-medium text-red-800">Please correct the following errors:</h3>
                            <ul class="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                                @foreach($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                </div>
            @endif

            <form action="{{ route('checkout.store') }}" method="POST">
                @csrf

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Shipping Information -->
                    <div class="lg:col-span-2">
                        <div class="bg-white rounded-md border border-gray-200 p-6 lg:p-8">
                            <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                <svg class="w-5 h-5 me-2 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                </svg>
                                Shipping Information
                            </h3>

                            @if(isset($savedAddresses) && $savedAddresses->count() > 0)
                                <div class="mb-6" x-data="{ useExisting: false }">
                                    <div class="flex items-center justify-between mb-4">
                                        <label class="text-sm font-medium text-gray-700">Delivery Address</label>
                                        <button type="button" 
                                                @click="useExisting = !useExisting"
                                                class="text-sm font-medium text-black hover:text-gray-700">
                                            <span x-show="!useExisting">Use Saved Address</span>
                                            <span x-show="useExisting">Enter New Address</span>
                                        </button>
                                    </div>

                                    <!-- Saved Addresses Selector -->
                                    <div x-show="useExisting" class="mb-6">
                                        <select onchange="fillAddress(this.value)" 
                                                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm">
                                            <option value="">Select a saved address...</option>
                                            @foreach($savedAddresses as $address)
                                                <option value='{{ json_encode([
                                                    "name" => $address->name,
                                                    "email" => $address->email,
                                                    "phone" => $address->phone,
                                                    "address" => $address->address,
                                                    "city" => $address->city,
                                                    "state" => $address->state,
                                                    "zip" => $address->zip
                                                ]) }}'>
                                                    {{ $address->name }} - {{ $address->address }}, {{ $address->city }}
                                                    @if($address->is_default) <span class="text-green-600">(Default)</span> @endif
                                                </option>
                                            @endforeach
                                        </select>
                                    </div>
                                </div>
                            @endif

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <!-- Full Name -->
                                <div class="sm:col-span-2">
                                    <label for="shipping_name" class="block text-sm font-medium text-gray-700 mb-1">Full Name <span class="text-red-500">*</span></label>
                                    <input type="text"
                                           name="shipping_name"
                                           id="shipping_name"
                                           value="{{ old('shipping_name', auth()->user()->name ?? '') }}"
                                           required
                                           class="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm"
                                           placeholder="Enter your full name">
                                    @error('shipping_name')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>

                                <!-- Email -->
                                <div>
                                    <label for="shipping_email" class="block text-sm font-medium text-gray-700 mb-1">Email Address <span class="text-red-500">*</span></label>
                                    <input type="email"
                                           name="shipping_email"
                                           id="shipping_email"
                                           value="{{ old('shipping_email', auth()->user()->email ?? '') }}"
                                           required
                                           class="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm"
                                           placeholder="your@email.com">
                                    @error('shipping_email')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>

                                <!-- Phone -->
                                <div>
                                    <label for="shipping_phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number <span class="text-red-500">*</span></label>
                                    <input type="tel"
                                           name="shipping_phone"
                                           id="shipping_phone"
                                           value="{{ old('shipping_phone') }}"
                                           required
                                           class="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm"
                                           placeholder="Your phone number">
                                    @error('shipping_phone')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>

                                <!-- Address -->
                                <div class="sm:col-span-2">
                                    <label for="shipping_address" class="block text-sm font-medium text-gray-700 mb-1">Street Address <span class="text-red-500">*</span></label>
                                    <input type="text"
                                           name="shipping_address"
                                           id="shipping_address"
                                           value="{{ old('shipping_address') }}"
                                           required
                                           class="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm"
                                           placeholder="Street address, apartment, suite, etc.">
                                    @error('shipping_address')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>

                                <!-- City -->
                                <div>
                                    <label for="shipping_city" class="block text-sm font-medium text-gray-700 mb-1">City <span class="text-red-500">*</span></label>
                                    <input type="text"
                                           name="shipping_city"
                                           id="shipping_city"
                                           value="{{ old('shipping_city') }}"
                                           required
                                           class="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm"
                                           placeholder="City">
                                    @error('shipping_city')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>

                                <!-- State -->
                                <div>
                                    <label for="shipping_state" class="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                                    <input type="text"
                                           name="shipping_state"
                                           id="shipping_state"
                                           value="{{ old('shipping_state') }}"
                                           class="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm"
                                           placeholder="State">
                                    @error('shipping_state')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>

                                <!-- ZIP Code -->
                                <div>
                                    <label for="shipping_zip" class="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code <span class="text-red-500">*</span></label>
                                    <input type="text"
                                           name="shipping_zip"
                                           id="shipping_zip"
                                           value="{{ old('shipping_zip') }}"
                                           required
                                           class="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm"
                                           placeholder="ZIP code">
                                    @error('shipping_zip')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>

                                <!-- Notes -->
                                <div class="sm:col-span-2">
                                    <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Order Notes <span class="text-gray-400 font-normal">(optional)</span></label>
                                    <textarea name="notes"
                                              id="notes"
                                              rows="3"
                                              class="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm"
                                              placeholder="Any special instructions for your order...">{{ old('notes') }}</textarea>
                                    @error('notes')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>

                                <!-- Save Address -->
                                <div class="sm:col-span-2">
                                    <label class="flex items-center">
                                        <input type="checkbox" 
                                               name="save_address" 
                                               value="1"
                                               {{ old('save_address') ? 'checked' : '' }}
                                               class="rounded border-gray-300 text-black shadow-sm focus:ring-black">
                                        <span class="ml-2 text-sm text-gray-700">Save this address for future orders</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Order Summary Sidebar -->
                    <div class="lg:col-span-1" x-data="{ selectedPayment: '{{ old('payment_method', $defaultPaymentMethod ?? 'cod') }}' }">
                        <div class="bg-white rounded-xl shadow-sm p-6 lg:p-8 sticky top-8">
                            <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                <svg class="w-5 h-5 me-2 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                                </svg>
                                Order Summary
                            </h3>

                            <!-- Items List -->
                            <div class="space-y-4 mb-6">
                                @foreach($cartItems as $item)
                                    <div class="flex items-center gap-3">
                                        <div class="w-12 h-12 rounded-md overflow-hidden bg-gray-100 shrink-0">
                                            @if($item['image'])
                                                <img src="{{ asset('storage/' . $item['image']->image_path) }}"
                                                     alt="{{ $item['product']->name }}"
                                                     class="w-full h-full object-cover">
                                            @else
                                                <div class="w-full h-full flex items-center justify-center">
                                                    <span class="text-sm font-bold text-gray-300">{{ strtoupper(substr($item['product']->name, 0, 1)) }}</span>
                                                </div>
                                            @endif
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-sm font-medium text-gray-900 truncate">{{ $item['product']->name }}</p>
                                            @if($item['variant_label'])
                                                <p class="text-xs text-gray-500">{{ $item['variant_label'] }} · Qty: {{ $item['quantity'] }}</p>
                                            @else
                                                <p class="text-xs text-gray-500">Qty: {{ $item['quantity'] }}</p>
                                            @endif
                                        </div>
                                        <span class="text-sm font-medium text-gray-900 shrink-0">{{ currency($item['subtotal']) }}</span>
                                    </div>
                                @endforeach
                            </div>

                            <!-- Totals -->
                            <div class="border-t border-gray-200 pt-4 space-y-3" 
                                 x-data="{
                                     subtotal: {{ $subtotal }},
                                     selectedShippingId: '{{ old('shipping_method_id', $shippingMethods->first()->id ?? '') }}',
                                     shippingMethods: {{ $shippingMethods->map(function($m) { return ['id' => $m->id, 'cost' => (float) $m->cost, 'name' => $m->name]; })->toJson() }},
                                     get shippingFee() {
                                         const method = this.shippingMethods.find(m => m.id == this.selectedShippingId);
                                         return method ? method.cost : 0;
                                     },
                                     get shippingName() {
                                         const method = this.shippingMethods.find(m => m.id == this.selectedShippingId);
                                         return method ? method.name : 'Select shipping';
                                     },
                                     get total() {
                                         return this.subtotal + this.shippingFee;
                                     },
                                     formatCurrency(amount) {
                                         return '{{ currencySymbol() }}' + amount.toFixed(2);
                                     }
                                 }" 
                                 @shipping-changed.window="selectedShippingId = $event.detail.shippingId">
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-500">Subtotal</span>
                                    <span class="font-medium text-gray-900" x-text="formatCurrency(subtotal)">{{ currency($subtotal) }}</span>
                                </div>
                                
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-500">Shipping</span>
                                    <span class="font-medium text-gray-900" x-text="formatCurrency(shippingFee)">{{ currency(0) }}</span>
                                </div>
                                <div class="text-xs text-gray-500 pl-3" x-show="shippingFee > 0">
                                    <svg class="w-3 h-3 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                    </svg>
                                    <span x-text="shippingName"></span>
                                </div>
                                
                                <div class="border-t border-gray-200 pt-3 flex justify-between">
                                    <span class="text-base font-semibold text-gray-900">Total</span>
                                    <span class="text-xl font-bold text-gray-900" x-text="formatCurrency(total)">{{ currency($subtotal) }}</span>
                                </div>
                            </div>

                            <!-- Shipping Method -->
                            <div class="mt-6">
                                <h4 class="text-sm font-semibold text-gray-900 mb-3">Shipping Method <span class="text-red-500">*</span></h4>
                                
                                @if($shippingMethods->count() > 0)
                                    <div class="space-y-3" x-data="{ selectedShipping: '{{ old('shipping_method_id', $shippingMethods->first()->id) }}' }">
                                        @foreach($shippingMethods as $method)
                                            <label class="relative flex items-start p-4 border rounded-lg cursor-pointer transition-all"
                                                   :class="selectedShipping == '{{ $method->id }}' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300 bg-white'">
                                                <input type="radio"
                                                       name="shipping_method_id"
                                                       value="{{ $method->id }}"
                                                       x-model="selectedShipping"
                                                       @change="$dispatch('shipping-changed', { shippingId: selectedShipping })"
                                                       {{ old('shipping_method_id', $shippingMethods->first()->id) == $method->id ? 'checked' : '' }}
                                                       class="mt-0.5 h-4 w-4 text-black border-gray-300 focus:ring-black">
                                                <div class="ml-3 flex-1">
                                                    <div class="flex items-center justify-between">
                                                        <span class="text-sm font-medium text-gray-900">{{ $method->name }}</span>
                                                        <span class="text-sm font-semibold text-gray-900">{{ currency($method->cost) }}</span>
                                                    </div>
                                                    @if($method->description)
                                                        <p class="mt-1 text-xs text-gray-500">{{ $method->description }}</p>
                                                    @endif
                                                </div>
                                            </label>
                                        @endforeach
                                    </div>
                                    @error('shipping_method_id')
                                        <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                @else
                                    <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p class="text-sm text-yellow-800">No shipping methods are currently available. Please contact support.</p>
                                    </div>
                                @endif
                            </div>

                            <!-- Payment Method -->
                            <div class="mt-6">
                                <h4 class="text-sm font-semibold text-gray-900 mb-3">Payment Method <span class="text-red-500">*</span></h4>
                                <div class="space-y-3">
                                    @php
                                        $codEnabled = App\Models\Setting::get('payment_method_cod', '1') == '1';
                                        $paystackEnabled = App\Models\Setting::get('payment_method_paystack', '1') == '1';
                                    @endphp

                                    @if($codEnabled)
                                    <!-- Cash on Delivery -->
                                    <label class="relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all"
                                           :class="selectedPayment === 'cod' ? 'border-black bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'">
                                        <input type="radio"
                                               name="payment_method"
                                               value="cod"
                                               x-model="selectedPayment"
                                               class="h-4 w-4 mt-0.5 text-black focus:ring-black"
                                               {{ old('payment_method', $defaultPaymentMethod ?? '') === 'cod' ? 'checked' : '' }}>
                                        <div class="ml-3 flex-1">
                                            <div class="flex items-center">
                                                <svg class="w-5 h-5 mr-2" :class="selectedPayment === 'cod' ? 'text-amber-600' : 'text-gray-400'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                                                </svg>
                                                <span class="text-sm font-medium" :class="selectedPayment === 'cod' ? 'text-gray-900' : 'text-gray-700'">Cash on Delivery</span>
                                            </div>
                                            <p class="mt-1 text-xs text-gray-500">Pay when your order arrives at your doorstep.</p>
                                        </div>
                                    </label>
                                    @endif

                                    @if($paystackEnabled)
                                    <!-- Paystack Payment (Mobile Money, Bank Transfer, Card) -->
                                    <label class="relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all"
                                           :class="selectedPayment === 'paystack' ? 'border-black bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'">
                                        <input type="radio"
                                               name="payment_method"
                                               value="paystack"
                                               x-model="selectedPayment"
                                               class="h-4 w-4 mt-0.5 text-black focus:ring-black"
                                               {{ old('payment_method', $defaultPaymentMethod ?? '') === 'paystack' ? 'checked' : '' }}>
                                        <div class="ml-3 flex-1">
                                            <div class="flex items-center">
                                                <svg class="w-5 h-5 mr-2" :class="selectedPayment === 'paystack' ? 'text-black' : 'text-gray-400'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                                                </svg>
                                                <span class="text-sm font-medium" :class="selectedPayment === 'paystack' ? 'text-gray-900' : 'text-gray-700'">Pay with Paystack</span>
                                            </div>
                                            <p class="mt-1 text-xs text-gray-500">Mobile Money, Bank Transfer, or Credit/Debit Card</p>
                                        </div>
                                    </label>
                                    @endif

                                    @if(!$codEnabled && !$paystackEnabled)
                                    <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p class="text-sm text-yellow-800">No payment methods are currently available. Please contact support.</p>
                                    </div>
                                    @endif

                                    @error('payment_method')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>
                            </div>

                            <!-- Place Order Button -->
                            <button type="submit"
                                    class="mt-6 w-full inline-flex items-center justify-center px-6 py-3.5 bg-black border border-transparent rounded-md font-semibold text-sm text-white uppercase tracking-widest hover:bg-gray-800 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition ease-in-out duration-150">
                                <svg class="w-5 h-5 me-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <span x-text="selectedPayment === 'paystack' ? 'Continue to Payment' : 'Place Order (Cash on Delivery)'">Place Order</span>
                            </button>

                            <!-- Back to Cart -->
                            <div class="mt-4 text-center">
                                <a href="{{ route('cart.index') }}" class="text-sm text-black hover:text-gray-700 font-medium transition-colors">
                                    &larr; Back to Cart
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <script>
        function fillAddress(jsonData) {
            if (!jsonData) return;
            
            const data = JSON.parse(jsonData);
            
            document.getElementById('shipping_name').value = data.name || '';
            document.getElementById('shipping_email').value = data.email || '';
            document.getElementById('shipping_phone').value = data.phone || '';
            document.getElementById('shipping_address').value = data.address || '';
            document.getElementById('shipping_city').value = data.city || '';
            document.getElementById('shipping_state').value = data.state || '';
            document.getElementById('shipping_zip').value = data.zip || '';
        }
    </script>
</x-app-layout>

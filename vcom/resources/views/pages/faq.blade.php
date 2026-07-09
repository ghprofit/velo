<x-app-layout>
<div class="bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
            <p class="text-gray-600 mb-8">Find answers to common questions about our products and services.</p>
            
            <div class="space-y-6" x-data="{ openFaq: null }">
                <!-- FAQ Item 1 -->
                <div class="border-b border-gray-200 pb-6">
                    <button @click="openFaq = openFaq === 1 ? null : 1" 
                            class="w-full flex items-center justify-between text-left">
                        <h3 class="text-lg font-semibold text-gray-900">How do I place an order?</h3>
                        <svg class="w-5 h-5 text-gray-500 transition-transform" 
                             :class="{ 'rotate-180': openFaq === 1 }"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>
                    <div x-show="openFaq === 1" x-collapse class="mt-3 text-gray-700">
                        <p>Browse our products, add items to your cart, and proceed to checkout. You'll need to create an account 
                        or log in, then provide your delivery information and choose a payment method.</p>
                    </div>
                </div>

                <!-- FAQ Item 2 -->
                <div class="border-b border-gray-200 pb-6">
                    <button @click="openFaq = openFaq === 2 ? null : 2" 
                            class="w-full flex items-center justify-between text-left">
                        <h3 class="text-lg font-semibold text-gray-900">What payment methods do you accept?</h3>
                        <svg class="w-5 h-5 text-gray-500 transition-transform" 
                             :class="{ 'rotate-180': openFaq === 2 }"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>
                    <div x-show="openFaq === 2" x-collapse class="mt-3 text-gray-700">
                        <p>We accept cash on delivery (COD), mobile money, credit/debit cards (Visa, Mastercard), and PayPal.</p>
                    </div>
                </div>

                <!-- FAQ Item 3 -->
                <div class="border-b border-gray-200 pb-6">
                    <button @click="openFaq = openFaq === 3 ? null : 3" 
                            class="w-full flex items-center justify-between text-left">
                        <h3 class="text-lg font-semibold text-gray-900">How long does delivery take?</h3>
                        <svg class="w-5 h-5 text-gray-500 transition-transform" 
                             :class="{ 'rotate-180': openFaq === 3 }"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>
                    <div x-show="openFaq === 3" x-collapse class="mt-3 text-gray-700">
                        <p>Standard delivery takes 3-5 business days. Express delivery (1-2 days) is available in major cities. 
                        Same-day delivery is available in Accra and Kumasi for orders placed before 12 PM.</p>
                    </div>
                </div>

                <!-- FAQ Item 4 -->
                <div class="border-b border-gray-200 pb-6">
                    <button @click="openFaq = openFaq === 4 ? null : 4" 
                            class="w-full flex items-center justify-between text-left">
                        <h3 class="text-lg font-semibold text-gray-900">Do you offer free shipping?</h3>
                        <svg class="w-5 h-5 text-gray-500 transition-transform" 
                             :class="{ 'rotate-180': openFaq === 4 }"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>
                    <div x-show="openFaq === 4" x-collapse class="mt-3 text-gray-700">
                        <p>Yes! We offer free shipping on orders over GHS 200. For orders below this amount, standard shipping rates apply.</p>
                    </div>
                </div>

                <!-- FAQ Item 5 -->
                <div class="border-b border-gray-200 pb-6">
                    <button @click="openFaq = openFaq === 5 ? null : 5" 
                            class="w-full flex items-center justify-between text-left">
                        <h3 class="text-lg font-semibold text-gray-900">Can I track my order?</h3>
                        <svg class="w-5 h-5 text-gray-500 transition-transform" 
                             :class="{ 'rotate-180': openFaq === 5 }"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>
                    <div x-show="openFaq === 5" x-collapse class="mt-3 text-gray-700">
                        <p>Yes, once your order is shipped, you'll receive a tracking number via email and SMS. 
                        You can also track your order in your account dashboard under "My Orders".</p>
                    </div>
                </div>

                <!-- FAQ Item 6 -->
                <div class="border-b border-gray-200 pb-6">
                    <button @click="openFaq = openFaq === 6 ? null : 6" 
                            class="w-full flex items-center justify-between text-left">
                        <h3 class="text-lg font-semibold text-gray-900">What is your return policy?</h3>
                        <svg class="w-5 h-5 text-gray-500 transition-transform" 
                             :class="{ 'rotate-180': openFaq === 6 }"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>
                    <div x-show="openFaq === 6" x-collapse class="mt-3 text-gray-700">
                        <p>Items can be returned within 14 days of delivery if they are unused, in original packaging, 
                        and in the same condition as received. See our Returns & Refunds page for full details.</p>
                    </div>
                </div>

                <!-- FAQ Item 7 -->
                <div class="border-b border-gray-200 pb-6">
                    <button @click="openFaq = openFaq === 7 ? null : 7" 
                            class="w-full flex items-center justify-between text-left">
                        <h3 class="text-lg font-semibold text-gray-900">Do you offer bulk discounts?</h3>
                        <svg class="w-5 h-5 text-gray-500 transition-transform" 
                             :class="{ 'rotate-180': openFaq === 7 }"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>
                    <div x-show="openFaq === 7" x-collapse class="mt-3 text-gray-700">
                        <p>Yes, we offer special pricing for bulk orders. Contact us at hello@stryd.com 
                        with your requirements and we'll provide a custom quote.</p>
                    </div>
                </div>

                <!-- FAQ Item 8 -->
                <div class="border-b border-gray-200 pb-6">
                    <button @click="openFaq = openFaq === 8 ? null : 8" 
                            class="w-full flex items-center justify-between text-left">
                        <h3 class="text-lg font-semibold text-gray-900">How do I contact customer support?</h3>
                        <svg class="w-5 h-5 text-gray-500 transition-transform" 
                             :class="{ 'rotate-180': openFaq === 8 }"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>
                    <div x-show="openFaq === 8" x-collapse class="mt-3 text-gray-700">
                        <p>You can reach us via email at hello@stryd.com, call (555) 123-4567, 
                        or use our contact form. We're available Monday-Friday, 8AM-6PM.</p>
                    </div>
                </div>

                <!-- FAQ Item 9 -->
                <div class="border-b border-gray-200 pb-6">
                    <button @click="openFaq = openFaq === 9 ? null : 9" 
                            class="w-full flex items-center justify-between text-left">
                        <h3 class="text-lg font-semibold text-gray-900">Are your products environmentally friendly?</h3>
                        <svg class="w-5 h-5 text-gray-500 transition-transform" 
                             :class="{ 'rotate-180': openFaq === 9 }"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>
                    <div x-show="openFaq === 9" x-collapse class="mt-3 text-gray-700">
                        <p>We carry a range of eco-friendly cleaning products. Look for the "Eco-Friendly" badge on product listings. 
                        We're committed to offering sustainable options wherever possible.</p>
                    </div>
                </div>

                <!-- FAQ Item 10 -->
                <div class="pb-6">
                    <button @click="openFaq = openFaq === 10 ? null : 10" 
                            class="w-full flex items-center justify-between text-left">
                        <h3 class="text-lg font-semibold text-gray-900">Can I cancel or modify my order?</h3>
                        <svg class="w-5 h-5 text-gray-500 transition-transform" 
                             :class="{ 'rotate-180': openFaq === 10 }"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>
                    <div x-show="openFaq === 10" x-collapse class="mt-3 text-gray-700">
                        <p>Orders can be cancelled or modified within 2 hours of placement. After that, the order enters processing 
                        and cannot be changed. Contact us immediately if you need to make changes.</p>
                    </div>
                </div>
            </div>

            <div class="mt-10 bg-gray-50 rounded-lg p-6 text-center">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Still have questions?</h3>
                <p class="text-gray-600 mb-4">Can't find the answer you're looking for? Our customer service team is here to help.</p>
                <a href="{{ route('contact') }}" 
                   class="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-lg transition">
                    Contact Us
                </a>
            </div>
        </div>
    </div>
</div>
</x-app-layout>

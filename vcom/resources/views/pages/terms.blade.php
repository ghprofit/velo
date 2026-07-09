<x-app-layout>
<div class="bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>
            
            <div class="prose prose-gray max-w-none text-gray-700 space-y-6">
                <p class="text-sm text-gray-500">Last updated: {{ date('F d, Y') }}</p>

                <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Agreement to Terms</h2>
                <p>
                    By accessing and using {{ $siteName ?? 'STRYD' }}'s website and services, you agree to be bound by these Terms and Conditions. 
                    If you do not agree with any part of these terms, you must not use our services.
                </p>

                <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Use of Service</h2>
                <p>
                    You must be at least 18 years old to make purchases on our platform. You agree to provide accurate, current, 
                    and complete information during the registration and ordering process.
                </p>

                <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Products and Pricing</h2>
                <p>
                    All products are subject to availability. Prices are displayed in Ghana Cedis (GHS) and may change without notice. 
                    We reserve the right to limit quantities on any product.
                </p>

                <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Orders and Payment</h2>
                <p>
                    All orders are subject to acceptance and availability. We accept various payment methods including cash on delivery, 
                    mobile money, and card payments. Payment must be made in full before shipment of products.
                </p>

                <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Intellectual Property</h2>
                <p>
                    All content on this website, including text, images, logos, and product descriptions, is the property of 
                    {{ $siteName ?? 'STRYD' }} and is protected by copyright laws.
                </p>

                <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Limitation of Liability</h2>
                <p>
                    {{ $siteName ?? 'STRYD' }} shall not be liable for any indirect, incidental, or consequential damages arising from 
                    the use of our products or services.
                </p>

                <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Contact Us</h2>
                <p>
                    If you have any questions about these Terms & Conditions, please contact us at hello@stryd.com
                </p>
            </div>
        </div>
    </div>
</div>
</x-app-layout>

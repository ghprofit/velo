<x-app-layout>
<div class="bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-md border border-gray-200 p-8 md:p-12">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">About {{ $siteName ?? 'STRYD' }}</h1>

            <div class="prose prose-gray max-w-none">
                <p class="text-lg text-gray-700 mb-6">
                    Welcome to {{ $siteName ?? 'STRYD' }}, your trusted destination for sneakers and footwear in Ghana.
                    We specialize in bringing you quality shoes for men, women, kids, and sport.
                </p>

                <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Mission</h2>
                <p class="text-gray-700 mb-6">
                    To make it simple to find the right pair — comfortable, stylish, and built to last —
                    whether you're heading to the gym, the office, or the street.
                </p>

                <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Why Choose Us?</h2>
                <ul class="list-disc list-inside space-y-2 text-gray-700 mb-6">
                    <li>Wide selection of sneakers across every size and style</li>
                    <li>Competitive pricing and seasonal deals</li>
                    <li>Fast and reliable delivery across Ghana</li>
                    <li>Expert customer support and sizing guidance</li>
                    <li>Quality guaranteed products from trusted brands</li>
                </ul>

                <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Values</h2>
                <p class="text-gray-700 mb-4">
                    <strong>Quality:</strong> We source only the best products that meet international standards.
                </p>
                <p class="text-gray-700 mb-4">
                    <strong>Customer Service:</strong> Your satisfaction is our top priority. We're here to help every step of the way.
                </p>
                <p class="text-gray-700 mb-4">
                    <strong>Reliability:</strong> Count on us for consistent quality and timely delivery.
                </p>
            </div>
        </div>
    </div>
</div>
</x-app-layout>

<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\ExternalCheckoutController;
use Illuminate\Support\Facades\Route;

// Storefront
Route::get('/', [HomeController::class, 'index'])->name('home');

// External checkout return landing (browser redirect target after Paystack payment
// for a hosted checkout initiated by an external client, e.g. the GhProfit server)
Route::get('/pay/{reference}/return', [ExternalCheckoutController::class, 'returnPage'])->name('external-checkout.return');
Route::get('/shop', [ShopController::class, 'index'])->name('shop.index');
Route::get('/shop/{product:slug}', [ShopController::class, 'show'])->name('shop.show');

// Contact & Newsletter
Route::get('/contact', [ContactController::class, 'index'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe'])->name('newsletter.subscribe');
Route::get('/newsletter/unsubscribe/{token}', [NewsletterController::class, 'unsubscribe'])->name('newsletter.unsubscribe');
Route::post('/newsletter/unsubscribe/{token}', [NewsletterController::class, 'confirmUnsubscribe'])->name('newsletter.confirm-unsubscribe');

// Static Pages
Route::get('/about', [PageController::class, 'about'])->name('pages.about');
Route::get('/terms', [PageController::class, 'terms'])->name('pages.terms');
Route::get('/privacy', [PageController::class, 'privacy'])->name('pages.privacy');
Route::get('/shipping', [PageController::class, 'shipping'])->name('pages.shipping');
Route::get('/returns', [PageController::class, 'returns'])->name('pages.returns');
Route::get('/faq', [PageController::class, 'faq'])->name('pages.faq');

// Cart (no auth required)
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
Route::patch('/cart/update', [CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/remove', [CartController::class, 'remove'])->name('cart.remove');

// Checkout & Orders (auth required)
Route::middleware('auth')->group(function () {
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
    Route::get('/checkout/success/{order}', [CheckoutController::class, 'success'])->name('checkout.success');
    Route::get('/checkout/cancelled/{order}', [CheckoutController::class, 'cancelled'])->name('checkout.cancelled');

    Route::get('/my-orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/my-orders/{order}', [OrderController::class, 'show'])->name('orders.show');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Wishlist
    Route::get('/wishlist', [App\Http\Controllers\WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/wishlist/toggle/{product}', [App\Http\Controllers\WishlistController::class, 'toggle'])->name('wishlist.toggle');
    Route::delete('/wishlist/{wishlist}', [App\Http\Controllers\WishlistController::class, 'destroy'])->name('wishlist.destroy');

    // Reviews
    Route::post('/products/{product}/reviews', [App\Http\Controllers\ReviewController::class, 'store'])->name('reviews.store');
    Route::delete('/reviews/{review}', [App\Http\Controllers\ReviewController::class, 'destroy'])->name('reviews.destroy');
});

// Admin Panel
Route::middleware(['auth', 'is_admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    Route::resource('categories', AdminCategoryController::class)->except('show');
    Route::resource('products', AdminProductController::class)->except('show');
    Route::delete('products/image/{image}', [AdminProductController::class, 'deleteImage'])->name('products.image.delete');
    Route::patch('products/image/{image}/set-primary', [AdminProductController::class, 'setPrimaryImage'])->name('products.image.set-primary');
    Route::patch('products/image/{image}/assign-color', [App\Http\Controllers\Admin\ProductVariantController::class, 'assignImageColor'])->name('products.image.assign-color');

    // Product Colors & Size Variants
    Route::post('products/{product}/colors', [App\Http\Controllers\Admin\ProductVariantController::class, 'storeColor'])->name('products.colors.store');
    Route::delete('products/colors/{color}', [App\Http\Controllers\Admin\ProductVariantController::class, 'destroyColor'])->name('products.colors.destroy');
    Route::post('products/{product}/variants', [App\Http\Controllers\Admin\ProductVariantController::class, 'storeVariant'])->name('products.variants.store');
    Route::patch('products/variants/{variant}', [App\Http\Controllers\Admin\ProductVariantController::class, 'updateVariant'])->name('products.variants.update');
    Route::delete('products/variants/{variant}', [App\Http\Controllers\Admin\ProductVariantController::class, 'destroyVariant'])->name('products.variants.destroy');

    Route::get('orders', [AdminOrderController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
    Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status');
    Route::patch('orders/{order}/payment-status', [AdminOrderController::class, 'updatePaymentStatus'])->name('orders.payment-status');

    Route::resource('users', App\Http\Controllers\Admin\UserController::class)->except('show');

    // Shipping Methods
    Route::resource('shipping', App\Http\Controllers\Admin\ShippingMethodController::class)->except('show');

    // Reviews Management
    Route::get('reviews', [App\Http\Controllers\Admin\ReviewController::class, 'index'])->name('reviews.index');
    Route::patch('reviews/{review}/approve', [App\Http\Controllers\Admin\ReviewController::class, 'approve'])->name('reviews.approve');
    Route::patch('reviews/{review}/reject', [App\Http\Controllers\Admin\ReviewController::class, 'reject'])->name('reviews.reject');
    Route::delete('reviews/{review}', [App\Http\Controllers\Admin\ReviewController::class, 'destroy'])->name('reviews.destroy');

    // Contact Messages
    Route::get('contacts', [App\Http\Controllers\Admin\ContactController::class, 'index'])->name('contacts.index');
    Route::get('contacts/{contact}', [App\Http\Controllers\Admin\ContactController::class, 'show'])->name('contacts.show');
    Route::patch('contacts/{contact}/mark-read', [App\Http\Controllers\Admin\ContactController::class, 'markAsRead'])->name('contacts.markAsRead');
    Route::patch('contacts/{contact}/mark-unread', [App\Http\Controllers\Admin\ContactController::class, 'markAsUnread'])->name('contacts.markAsUnread');
    Route::delete('contacts/{contact}', [App\Http\Controllers\Admin\ContactController::class, 'destroy'])->name('contacts.destroy');

    // Newsletter Subscribers
    Route::get('newsletters', [App\Http\Controllers\Admin\NewsletterController::class, 'index'])->name('newsletters.index');
    Route::get('newsletters/compose', [App\Http\Controllers\Admin\NewsletterController::class, 'compose'])->name('newsletters.compose');
    Route::post('newsletters/send', [App\Http\Controllers\Admin\NewsletterController::class, 'send'])->name('newsletters.send');
    Route::get('newsletters/export', [App\Http\Controllers\Admin\NewsletterController::class, 'export'])->name('newsletters.export');
    Route::patch('newsletters/{newsletter}/toggle', [App\Http\Controllers\Admin\NewsletterController::class, 'toggleStatus'])->name('newsletters.toggleStatus');
    Route::delete('newsletters/{newsletter}', [App\Http\Controllers\Admin\NewsletterController::class, 'destroy'])->name('newsletters.destroy');

    Route::get('settings', [App\Http\Controllers\Admin\SettingsController::class, 'index'])->name('settings.index');
    Route::put('settings', [App\Http\Controllers\Admin\SettingsController::class, 'update'])->name('settings.update');
    Route::post('settings/hero-banners', [App\Http\Controllers\Admin\SettingsController::class, 'uploadHeroBanners'])->name('settings.hero-banners.upload');
    Route::put('settings/hero-banner/{banner}', [App\Http\Controllers\Admin\SettingsController::class, 'updateHeroBanner'])->name('settings.hero-banner.update');
    Route::delete('settings/hero-banner/{banner}', [App\Http\Controllers\Admin\SettingsController::class, 'deleteHeroBanner'])->name('settings.hero-banner.delete');
});

require __DIR__.'/auth.php';

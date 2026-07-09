<?php

use App\Http\Controllers\Api\ExternalCheckoutController;
use App\Http\Controllers\Api\PaystackWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Paystack Payment Webhook
Route::post('/paystack/webhook', [PaystackWebhookController::class, 'callback'])->name('api.paystack.webhook');

// External checkout — lets a trusted external client (e.g. the GhProfit server)
// hand off a payment to vcom's working Paystack integration. Requests are
// authenticated via the x-api-key header (see ExternalCheckoutController::authorized()).
Route::post('/external-checkout', [ExternalCheckoutController::class, 'store'])->name('api.external-checkout.store');
Route::get('/external-checkout/{reference}/status', [ExternalCheckoutController::class, 'status'])->name('api.external-checkout.status');

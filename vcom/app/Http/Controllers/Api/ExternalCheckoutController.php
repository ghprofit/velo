<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExternalPayment;
use App\Services\ExternalWebhookService;
use App\Services\PaystackPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class ExternalCheckoutController extends Controller
{
    protected PaystackPaymentService $paystack;
    protected ExternalWebhookService $webhooks;

    public function __construct(PaystackPaymentService $paystack, ExternalWebhookService $webhooks)
    {
        $this->paystack = $paystack;
        $this->webhooks = $webhooks;
    }

    /**
     * Create a hosted checkout session for an arbitrary external purchase
     * (e.g. content bought on the GhProfit platform) and return the
     * Paystack checkout URL for the caller to redirect the buyer to.
     */
    public function store(Request $request)
    {
        if (!$this->authorized($request)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $validated = $request->validate([
                'reference' => 'required|string|max:255|unique:external_payments,reference',
                'amount' => 'required|numeric|min:0.01',
                'currency' => 'nullable|string|max:10',
                'email' => 'required|email',
                'description' => 'nullable|string|max:255',
                'return_url' => 'required|url',
                'source' => 'nullable|string|max:100',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $e->errors()], 422);
        }

        $payment = ExternalPayment::create([
            'reference' => $validated['reference'],
            'source' => $validated['source'] ?? 'external',
            'amount' => $validated['amount'],
            'currency' => $validated['currency'] ?? 'GHS',
            'email' => $validated['email'],
            'description' => $validated['description'] ?? null,
            'return_url' => $validated['return_url'],
            'status' => 'pending',
        ]);

        Log::info('External checkout: created', [
            'reference' => $payment->reference,
            'source' => $payment->source,
            'amount' => (float) $payment->amount,
            'currency' => $payment->currency,
        ]);

        $paymentResponse = $this->paystack->initiatePayment([
            'total' => $payment->amount,
            'email' => $payment->email,
            'description' => $payment->description ?? "Payment {$payment->reference}",
            'client_reference' => $payment->reference,
            'return_url' => route('external-checkout.return', $payment->reference),
            'currency' => $payment->currency,
        ]);

        if (!$paymentResponse['success']) {
            $payment->delete();
            return response()->json(['success' => false, 'message' => $paymentResponse['message']], 502);
        }

        $payment->update([
            'payment_reference' => $paymentResponse['data']['data']['reference'] ?? $payment->reference,
        ]);

        return response()->json([
            'success' => true,
            'checkout_url' => $paymentResponse['checkout_url'],
            'reference' => $payment->reference,
        ]);
    }

    /**
     * Status check used by the caller's own client-side confirmation
     * fast-path (mirrors the pattern of re-querying the gateway rather
     * than trusting a client-supplied payload).
     */
    public function status(Request $request, string $reference)
    {
        if (!$this->authorized($request)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $payment = ExternalPayment::where('reference', $reference)->first();

        if (!$payment) {
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        }

        // If still pending, give Paystack a chance to confirm before we answer.
        if ($payment->status === 'pending') {
            $this->verifyAndSettle($payment);
        }

        return response()->json([
            'success' => true,
            'reference' => $payment->reference,
            'status' => $payment->status,
            'amount' => (float) $payment->amount,
            'currency' => $payment->currency,
            'paid_at' => optional($payment->paid_at)->toIso8601String(),
        ]);
    }

    /**
     * Browser-facing landing page Paystack redirects back to. Verifies
     * payment as a fallback in case the webhook hasn't landed yet, then
     * sends the buyer on to the caller's own return URL.
     */
    public function returnPage(string $reference)
    {
        $payment = ExternalPayment::where('reference', $reference)->firstOrFail();

        if ($payment->status === 'pending') {
            $this->verifyAndSettle($payment);
        }

        // The caller's return_url won't otherwise learn the payment reference —
        // Paystack's own redirect never reaches the browser directly, it bounces
        // through this page first — so append it as a query param the caller can read.
        $separator = str_contains($payment->return_url, '?') ? '&' : '?';
        return redirect($payment->return_url . $separator . 'reference=' . urlencode($payment->reference));
    }

    /**
     * Re-verify a still-pending payment against Paystack directly and
     * settle it (mark paid/failed + fire the outbound webhook) if resolved.
     */
    private function verifyAndSettle(ExternalPayment $payment): void
    {
        Log::info('External checkout: verifying payment on return', ['reference' => $payment->reference]);

        $verification = $this->paystack->verifyPayment($payment->reference);
        $status = $verification['data']['status'] ?? null;

        if ($verification['success'] && $status === 'success') {
            if ($payment->markAsPaid($verification['data']['reference'] ?? $payment->reference)) {
                Log::info('External checkout: payment confirmed paid via return-page fallback', [
                    'reference' => $payment->reference,
                    'amount' => (float) $payment->amount,
                    'currency' => $payment->currency,
                ]);
                $this->webhooks->notifyPaid($payment);
            }
        } elseif ($verification['success'] && in_array($status, ['failed', 'abandoned'])) {
            Log::info('External checkout: payment not successful', ['reference' => $payment->reference, 'status' => $status]);
            $payment->markAsFailed();
        } else {
            Log::warning('External checkout: verification inconclusive', ['reference' => $payment->reference, 'response' => $verification]);
        }
    }

    private function authorized(Request $request): bool
    {
        $expected = config('services.external_checkout.api_key');

        if (!$expected) {
            Log::warning('EXTERNAL_CHECKOUT_API_KEY is not configured; rejecting external checkout request');
            return false;
        }

        return hash_equals($expected, (string) $request->header('x-api-key'));
    }
}

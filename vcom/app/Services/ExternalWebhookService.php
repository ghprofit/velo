<?php

namespace App\Services;

use App\Models\ExternalPayment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExternalWebhookService
{
    /**
     * Notify the originating client (e.g. the GhProfit server) that an
     * external payment has been confirmed paid, signing the payload so the
     * receiver can verify it genuinely came from here.
     */
    public function notifyPaid(ExternalPayment $payment): void
    {
        $url = config('services.external_checkout.webhook_url');
        $secret = config('services.external_checkout.webhook_secret');

        if (!$url || !$secret) {
            Log::warning('External checkout webhook not configured; skipping notify', [
                'reference' => $payment->reference,
            ]);
            return;
        }

        $body = json_encode([
            'reference' => $payment->reference,
            'status' => 'paid',
            'amount' => (float) $payment->amount,
            'currency' => $payment->currency,
            'email' => $payment->email,
            'paid_at' => optional($payment->paid_at)->toIso8601String(),
        ]);

        $signature = hash_hmac('sha256', $body, $secret);

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'x-vcom-signature' => $signature,
            ])->withBody($body, 'application/json')->post($url);

            if ($response->successful()) {
                $payment->update(['webhook_sent_at' => now()]);
                Log::info('External checkout webhook delivered to caller', [
                    'reference' => $payment->reference,
                    'url' => $url,
                ]);
            } else {
                Log::error('External checkout webhook delivery failed', [
                    'reference' => $payment->reference,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('External checkout webhook delivery exception', [
                'reference' => $payment->reference,
                'message' => $e->getMessage(),
            ]);
        }
    }
}

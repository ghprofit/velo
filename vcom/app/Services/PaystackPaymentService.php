<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaystackPaymentService
{
    protected $secretKey;
    protected $publicKey;
    protected $apiUrl;

    public function __construct()
    {
        $this->secretKey = config('services.paystack.secret_key');
        $this->publicKey = config('services.paystack.public_key');
        $this->apiUrl = config('services.paystack.api_url');
    }

    /**
     * Initialize a Paystack transaction and return the checkout URL.
     *
     * @param array $data ['total', 'email', 'client_reference', 'return_url', 'description', 'currency']
     * @return array
     */
    public function initiatePayment(array $data)
    {
        try {
            $payload = [
                'email' => $data['email'],
                'amount' => (int) round($data['total'] * 100),
                'currency' => $data['currency'] ?? 'GHS',
                'reference' => $data['client_reference'],
                'callback_url' => $data['return_url'],
                'metadata' => [
                    'order_number' => $data['client_reference'],
                    'description' => $data['description'] ?? 'Order Payment',
                ],
            ];

            $response = Http::withToken($this->secretKey)
                ->acceptJson()
                ->post("{$this->apiUrl}/transaction/initialize", $payload);

            if ($response->successful() && $response->json('status')) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                    'checkout_url' => $response->json('data.authorization_url'),
                ];
            }

            Log::error('Paystack payment initiation failed', [
                'response' => $response->body(),
                'status' => $response->status(),
            ]);

            return [
                'success' => false,
                'message' => 'Payment initiation failed. Please try again.',
                'error' => $response->json('message') ?? 'Unknown error',
            ];

        } catch (\Exception $e) {
            Log::error('Paystack payment exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'An error occurred while processing your payment.',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify a transaction by its reference.
     *
     * @param string $reference
     * @return array
     */
    public function verifyPayment(string $reference)
    {
        try {
            $response = Http::withToken($this->secretKey)
                ->acceptJson()
                ->get("{$this->apiUrl}/transaction/verify/" . rawurlencode($reference));

            if ($response->successful() && $response->json('status')) {
                return [
                    'success' => true,
                    'data' => $response->json('data'),
                ];
            }

            Log::error('Paystack payment verification failed', [
                'reference' => $reference,
                'response' => $response->body(),
            ]);

            return [
                'success' => false,
                'message' => 'Payment verification failed.',
            ];

        } catch (\Exception $e) {
            Log::error('Paystack payment verification exception', [
                'message' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'An error occurred while verifying payment.',
            ];
        }
    }

    /**
     * Verify that a webhook payload actually came from Paystack.
     *
     * @param string $rawBody
     * @param string|null $signature
     * @return bool
     */
    public function verifyWebhookSignature(string $rawBody, ?string $signature): bool
    {
        if (!$signature || !$this->secretKey) {
            return false;
        }

        $expected = hash_hmac('sha512', $rawBody, $this->secretKey);

        return hash_equals($expected, $signature);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OrderConfirmation;
use App\Models\ExternalPayment;
use App\Models\Order;
use App\Services\ExternalWebhookService;
use App\Services\PaystackPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PaystackWebhookController extends Controller
{
    protected PaystackPaymentService $paystack;
    protected ExternalWebhookService $externalWebhooks;

    public function __construct(PaystackPaymentService $paystack, ExternalWebhookService $externalWebhooks)
    {
        $this->paystack = $paystack;
        $this->externalWebhooks = $externalWebhooks;
    }

    /**
     * Handle Paystack webhook events.
     */
    public function callback(Request $request)
    {
        $signature = $request->header('x-paystack-signature');

        if (!$this->paystack->verifyWebhookSignature($request->getContent(), $signature)) {
            Log::warning('Paystack webhook: invalid signature');
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        try {
            $payload = $request->all();
            $event = $payload['event'] ?? null;
            $reference = $payload['data']['reference'] ?? null;

            Log::info('Paystack webhook received', ['event' => $event, 'reference' => $reference]);

            if (!$reference) {
                return response()->json(['message' => 'No reference'], 400);
            }

            $order = Order::where('order_number', $reference)->first();

            if ($order) {
                if ($event === 'charge.success') {
                    if ($order->markAsPaid($reference)) {
                        try {
                            Mail::to($order->shipping_email)->send(new OrderConfirmation($order));
                        } catch (\Exception $e) {
                            Log::error('Failed to send order confirmation email: ' . $e->getMessage());
                        }
                    }
                    Log::info('Paystack payment completed', ['order' => $order->order_number]);
                } elseif (in_array($event, ['charge.failed', 'charge.dispute.create'])) {
                    $order->markAsFailed();
                    Log::info('Paystack payment failed', ['order' => $order->order_number]);
                }

                return response()->json(['message' => 'Webhook processed'], 200);
            }

            $externalPayment = ExternalPayment::where('reference', $reference)->first();

            if ($externalPayment) {
                if ($event === 'charge.success') {
                    if ($externalPayment->markAsPaid($reference)) {
                        $this->externalWebhooks->notifyPaid($externalPayment);
                    }
                    Log::info('Paystack external payment completed', ['reference' => $reference]);
                } elseif (in_array($event, ['charge.failed', 'charge.dispute.create'])) {
                    $externalPayment->markAsFailed();
                    Log::info('Paystack external payment failed', ['reference' => $reference]);
                }

                return response()->json(['message' => 'Webhook processed'], 200);
            }

            Log::error('Paystack webhook: no matching order or external payment', ['reference' => $reference]);
            return response()->json(['message' => 'Order not found'], 404);

        } catch (\Exception $e) {
            Log::error('Paystack webhook exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['message' => 'Error processing webhook'], 500);
        }
    }
}

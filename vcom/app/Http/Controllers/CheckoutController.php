<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\ShippingAddress;
use App\Models\ShippingMethod;
use App\Models\Setting;
use App\Services\CartService;
use App\Services\PaystackPaymentService;
use App\Mail\OrderConfirmation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class CheckoutController extends Controller
{
    protected $paystackService;
    protected CartService $cart;

    public function __construct(PaystackPaymentService $paystackService, CartService $cart)
    {
        $this->paystackService = $paystackService;
        $this->cart = $cart;
    }
    public function index()
    {
        $cartItems = $this->cart->items();

        if (empty($cartItems)) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        $subtotal = $this->cart->total($cartItems);

        // Load all active shipping methods for customer selection
        $shippingMethods = ShippingMethod::where('is_active', true)
            ->orderBy('cost', 'asc')
            ->get();

        // Load user's saved addresses
        $savedAddresses = auth()->user()->shippingAddresses()->orderBy('is_default', 'desc')->get();

        // Determine default payment method based on what's enabled
        $codEnabled = Setting::get('payment_method_cod', '1') == '1';
        $paystackEnabled = Setting::get('payment_method_paystack', '1') == '1';

        // Default to COD if enabled, otherwise Paystack
        $defaultPaymentMethod = $codEnabled ? 'cod' : ($paystackEnabled ? 'paystack' : null);

        return view('checkout.index', compact('cartItems', 'subtotal', 'shippingMethods', 'savedAddresses', 'defaultPaymentMethod'));
    }

    public function store(Request $request)
    {
        // Get enabled payment methods
        $codEnabled = Setting::get('payment_method_cod', '1') == '1';
        $paystackEnabled = Setting::get('payment_method_paystack', '1') == '1';

        // Build allowed payment methods array
        $allowedPaymentMethods = [];
        if ($codEnabled) $allowedPaymentMethods[] = 'cod';
        if ($paystackEnabled) $allowedPaymentMethods[] = 'paystack';

        // Ensure at least one payment method is available
        if (empty($allowedPaymentMethods)) {
            return redirect()->back()->with('error', 'No payment methods are currently available. Please contact support.');
        }

        $validated = $request->validate([
            'shipping_name' => 'required|string|max:255',
            'shipping_email' => 'required|email',
            'shipping_phone' => 'required|string|max:20',
            'shipping_address' => 'required|string',
            'shipping_city' => 'required|string|max:255',
            'shipping_state' => 'nullable|string|max:255',
            'shipping_zip' => 'required|string|max:20',
            'shipping_method_id' => 'required|exists:shipping_methods,id',
            'notes' => 'nullable|string',
            'payment_method' => 'required|in:' . implode(',', $allowedPaymentMethods),
            'save_address' => 'nullable|boolean',
        ]);

        $cartItems = $this->cart->items();

        if (empty($cartItems)) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        try {
            $order = DB::transaction(function () use ($validated, $cartItems, $request) {
                $subtotal = 0;
                $items = [];

                // Get selected shipping method
                $shippingMethod = ShippingMethod::findOrFail($validated['shipping_method_id']);
                $shippingFee = $shippingMethod->cost;

                foreach ($cartItems as $cartItem) {
                    $product = $cartItem['product'];
                    $variant = $cartItem['variant'];
                    $price = $cartItem['price'];
                    $quantity = $cartItem['quantity'];
                    $itemSubtotal = $price * $quantity;

                    $availableStock = $variant ? $variant->stock : $product->stock;
                    if (!$product->is_digital && $availableStock < $quantity) {
                        throw new \Exception("Insufficient stock for {$product->name}.");
                    }

                    // Don't decrement stock for Paystack payment until payment is confirmed
                    if (!$product->is_digital && $validated['payment_method'] === 'cod') {
                        if ($variant) {
                            $variant->decrement('stock', $quantity);
                        } else {
                            $product->decrement('stock', $quantity);
                        }
                    }

                    $items[] = [
                        'product_id' => $product->id,
                        'product_variant_id' => $variant?->id,
                        'product_name' => $product->name,
                        'variant_label' => $cartItem['variant_label'],
                        'price' => $price,
                        'quantity' => $quantity,
                        'subtotal' => $itemSubtotal,
                    ];

                    $subtotal += $itemSubtotal;
                }

                // Save shipping address if requested
                if ($request->has('save_address') && $request->save_address) {
                    ShippingAddress::create([
                        'user_id' => auth()->id(),
                        'name' => $validated['shipping_name'],
                        'email' => $validated['shipping_email'],
                        'phone' => $validated['shipping_phone'],
                        'address' => $validated['shipping_address'],
                        'city' => $validated['shipping_city'],
                        'state' => $validated['shipping_state'],
                        'zip' => $validated['shipping_zip'],
                        'is_default' => auth()->user()->shippingAddresses()->count() === 0,
                    ]);
                }

                $order = Order::create([
                    'user_id' => auth()->id(),
                    'order_number' => Order::generateOrderNumber(),
                    'status' => 'pending',
                    'subtotal' => $subtotal,
                    'shipping_cost' => 0,
                    'shipping_fee' => $shippingFee,
                    'total' => $subtotal + $shippingFee,
                    'payment_method' => $validated['payment_method'],
                    'payment_status' => 'pending',
                    ...$validated,
                ]);

                foreach ($items as $item) {
                    $order->items()->create($item);
                }

                return $order;
            });

            // If payment method is Paystack, initiate payment
            if ($validated['payment_method'] === 'paystack') {
                $paymentData = [
                    'total' => $order->total,
                    'email' => $order->shipping_email,
                    'description' => "Payment for Order {$order->order_number}",
                    'client_reference' => $order->order_number,
                    'return_url' => route('checkout.success', $order),
                    'currency' => Setting::get('currency', 'GHS'),
                ];

                $paymentResponse = $this->paystackService->initiatePayment($paymentData);

                if ($paymentResponse['success']) {
                    // Update order with payment reference
                    $order->update([
                        'payment_reference' => $paymentResponse['data']['data']['reference'] ?? $order->order_number,
                        'payment_provider' => 'paystack',
                    ]);

                    // Redirect to Paystack checkout
                    return redirect($paymentResponse['checkout_url']);
                } else {
                    // Payment initiation failed, delete order and restore any reserved stock
                    $order->delete();
                    return back()->withInput()->with('error', $paymentResponse['message']);
                }
            }

            // For COD, clear cart and redirect to success
            session()->forget('cart');

            // Send order confirmation email
            try {
                Mail::to($order->shipping_email)->send(new OrderConfirmation($order));
            } catch (\Exception $e) {
                \Log::error('Failed to send order confirmation email: ' . $e->getMessage());
            }

            return redirect()->route('checkout.success', $order)
                ->with('success', 'Order placed successfully!');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function success(Order $order)
    {
        if ($order->user_id !== auth()->id()) {
            \Log::warning('Checkout success 403 mismatch', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'order_user_id' => $order->user_id,
                'auth_id' => auth()->id(),
                'session_id' => session()->getId(),
                'has_session_cookie' => request()->hasCookie(config('session.cookie')),
            ]);
            abort(403);
        }

        $justPaid = false;

        // For Paystack, verify the payment on return in case the webhook hasn't landed yet
        if ($order->payment_method === 'paystack' && $order->payment_status === 'pending') {
            $verification = $this->paystackService->verifyPayment($order->order_number);
            $status = $verification['data']['status'] ?? null;

            if ($verification['success'] && $status === 'success') {
                $justPaid = $order->markAsPaid($verification['data']['reference'] ?? $order->order_number);
            } elseif ($verification['success'] && in_array($status, ['failed', 'abandoned'])) {
                $order->markAsFailed();
            }
        }

        // Only clear the cart once the order is actually confirmed (paid, or COD which needs no online payment)
        if ($order->payment_method === 'cod' || $order->payment_status === 'paid') {
            session()->forget('cart');
        }

        // Send confirmation email exactly once, at the moment payment is confirmed paid
        if ($justPaid) {
            try {
                Mail::to($order->shipping_email)->send(new OrderConfirmation($order));
            } catch (\Exception $e) {
                \Log::error('Failed to send order confirmation email: ' . $e->getMessage());
            }
        }

        $order->load('items');

        return view('checkout.success', compact('order'));
    }
}

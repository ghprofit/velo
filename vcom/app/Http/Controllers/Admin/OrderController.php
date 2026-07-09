<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Mail\OrderDelivered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('user')->latest()->paginate(15);
        return view('admin.orders.index', compact('orders'));
    }

    public function show(Order $order)
    {
        $order->load('items', 'user');
        return view('admin.orders.show', compact('order'));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,completed,cancelled',
        ]);

        $previousStatus = $order->status;
        $order->update($validated);

        // Send delivery notification email when order status changes to delivered
        if ($validated['status'] === 'delivered' && $previousStatus !== 'delivered') {
            try {
                $order->load('items.product', 'user');
                Mail::to($order->shipping_email)->send(new OrderDelivered($order));
            } catch (\Exception $e) {
                \Log::error('Failed to send order delivery email: ' . $e->getMessage());
            }
        }

        return back()->with('success', 'Order status updated successfully.');
    }

    public function updatePaymentStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:pending,paid,failed',
        ]);

        $order->update($validated);

        // If payment is marked as paid and it was COD, update the payment completed timestamp
        if ($validated['payment_status'] === 'paid' && !$order->payment_completed_at) {
            $order->update(['payment_completed_at' => now()]);
        }

        return back()->with('success', 'Payment status updated successfully.');
    }
}

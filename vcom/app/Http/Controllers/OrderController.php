<?php

namespace App\Http\Controllers;

use App\Models\Order;

class OrderController extends Controller
{
    public function index()
    {
        $orders = auth()->user()->orders()->latest()->paginate(10);
        return view('orders.index', compact('orders'));
    }

    public function show(Order $order)
    {
        if ((int) $order->user_id !== (int) auth()->id()) {
            abort(403);
        }

        $order->load('items');

        return view('orders.show', compact('order'));
    }
}

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 30px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .total { font-size: 18px; font-weight: bold; padding: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmation</h1>
        </div>
        
        <div class="content">
            <p>Hi {{ $order->user->name }},</p>
            <p>Thank you for your order! We're getting your items ready for shipment.</p>
            
            <div class="order-details">
                <h2>Order #{{ $order->order_number }}</h2>
                <p><strong>Order Date:</strong> {{ $order->created_at->format('F d, Y') }}</p>
                <p><strong>Order Status:</strong> {{ ucfirst($order->order_status) }}</p>
                <p><strong>Payment Status:</strong> {{ ucfirst($order->payment_status) }}</p>
                
                <h3 style="margin-top: 20px;">Order Items</h3>
                @foreach($order->items as $item)
                    <div class="item">
                        <strong>{{ $item->product->name }}</strong><br>
                        Quantity: {{ $item->quantity }} × {{ currency($item->price) }} = {{ currency($item->quantity * $item->price) }}
                    </div>
                @endforeach
                
                <div class="total">
                    Subtotal: {{ currency($order->subtotal) }}
                </div>
                @if($order->shipping_cost > 0)
                    <div>Shipping: {{ currency($order->shipping_cost) }}</div>
                @endif
                @if($order->tax > 0)
                    <div>Tax: {{ currency($order->tax) }}</div>
                @endif
                <div class="total">
                    Total: {{ currency($order->total) }}
                </div>
                
                <h3 style="margin-top: 20px;">Shipping Address</h3>
                <p>
                    {{ $order->shipping_name }}<br>
                    {{ $order->shipping_address }}<br>
                    {{ $order->shipping_city }}@if($order->shipping_state), {{ $order->shipping_state }}@endif {{ $order->shipping_zip }}<br>
                    {{ $order->shipping_phone }}
                </p>
            </div>
            
            <center>
                <a href="{{ route('orders.show', $order) }}" class="button">View Order Details</a>
            </center>
            
            <p>If you have any questions about your order, please don't hesitate to contact us.</p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} STRYD. All rights reserved.</p>
            <p>Powered by <a href="https://ghprofit.com" style="color: #ef4444;">GhProfit</a></p>
        </div>
    </div>
</body>
</html>

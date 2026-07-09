<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 40px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .success-icon { font-size: 60px; margin-bottom: 10px; }
        .content { background: #f9fafb; padding: 30px; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981; }
        .item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .item:last-child { border-bottom: none; }
        .highlight-box { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .button { display: inline-block; padding: 14px 28px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .button:hover { background: #059669; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .review-cta { background: #fff7ed; border: 2px solid #fb923c; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .review-cta h3 { color: #ea580c; margin-top: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">✓</div>
            <h1>Your Order Has Been Delivered!</h1>
        </div>
        
        <div class="content">
            <div class="highlight-box">
                <h2 style="margin: 0; color: #059669;">🎉 Delivery Confirmed</h2>
                <p style="margin: 10px 0 0 0; font-size: 16px;">Your order #{{ $order->order_number }} has been successfully delivered!</p>
            </div>

            <p>Hi {{ $order->user->name }},</p>
            
            <p>Great news! Your order has been delivered to your address. We hope you're happy with your purchase!</p>
            
            <div class="order-details">
                <h3 style="margin-top: 0;">Order Summary</h3>
                <p><strong>Order #:</strong> {{ $order->order_number }}</p>
                <p><strong>Delivered To:</strong> {{ $order->shipping_name }}</p>
                <p><strong>Address:</strong> {{ $order->shipping_address }}, {{ $order->shipping_city }}</p>
                
                <h4 style="margin-top: 20px;">Items Delivered:</h4>
                @foreach($order->items as $item)
                    <div class="item">
                        <strong>{{ $item->product_name }}</strong><br>
                        <span style="color: #6b7280;">Quantity: {{ $item->quantity }} × {{ currency($item->price) }}</span>
                    </div>
                @endforeach
            </div>
            
            <div class="review-cta">
                <h3>⭐ Share Your Experience!</h3>
                <p>Now that you've received your order, we'd love to hear what you think! Your feedback helps other customers make informed decisions.</p>
                <center>
                    <a href="{{ route('orders.show', $order) }}" class="button" style="background: #fb923c;">Leave a Review</a>
                </center>
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">You can now review all the products from this order.</p>
            </div>
            
            <center>
                <a href="{{ route('orders.show', $order) }}" class="button">View Order Details</a>
            </center>
            
            <p>If you have any issues with your delivery or the products you received, please don't hesitate to contact us.</p>
            
            <p style="margin-top: 30px;">Thank you for shopping with us!<br>
            <strong>STRYD Team</strong></p>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} STRYD. All rights reserved.</p>
            <p>Sneakers and Footwear for Ghana</p>
            <p>Powered by <a href="https://ghprofit.com" style="color: #10b981;">GhProfit</a></p>
        </div>
    </div>
</body>
</html>

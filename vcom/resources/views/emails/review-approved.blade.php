<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 30px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; }
        .review-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .stars { color: #fbbf24; font-size: 20px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✓ Review Approved!</h1>
        </div>
        
        <div class="content">
            <p>Hi {{ $review->user->name }},</p>
            
            <p>Great news! Your review for <strong>{{ $review->product->name }}</strong> has been approved and is now live on our website.</p>
            
            <div class="review-box">
                <div class="stars">
                    @for($i = 1; $i <= 5; $i++)
                        {{ $i <= $review->rating ? '★' : '☆' }}
                    @endfor
                </div>
                
                @if($review->title)
                    <h3>{{ $review->title }}</h3>
                @endif
                
                @if($review->comment)
                    <p>{{ $review->comment }}</p>
                @endif
                
                @if($review->verified_purchase)
                    <p style="color: #10b981; font-size: 14px;">
                        ✓ Verified Purchase
                    </p>
                @endif
            </div>
            
            <center>
                <a href="{{ route('shop.show', $review->product) }}" class="button">View Product Page</a>
            </center>
            
            <p>Thank you for sharing your experience with our community. Your feedback helps other customers make informed decisions!</p>
            
            <p>Best regards,<br>
            <strong>STRYD Team</strong></p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} STRYD. All rights reserved.</p>
            <p>Powered by <a href="https://ghprofit.com" style="color: #ef4444;">GhProfit</a></p>
        </div>
    </div>
</body>
</html>

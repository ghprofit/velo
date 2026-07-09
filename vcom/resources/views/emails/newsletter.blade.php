<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject }}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .content {
            padding: 40px 30px;
            color: #333333;
            line-height: 1.6;
        }
        .message-content {
            font-size: 16px;
            color: #555555;
            white-space: pre-wrap;
        }
        .footer {
            background-color: #f8f8f8;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
        }
        .footer p {
            margin: 5px 0;
            color: #999999;
            font-size: 14px;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        .divider {
            height: 1px;
            background-color: #e0e0e0;
            margin: 30px 0;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 20px 15px;
            }
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>{{ $subject }}</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="message-content">
                {!! $messageContent !!}
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>STRYD</strong></p>
            <p>Ghana's Sneaker Destination</p>
            <div class="divider" style="margin: 20px auto; width: 100px;"></div>
            <p style="font-size: 12px;">
                You received this email because you subscribed to our newsletter.<br>
                @if($unsubscribeToken)
                    Don't want to receive these emails? 
                    <a href="{{ route('newsletter.unsubscribe', $unsubscribeToken) }}" style="color: #667eea; text-decoration: underline;">Unsubscribe</a>
                @else
                    If you wish to unsubscribe, please <a href="{{ route('contact') }}" style="color: #667eea; text-decoration: underline;">contact us</a>.
                @endif
            </p>
            <p style="margin-top: 15px;">
                <a href="{{ url('/') }}">Visit Our Website</a>
            </p>
            <p style="margin-top: 10px; color: #bbbbbb; font-size: 12px;">
                &copy; {{ date('Y') }} GhProfit. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>

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
        .message-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ef4444; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thank You for Contacting Us</h1>
        </div>
        
        <div class="content">
            <p>Hi {{ $contact->name }},</p>
            
            <p>Thank you for reaching out to STRYD. We have received your message and our team will review it shortly.</p>
            
            <div class="message-box">
                <h3>Your Message:</h3>
                <p><strong>Subject:</strong> {{ $contact->subject }}</p>
                <p><strong>Message:</strong></p>
                <p>{{ $contact->message }}</p>
                <p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                    Submitted on {{ $contact->created_at->format('F d, Y \a\t h:i A') }}
                </p>
            </div>
            
            <p>We typically respond within 24-48 business hours. If your inquiry is urgent, please call us directly.</p>
            
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

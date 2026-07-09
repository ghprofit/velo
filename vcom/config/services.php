<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'paystack' => [
        'secret_key' => env('PAYSTACK_SECRET_KEY'),
        'public_key' => env('PAYSTACK_PUBLIC_KEY'),
        'api_url' => env('PAYSTACK_API_URL', 'https://api.paystack.co'),
    ],

    'external_checkout' => [
        'api_key' => env('EXTERNAL_CHECKOUT_API_KEY'),
        'webhook_url' => env('EXTERNAL_CHECKOUT_WEBHOOK_URL'),
        'webhook_secret' => env('EXTERNAL_CHECKOUT_WEBHOOK_SECRET'),
    ],

    'frogapi' => [
        'api_key' => env('FROG_SMS_API_KEY'),
        'username' => env('FROG_SMS_USERNAME'),
        'sender_id' => env('FROG_SMS_SENDER_ID', 'GhProfit'),
        'api_url' => env('FROG_SMS_API_URL', 'https://frogapi.wigal.com.gh/api/v3/sms/send'),
    ],

];

<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SmsService
{
    protected $apiKey;
    protected $username;
    protected $senderId;
    protected $apiUrl;

    public function __construct()
    {
        $this->apiKey = config('services.frogapi.api_key');
        $this->username = config('services.frogapi.username');
        $this->senderId = config('services.frogapi.sender_id');
        $this->apiUrl = config('services.frogapi.api_url');
    }

    /**
     * Send SMS via FrogAPI
     *
     * @param string $phone Phone number (Ghana format: 0XXXXXXXXX or 233XXXXXXXXX)
     * @param string $message Message content
     * @return bool
     */
    public function send(string $phone, string $message): bool
    {
        try {
            // Format phone number for FrogAPI (they accept 0XXXXXXXXX format)
            $formattedPhone = $this->formatPhoneNumber($phone);
            
            // Generate unique message ID
            $msgId = 'PB21-' . Str::upper(Str::random(10));

            $postData = [
                'senderid' => $this->senderId,
                'destinations' => [[
                    'destination' => $formattedPhone,
                    'msgid' => $msgId
                ]],
                'message' => $message,
                'smstype' => 'text'
            ];

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'API-KEY' => $this->apiKey,
                'USERNAME' => $this->username,
            ])->post($this->apiUrl, $postData);

            $responseData = $response->json();

            if ($response->successful() && isset($responseData['status']) && $responseData['status'] === 'ACCEPTD') {
                Log::info('SMS sent successfully', [
                    'phone' => $formattedPhone,
                    'msgid' => $msgId,
                    'response' => $responseData
                ]);
                return true;
            }

            Log::error('SMS sending failed', [
                'phone' => $formattedPhone,
                'status' => $response->status(),
                'response' => $responseData
            ]);

            return false;

        } catch (\Exception $e) {
            Log::error('SMS sending exception', [
                'phone' => $phone,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send verification code
     *
     * @param string $phone Phone number
     * @param string $code Verification code
     * @return bool
     */
    public function sendVerificationCode(string $phone, string $code): bool
    {
        $message = "Your STRYD verification code is: {$code}. Valid for 10 minutes. Do not share this code with anyone.";
        return $this->send($phone, $message);
    }

    /**
     * Format phone number for FrogAPI (accepts 0XXXXXXXXX format)
     *
     * @param string $phone
     * @return string
     */
    protected function formatPhoneNumber(string $phone): string
    {
        // Remove any spaces, dashes, or special characters
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // If starts with 233, convert to 0XXXXXXXXX format
        if (substr($phone, 0, 3) === '233') {
            $phone = '0' . substr($phone, 3);
        }

        // If doesn't start with 0, add it
        if (substr($phone, 0, 1) !== '0') {
            $phone = '0' . $phone;
        }

        return $phone;
    }
}

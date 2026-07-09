<?php

namespace App\Http\Controllers;

use App\Models\PhoneVerification;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PhoneVerificationController extends Controller
{
    protected $smsService;

    public function __construct(SmsService $smsService)
    {
        $this->middleware('auth');
        $this->smsService = $smsService;
    }

    /**
     * Show the phone verification notice
     */
    public function notice()
    {
        $user = Auth::user();

        // If phone is already verified, redirect home
        if ($user->phone_verified_at) {
            return redirect()->route('home');
        }

        return view('auth.verify-phone');
    }

    /**
     * Send verification code
     */
    public function send(Request $request)
    {
        $user = Auth::user();

        if (!$user->phone) {
            return back()->withErrors(['phone' => 'Please add a phone number to your profile first.']);
        }

        // Generate and save verification code
        $verification = PhoneVerification::generateCode($user->phone);

        // Send SMS
        $sent = $this->smsService->sendVerificationCode($user->phone, $verification->code);

        if ($sent) {
            return back()->with('message', 'Verification code sent to ' . $user->phone);
        }

        return back()->withErrors(['phone' => 'Failed to send verification code. Please try again.']);
    }

    /**
     * Verify the code
     */
    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = Auth::user();

        if (PhoneVerification::verify($user->phone, $request->code)) {
            $user->update(['phone_verified_at' => now()]);
            
            return redirect()->route('home')->with('message', 'Phone number verified successfully!');
        }

        return back()->withErrors(['code' => 'Invalid or expired verification code.']);
    }

    /**
     * Resend verification code
     */
    public function resend(Request $request)
    {
        return $this->send($request);
    }
}

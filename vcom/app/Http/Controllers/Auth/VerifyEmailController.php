<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            // Email already verified, check phone
            if (!$request->user()->phone_verified_at) {
                return redirect()->route('phone.verification.notice');
            }
            return redirect()->intended(route('home', absolute: false).'?verified=1');
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        // After email verification, redirect to phone verification
        if (!$request->user()->phone_verified_at) {
            return redirect()->route('phone.verification.notice')->with('message', 'Email verified! Now verify your phone number.');
        }

        return redirect()->intended(route('home', absolute: false).'?verified=1');
    }
}

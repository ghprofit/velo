<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class EmailVerificationPromptController extends Controller
{
    /**
     * Display the email verification prompt.
     */
    public function __invoke(Request $request): RedirectResponse|View
    {
        // If email is verified, check phone verification
        if ($request->user()->hasVerifiedEmail()) {
            // If phone is not verified, redirect to phone verification
            if (!$request->user()->phone_verified_at) {
                return redirect()->route('phone.verification.notice');
            }
            // Both verified, go to intended page or home
            return redirect()->intended(route('home', absolute: false));
        }

        return view('auth.verify-email');
    }
}

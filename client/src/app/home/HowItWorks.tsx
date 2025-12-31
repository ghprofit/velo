'use client';

import Image from 'next/image';
import ScrollReveal from './ScrollReveal';

export default function HowItWorks() {
  return (
    <section className="relative" style={{backgroundColor: 'var(--card-surface)'}}>
      {/* Background Gradient Accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* IMPORT */}
      <div className="sticky top-0 z-10">
        <div className="min-h-screen py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-indigo-50/90 to-purple-50/90 backdrop-blur-sm rounded-b-3xl shadow-2xl transition-transform duration-500 flex items-center overflow-y-auto">
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
          <ScrollReveal delay={0.2} className="lg:order-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-linear-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-full">
              <span className="text-sm font-semibold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Step 1
              </span>
            </div>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              IMPORT
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold mb-4" style={{color: 'var(--dark-bg-text)'}}>
              Upload & Price
            </h3>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-lg">
              Upload any media (Video, Photo, PDF) up to 2GB. Set your one-off price,
              title, and tags in seconds.
            </p>
          </ScrollReveal>

          <ScrollReveal className="lg:order-1 flex justify-center">
            <div className="max-w-[450px] w-full relative group">
              {/* Floating Content Cards */}
              <div className="absolute -top-8 -left-12 w-32 h-32 bg-white rounded-2xl shadow-xl p-3 animate-float hidden lg:block border-2 border-purple-100">
                <div className="text-3xl mb-2">📸</div>
                <p className="text-xs font-semibold text-gray-700">Photos</p>
                <p className="text-xs text-gray-500">$5-$50</p>
              </div>

              <div className="absolute top-20 -right-16 w-28 h-28 bg-white rounded-2xl shadow-xl p-3 animate-float animation-delay-1000 hidden lg:block border-2 border-indigo-100">
                <div className="text-3xl mb-2">🎥</div>
                <p className="text-xs font-semibold text-gray-700">Videos</p>
                <p className="text-xs text-gray-500">$10-$100</p>
              </div>

              <div className="absolute -bottom-4 -left-8 w-24 h-24 bg-white rounded-xl shadow-xl p-2 animate-float animation-delay-2000 hidden lg:block border-2 border-pink-100">
                <div className="text-2xl mb-1">📄</div>
                <p className="text-xs font-semibold text-gray-700">Docs</p>
              </div>

              {/* Main Mockup */}
              <div className="absolute inset-0 bg-linear-to-br from-indigo-400 to-purple-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <Image
                src="/assets/images/Mockups/Mockup_1.png"
                alt="Smartphone showing file upload interface with pricing"
                width={450}
                height={900}
                className="relative z-10 w-full h-auto drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </ScrollReveal>
            </div>
          </div>
        </div>
      </div>

      {/* LOCK */}
      <div className="sticky top-0 z-20">
        <div className="min-h-screen py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-purple-50/90 to-pink-50/90 backdrop-blur-sm rounded-b-3xl shadow-2xl transition-transform duration-500 flex items-center overflow-y-auto">
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
          <ScrollReveal delay={0.2}>
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-linear-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full">
              <span className="text-sm font-semibold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Step 2
              </span>
            </div>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              LOCK
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold mb-4" style={{color: 'var(--dark-bg-text)'}}>
              Get Your Unlock Link
            </h3>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-lg">
              Instantly generate a unique, unguessable link. Add optional usage limits or
              an expiry time.
            </p>
          </ScrollReveal>

          <ScrollReveal className="flex justify-center">
            <div className="max-w-[450px] w-full relative group">
              {/* Floating Content Cards */}
              <div className="absolute -top-6 -right-12 w-28 h-28 bg-white rounded-2xl shadow-xl p-3 animate-float hidden lg:block border-2 border-purple-100">
                <div className="text-2xl mb-2">🔐</div>
                <p className="text-xs font-semibold text-gray-700">Secure</p>
                <p className="text-xs text-gray-500">Encrypted</p>
              </div>

              <div className="absolute top-24 -left-14 w-32 h-32 bg-white rounded-2xl shadow-xl p-3 animate-float animation-delay-1500 hidden lg:block border-2 border-pink-100">
                <div className="text-3xl mb-2">🔗</div>
                <p className="text-xs font-semibold text-gray-700">Unique Link</p>
                <p className="text-xs text-gray-500">One-time use</p>
              </div>

              <div className="absolute -bottom-8 -right-10 w-24 h-24 bg-white rounded-xl shadow-xl p-2 animate-float animation-delay-3000 hidden lg:block border-2 border-indigo-100">
                <div className="text-2xl mb-1">⏰</div>
                <p className="text-xs font-semibold text-gray-700">Expires</p>
              </div>

              {/* Main Mockup */}
              <div className="absolute inset-0 bg-linear-to-br from-purple-400 to-pink-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <Image
                src="/assets/images/Mockups/Mockup_3.png"
                alt="Smartphone showing secure link generation with padlock"
                width={450}
                height={900}
                className="relative z-10 w-full h-auto drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </ScrollReveal>
            </div>
          </div>
        </div>
      </div>

      {/* SHARE */}
      <div className="sticky top-0 z-30">
        <div className="min-h-screen py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-pink-50/90 to-orange-50/90 backdrop-blur-sm rounded-b-3xl shadow-2xl transition-transform duration-500 flex items-center overflow-y-auto">
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
          <ScrollReveal delay={0.2} className="lg:order-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-linear-to-r from-pink-500/10 to-orange-500/10 border border-pink-500/20 rounded-full">
              <span className="text-sm font-semibold bg-linear-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                Step 3
              </span>
            </div>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-linear-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
              SHARE
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold mb-4" style={{color: 'var(--dark-bg-text)'}}>
              Share Anywhere
            </h3>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-lg">
              Post your link across all platforms. Buyers pay directly—no account or
              signup required.
            </p>
          </ScrollReveal>

          <ScrollReveal className="lg:order-1 flex justify-center">
            <div className="max-w-[450px] w-full relative group">
              {/* Floating Social Platform Cards */}
              <div className="absolute -top-10 -left-10 w-28 h-28 bg-white rounded-2xl shadow-xl p-3 animate-float hidden lg:block border-2 border-pink-100">
                <div className="text-3xl mb-2">📱</div>
                <p className="text-xs font-semibold text-gray-700">Instagram</p>
                <p className="text-xs text-gray-500">Share</p>
              </div>

              <div className="absolute top-16 -right-14 w-32 h-32 bg-white rounded-2xl shadow-xl p-3 animate-float animation-delay-2000 hidden lg:block border-2 border-orange-100">
                <div className="text-3xl mb-2">🐦</div>
                <p className="text-xs font-semibold text-gray-700">Twitter</p>
                <p className="text-xs text-gray-500">Post</p>
              </div>

              <div className="absolute -bottom-6 -left-12 w-26 h-26 bg-white rounded-xl shadow-xl p-3 animate-float animation-delay-1000 hidden lg:block border-2 border-purple-100">
                <div className="text-2xl mb-1">🎵</div>
                <p className="text-xs font-semibold text-gray-700">TikTok</p>
              </div>

              <div className="absolute bottom-20 -right-8 w-20 h-20 bg-white rounded-xl shadow-xl p-2 animate-float animation-delay-3500 hidden lg:block border-2 border-pink-100">
                <div className="text-2xl mb-1">🔗</div>
                <p className="text-xs font-semibold text-gray-600">Copy</p>
              </div>

              {/* Main Mockup */}
              <div className="absolute inset-0 bg-linear-to-br from-pink-400 to-orange-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <Image
                src="/assets/images/Mockups/Mockup_4.PNG"
                alt="Smartphone displaying social sharing interface"
                width={450}
                height={900}
                className="relative z-10 w-full h-auto drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </ScrollReveal>
            </div>
          </div>
        </div>
      </div>

      {/* EARN */}
      <div className="sticky top-0 z-40">
        <div className="min-h-screen py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-green-50/90 to-emerald-50/90 backdrop-blur-sm rounded-b-3xl shadow-2xl transition-transform duration-500 flex items-center overflow-y-auto">
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
          <ScrollReveal delay={0.2}>
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-linear-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full">
              <span className="text-sm font-semibold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Step 4
              </span>
            </div>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              EARN
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold mb-4" style={{color: 'var(--dark-bg-text)'}}>
              Get Paid Fast
            </h3>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-lg">
              Securely track earnings in your wallet. Request payouts to your local bank
              after the 7-day buffer clears.
            </p>
          </ScrollReveal>

          <ScrollReveal className="flex justify-center">
            <div className="max-w-[450px] w-full relative group">
              {/* Floating Earnings Cards */}
              <div className="absolute -top-8 -right-12 w-32 h-32 bg-white rounded-2xl shadow-xl p-3 animate-float hidden lg:block border-2 border-green-100">
                <div className="text-3xl mb-2">💰</div>
                <p className="text-xs font-semibold text-gray-700">Fast Payout</p>
                <p className="text-xs text-green-600 font-bold">90%</p>
              </div>

              <div className="absolute top-24 -left-14 w-28 h-28 bg-white rounded-2xl shadow-xl p-3 animate-float animation-delay-2500 hidden lg:block border-2 border-emerald-100">
                <div className="text-2xl mb-2">🏦</div>
                <p className="text-xs font-semibold text-gray-700">Bank</p>
                <p className="text-xs text-gray-500">Transfer</p>
              </div>

              <div className="absolute -bottom-6 -right-10 w-24 h-24 bg-white rounded-xl shadow-xl p-2 animate-float animation-delay-1500 hidden lg:block border-2 border-green-100">
                <div className="text-2xl mb-1">📊</div>
                <p className="text-xs font-semibold text-gray-700">Track</p>
              </div>

              <div className="absolute bottom-16 -left-8 w-20 h-20 bg-white rounded-xl shadow-xl p-2 animate-float animation-delay-4000 hidden lg:block border-2 border-emerald-100">
                <div className="text-xl mb-1">✅</div>
                <p className="text-xs font-semibold text-gray-600">Safe</p>
              </div>

              {/* Main Mockup */}
              <div className="absolute inset-0 bg-linear-to-br from-green-400 to-emerald-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <Image
                src="/assets/images/Mockups/Mockup_2.png"
                alt="Smartphone wallet interface showing balance and earnings"
                width={450}
                height={900}
                className="relative z-10 w-full h-auto drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

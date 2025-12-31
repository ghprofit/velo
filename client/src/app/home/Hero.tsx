'use client';

import Link from 'next/link';
import Image from 'next/image';
import ScrollReveal from './ScrollReveal';

export default function Hero() {

  return (
    <>
      <section className="relative pt-8 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-20 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-20 right-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 items-center relative z-10">
          <ScrollReveal>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
              <span className="bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Sell your digital content </span>
              <span className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">instantly</span>
              <span className="bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"> Payments in </span>
              <span className="bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">one click</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8 max-w-lg">
              The secure, web-based platform for creators to sell photos, videos, audio,
              and documents via a fast, private unlock link.
            </p>

            <Link
              href="/login"
              className="group relative text-white px-10 py-4 rounded-2xl text-base font-semibold transition-all shadow-lg hover:shadow-2xl mb-8 overflow-hidden inline-block"
              style={{backgroundColor: 'var(--primary-accent)'}}
            >
              <span className="relative z-10">Start Earning Now (Its free)</span>
              <div className="absolute inset-0 bg-linear-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200">
                <div className="p-1.5 rounded-full bg-indigo-100">
                  <svg className="w-4 h-4" style={{color: 'var(--primary-accent)'}} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                </div>
                <span className="text-sm font-semibold" style={{color: 'var(--dark-bg-text)'}}>Instant Setup</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 hover:bg-purple-100 transition-colors duration-200">
                <div className="p-1.5 rounded-full bg-purple-100">
                  <svg className="w-4 h-4" style={{color: 'var(--primary-accent)'}} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                  </svg>
                </div>
                <span className="text-sm font-semibold" style={{color: 'var(--dark-bg-text)'}}>Secure Payments</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 hover:bg-pink-100 transition-colors duration-200">
                <div className="p-1.5 rounded-full bg-pink-100">
                  <svg className="w-4 h-4" style={{color: 'var(--primary-accent)'}} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"/>
                  </svg>
                </div>
                <span className="text-sm font-semibold" style={{color: 'var(--dark-bg-text)'}}>Fast Payouts</span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2} className="relative">
            <div className="relative max-w-[500px] mx-auto h-[480px] sm:h-[630]">
              {/* Dashboard - Behind */}
              <div className="absolute right-0 top-0 w-[75%] sm:w-[70%] z-10 transform hover:scale-105 transition-transform duration-500">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl hover:shadow-indigo-200 transition-shadow duration-300">
                  <Image
                    src="/assets/images/homepage hero section  dashboard.png"
                    alt="VeloLink Dashboard showing available balance, performance chart, and latest sales"
                    width={400}
                    height={480}
                    className="w-full h-auto"
                    priority
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-purple-500/10 to-transparent pointer-events-none"></div>
                </div>
              </div>

              {/* Smartphone Mockup - In Front */}
              <div className="absolute left-[5%] sm:left-[8%] bottom-[10%] w-[35%] sm:w-[30%] z-20 transform hover:scale-110 transition-transform duration-500">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-purple-200 transition-shadow duration-300">
                  <Image
                    src="/assets/images/Mockups/Mockup_2.png"
                    alt="Smartphone showing file upload interface with pricing"
                    width={200}
                    height={420}
                    className="w-full h-auto"
                    priority
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

'use client';

import ScrollReveal from './ScrollReveal';
import Image from 'next/image';

export default function PrivacySection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        <ScrollReveal>
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-linear-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
              <span className="text-sm font-semibold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Your Security Matters
              </span>
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-16 bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            PROFILE SAFETY GUARANTEED
          </h2>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <ScrollReveal delay={0.2}>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-indigo-100">
              <p className="text-lg sm:text-xl leading-relaxed text-gray-700 mb-6">
                Privacy is always guaranteed. VELOLink ensures security through verification
                with Veriff and uses robust content moderation tools to protect all users.
              </p>
              <div className="flex items-center gap-3 text-green-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                </svg>
                <span className="font-semibold text-gray-800">Verified & Protected</span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="relative flex items-center justify-center min-h-[350px]">
              {/* Central Logo with Glow */}
              <div className="w-48 h-48 flex items-center relative">
                <div className="absolute inset-0 bg-linear-to-br from-indigo-400 to-purple-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <Image
                  src="/assets/logo_svgs/Brand_Icon(black).svg"
                  alt="VeloLink logo"
                  width={180}
                  height={60}
                  priority
                  className="relative z-10"
                />
              </div>

              {/* Floating user avatars with enhanced styling */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shadow-xl border-4 border-white animate-float">
                <Image src="assets/images/p1.jpg" alt="User avatar" className="w-full h-full object-cover"/>
              </div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shadow-xl border-4 border-white animate-float animation-delay-1000">
                <Image src="assets/images/p2.webp" alt="User avatar" className="w-full h-full object-cover"/>
              </div>
              <div className="absolute top-1/4 -right-2 w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shadow-xl border-4 border-white animate-float animation-delay-2000">
                <Image src="assets/images/p3.webp" alt="User avatar" className="w-full h-full object-cover"/>
              </div>
              <div className="absolute bottom-1/4 -left-8 w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shadow-xl border-4 border-white animate-float animation-delay-3000">
                <Image src="assets/images/p4.jpg" alt="User avatar" className="w-full h-full object-cover"/>
              </div>
              <div className="absolute -top-8 left-1/4 w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shadow-xl border-4 border-white animate-float animation-delay-4000">
                <Image src="assets/images/p5.webp" alt="User avatar" className="w-full h-full object-cover"/>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

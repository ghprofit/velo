'use client';

import ScrollReveal from './ScrollReveal';

export default function ValueProposition() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-[1000px] mx-auto text-center relative z-10">
        <ScrollReveal>
          {/* Decorative Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-linear-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-sm font-semibold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Accessible Globally
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-linear-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
            Because your content shouldn&apos;t be free.
          </h2>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-[700px] mx-auto mb-12">
            VELOLINK is dedicated to helping creators monetize their passions safely and
            privately using the highest standards of security and compliance.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[800px] mx-auto">
            <div className="group p-6 rounded-2xl bg-linear-to-br from-purple-50 to-indigo-50 border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🌍</div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Global Reach</h3>
              <p className="text-sm text-gray-600">Acessible to creators and audience globally</p>
            </div>

            <div className="group p-6 rounded-2xl bg-linear-to-br from-indigo-50 to-blue-50 border border-indigo-100 hover:border-indigo-300 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🔒</div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Secure & Private</h3>
              <p className="text-sm text-gray-600">Bank-level security standards</p>
            </div>

            <div className="group p-6 rounded-2xl bg-linear-to-br from-pink-50 to-purple-50 border border-pink-100 hover:border-pink-300 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">💰</div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Earn More</h3>
              <p className="text-sm text-gray-600">Maximize your revenue potential</p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}

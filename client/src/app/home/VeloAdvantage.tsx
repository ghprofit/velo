'use client';

import ScrollReveal from './ScrollReveal';

export default function VeloAdvantage() {
  const features = [
    {
      icon: (
        <svg className="w-7 h-7" style={{color: 'var(--primary-accent)'}} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
      ),
      title: 'Content Protection',
      description:
        'Stream media securely and use optional per-item watermarking to stop piracy.',
    },
    {
      icon: (
        <svg className="w-7 h-7" style={{color: 'var(--primary-accent)'}} fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      ),
      title: 'Creator-First Payouts',
      description:
        'You keep 90% of every sale. Funds are available quickly after the standard 7-day buffer.',
    },
    {
      icon: (
        <svg className="w-7 h-7" style={{color: 'var(--primary-accent)'}} fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"/>
        </svg>
      ),
      title: 'Frictionless Purchase',
      description: 'Buyers pay instantly with Apple Pay, Google Pay, or Card.',
    },
    {
      icon: (
        <svg className="w-7 h-7" style={{color: 'var(--primary-accent)'}} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
        </svg>
      ),
      title: 'Privacy First',
      description: 'No profiles needed. Complete anonymity for both creators and buyers.',
    },
  ];

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{backgroundColor: 'var(--card-surface)'}}>
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10">
        <ScrollReveal>
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-linear-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-full">
              <span className="text-sm font-semibold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Why Choose VeloLink
              </span>
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-20 bg-linear-to-r from-indigo-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
            The VELOlink Advantage
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
          {features.map((feature, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 hover:scale-105 hover:-translate-y-2">
                <div className="mb-5 p-3 bg-linear-to-br from-indigo-50 to-purple-50 rounded-xl inline-block group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 bg-linear-to-r from-indigo-900 to-purple-900 bg-clip-text text-transparent">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-base">{feature.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

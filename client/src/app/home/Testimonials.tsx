'use client';

import ScrollReveal from './ScrollReveal';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Content Creator',
      image: '/placeholder-avatar.jpg',
      quote:
        'VELO transformed how I monetize my photography. The security features give me peace of mind.',
    },
    {
      name: 'Sarah M.',
      role: 'Content Creator',
      image: '/placeholder-avatar.jpg',
      quote:
        'VELO transformed how I monetize my photography. The security features give me peace of mind.',
    },
    {
      name: 'Sarah M.',
      role: 'Content Creator',
      image: '/placeholder-avatar.jpg',
      quote:
        'VELO transformed how I monetize my photography. The security features give me peace of mind.',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <ScrollReveal>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-16" style={{color: 'var(--dark-bg-text)'}}>
            What Creators Say
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal key={index} delay={index * 0.15}>
              <div className="rounded-2xl p-7 hover:shadow-lg transition-shadow" style={{backgroundColor: 'var(--card-surface)'}}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    <svg className="w-7 h-7 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-sm" style={{color: 'var(--dark-bg-text)'}}>{testimonial.name}</div>
                    <div className="text-xs text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">&quot;{testimonial.quote}&quot;</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

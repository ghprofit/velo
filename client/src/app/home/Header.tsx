'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 shadow-sm border-b border-gray-100 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-0'}`}>
      <nav className={`max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
        <div className="items-center transform hover:scale-105 transition-transform duration-200">
          <Image
            src="/assets/logo_svgs/Primary_Logo(black).svg"
            alt="VeloLink logo"
            width={isScrolled ? 120 : 150}
            height={isScrolled ? 51 : 64}
            priority
            className="transition-all duration-300"
          />
        </div>

        <div className={`flex flex-col px-2 md:flex-row items-center gap-3 md:gap-6 md:border md:rounded-full md:border-gray-200 md:px-4 md:bg-white/50 md:backdrop-blur-sm md:shadow-sm hover:shadow-md transition-all duration-300 ${isScrolled ? 'py-1.5 md:py-1.5' : 'py-3 md:py-2'}`}>
          <Link href="#faq" className={`text-gray-700 font-semibold hover:text-indigo-600 transition-all duration-200 relative group ${isScrolled ? 'text-xs md:text-sm' : 'text-sm md:text-base'}`} style={{color: 'var(--dark-bg-text)'}}>
            FAQ
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link
            href="/login"
            className={`hidden md:block w-full md:w-auto text-center text-white rounded-full font-semibold transition-all shadow-md hover:shadow-xl group relative overflow-hidden ${isScrolled ? 'px-5 py-2 text-xs md:text-sm' : 'px-6 py-2.5 text-sm md:text-base'}`}
            style={{backgroundColor: 'var(--primary-accent)'}}
          >
            <span className="relative z-10">Login</span>
            <div className="absolute inset-0 bg-linear-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </div>
      </nav>
    </header>
  );
}

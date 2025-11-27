'use client';

import Link from 'next/link';
import { Logo, Button, CheckCircleIcon, ShieldCheckIcon, LockClosedIcon, LightningBoltIcon, CurrencyDollarIcon, GlobeIcon } from '@/components/ui';
import Header from "./home/Header";
import Hero from "./home/Hero";
import ValueProposition from "./home/ValueProposition";
import HowItWorks from "./home/HowItWorks";
import PrivacySection from "./home/PrivacySection";
import VeloAdvantage from "./home/VeloAdvantage";
import FAQ from "./home/FAQ";
import Testimonials from "./home/Testimonials";
import Footer from "./home/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <ValueProposition />
      <HowItWorks />
      <PrivacySection />
      <VeloAdvantage />
      <FAQ />
      <Testimonials />
      <Footer />
    </main>
    // <>
    //   {/* Header */}
    //   <header className="sticky top-0 z-50 border-b border-gray-200 backdrop-blur-lg bg-white/90">
    //     <div className="max-w-7xl mx-auto px-6 py-4">
    //       <div className="flex items-center justify-between">
    //         <Logo size="md" />
    //         <nav className="hidden md:flex items-center gap-8">
    //           <Link href="/features" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
    //             Features
    //           </Link>
    //           <Link href="/pricing" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
    //             Pricing
    //           </Link>
    //           <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
    //             About
    //           </Link>
    //           <Link href="/login">
    //             <Button variant="outline" size="sm">
    //               Login
    //             </Button>
    //           </Link>
    //         </nav>
    //       </div>
    //     </div>
    //   </header>

    //   {/* Hero Section */}
    //   <section className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-20 lg:py-32">
    //     <div className="max-w-7xl mx-auto px-6">
    //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    //         {/* Left - Content */}
    //         <div className="space-y-8">
    //           <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
    //             <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Secure Platform</span>
    //           </div>

    //           <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
    //             Unlock Premium Content Securely
    //           </h1>

    //           <p className="text-xl text-gray-600 leading-relaxed">
    //             VeloLink is your secure gateway to exclusive digital content.
    //             Fast, encrypted, and trusted by creators worldwide.
    //           </p>

    //           <div className="flex flex-col sm:flex-row gap-4">
    //             <Link href="/checkout">
    //               <Button variant="primary" size="lg">
    //                 Get Started
    //               </Button>
    //             </Link>
    //             <Link href="/demo">
    //               <Button variant="outline" size="lg">
    //                 Watch Demo
    //               </Button>
    //             </Link>
    //           </div>

    //           {/* Trust Badges */}
    //           <div className="flex items-center gap-6 pt-4">
    //             <div className="text-sm text-gray-600">Trusted by</div>
    //             <div className="flex gap-4 items-center">
    //               <div className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded text-xs font-medium">
    //                 Stripe
    //               </div>
    //               <div className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded text-xs font-medium">
    //                 VISA
    //               </div>
    //               <div className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded text-xs font-medium">
    //                 Mastercard
    //               </div>
    //             </div>
    //           </div>
    //         </div>

    //         {/* Right - Visual */}
    //         <div className="relative">
    //           <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
    //             <div className="relative w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200">
    //               {/* Map Grid Background */}
    //               <div
    //                 className="absolute inset-0"
    //                 style={{
    //                   backgroundImage: `
    //                     linear-gradient(rgba(200, 200, 200, 0.3) 1px, transparent 1px),
    //                     linear-gradient(90deg, rgba(200, 200, 200, 0.3) 1px, transparent 1px)
    //                   `,
    //                   backgroundSize: '50px 50px'
    //                 }}
    //               />

    //               {/* Map Dots */}
    //               <div className="absolute w-3 h-3 bg-orange-500 rounded-full shadow-md animate-pulse" style={{ top: '15%', left: '25%' }} />
    //               <div className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-md animate-pulse" style={{ top: '20%', left: '45%', animationDelay: '0.2s' }} />
    //               <div className="absolute w-3 h-3 bg-green-500 rounded-full shadow-md animate-pulse" style={{ top: '35%', left: '15%', animationDelay: '0.4s' }} />
    //               <div className="absolute w-3 h-3 bg-purple-500 rounded-full shadow-md animate-pulse" style={{ top: '40%', left: '60%', animationDelay: '0.6s' }} />
    //               <div className="absolute w-3 h-3 bg-orange-500 rounded-full shadow-md animate-pulse" style={{ top: '55%', left: '80%', animationDelay: '0.8s' }} />

    //               {/* Success Badge */}
    //               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg">
    //                 <CheckCircleIcon className="w-5 h-5 text-green-500" />
    //                 <span className="font-semibold text-gray-900">Secure Access</span>
    //                 <ShieldCheckIcon className="w-5 h-5 text-indigo-600" />
    //               </div>
    //             </div>
    //           </div>

    //           {/* Floating Stats */}
    //           <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4">
    //             <div className="text-2xl font-bold text-indigo-600">99.9%</div>
    //             <div className="text-xs text-gray-600">Uptime</div>
    //           </div>

    //           <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-4">
    //             <div className="text-2xl font-bold text-indigo-600">256-bit</div>
    //             <div className="text-xs text-gray-600">Encryption</div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </section>

    //   {/* Features Section */}
    //   <section className="py-20 bg-white">
    //     <div className="max-w-7xl mx-auto px-6">
    //       <div className="text-center mb-16">
    //         <h2 className="text-4xl font-bold text-gray-900 mb-4">
    //           Why Choose VeloLink?
    //         </h2>
    //         <p className="text-xl text-gray-600">
    //           Built for security, designed for simplicity
    //         </p>
    //       </div>

    //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
    //         <div className="text-center space-y-4">
    //           <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto">
    //             <LockClosedIcon className="w-8 h-8 text-indigo-600" />
    //           </div>
    //           <h3 className="text-xl font-bold text-gray-900">Secure</h3>
    //           <p className="text-gray-600">End-to-end encryption ensures your data is always protected</p>
    //         </div>

    //         <div className="text-center space-y-4">
    //           <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
    //             <LightningBoltIcon className="w-8 h-8 text-purple-600" />
    //           </div>
    //           <h3 className="text-xl font-bold text-gray-900">Fast</h3>
    //           <p className="text-gray-600">Instant access to your content with lightning-fast delivery</p>
    //         </div>

    //         <div className="text-center space-y-4">
    //           <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto">
    //             <CurrencyDollarIcon className="w-8 h-8 text-pink-600" />
    //           </div>
    //           <h3 className="text-xl font-bold text-gray-900">Affordable</h3>
    //           <p className="text-gray-600">Competitive pricing with no hidden fees</p>
    //         </div>

    //         <div className="text-center space-y-4">
    //           <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto">
    //             <GlobeIcon className="w-8 h-8 text-orange-600" />
    //           </div>
    //           <h3 className="text-xl font-bold text-gray-900">Global</h3>
    //           <p className="text-gray-600">Access from anywhere in the world, anytime</p>
    //         </div>
    //       </div>
    //     </div>
    //   </section>

    //   {/* CTA Section */}
    //   <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600">
    //     <div className="max-w-4xl mx-auto px-6 text-center">
    //       <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
    //         Ready to Get Started?
    //       </h2>
    //       <p className="text-xl text-indigo-100 mb-8">
    //         Join thousands of users who trust VeloLink for secure content delivery
    //       </p>
    //       <div className="flex flex-col sm:flex-row gap-4 justify-center">
    //         <Link href="/checkout">
    //           <Button variant="outline" size="lg" className="bg-white text-indigo-600 hover:bg-gray-50 border-0">
    //             Start Now
    //           </Button>
    //         </Link>
    //         <Link href="/login">
    //           <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
    //             Login to Your Account
    //           </Button>
    //         </Link>
    //       </div>
    //     </div>
    //   </section>

    //   {/* Footer */}
    //   <footer className="bg-gray-900 text-gray-300 py-12">
    //     <div className="max-w-7xl mx-auto px-6">
    //       <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
    //         <div>
    //           <div className="mb-4">
    //             <Logo size="md" />
    //           </div>
    //           <p className="text-sm text-gray-400">
    //             Secure content delivery platform trusted by creators worldwide.
    //           </p>
    //         </div>

    //         <div>
    //           <h4 className="font-semibold text-white mb-4">Product</h4>
    //           <ul className="space-y-2 text-sm">
    //             <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
    //             <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
    //             <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
    //           </ul>
    //         </div>

    //         <div>
    //           <h4 className="font-semibold text-white mb-4">Company</h4>
    //           <ul className="space-y-2 text-sm">
    //             <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
    //             <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
    //             <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
    //           </ul>
    //         </div>

    //         <div>
    //           <h4 className="font-semibold text-white mb-4">Support</h4>
    //           <ul className="space-y-2 text-sm">
    //             <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
    //             <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
    //             <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
    //           </ul>
    //         </div>
    //       </div>

    //       <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
    //         <p className="text-sm text-gray-400">
    //           © 2025 VeloLink. All rights reserved.
    //         </p>
    //         <div className="flex gap-6">
    //           <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
    //           <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
    //           <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
    //         </div>
    //       </div>
    //     </div>
    //   </footer>
    // </>
  );
}

'use client';

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
    <main className="min-h-screen min-w-screen">
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
  );
}

'use client';

import { useState } from 'react';
import ScrollReveal from './ScrollReveal';

interface FAQItemProps {
  question: string;
  answer: string;
}

interface FAQCategory {
  category: string;
  faqs: FAQItemProps[];
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-offset-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-base" style={{color: 'var(--dark-bg-text)'}}>{question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform shrink-0 ml-4 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-gray-600 leading-relaxed text-sm">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [openCategories, setOpenCategories] = useState<Set<number>>(new Set([0])); // First category open by default

  const toggleCategory = (index: number) => {
    const newOpenCategories = new Set(openCategories);
    if (newOpenCategories.has(index)) {
      newOpenCategories.delete(index);
    } else {
      newOpenCategories.add(index);
    }
    setOpenCategories(newOpenCategories);
  };

  const faqCategories: FAQCategory[] = [
    {
      category: 'Getting Started',
      faqs: [
        {
          question: 'What is Velolink.club?',
          answer:
            'Velolink is a secure service that lets creators monetize their digital content by locking it behind a pay-to-unlock link. You upload your files, set a price, generate a link, and share it — once someone pays, they can download.',
        },
        {
          question: 'How do I start earning as a creator?',
          answer:
            '1. Sign up for a Velolink account. 2. Verify your identity (upload a valid ID + selfie). 3. Add your bank account (it should match your verified identity). 4. Upload your content and set a price. 5. Generate the unlock link and share it wherever you like.',
        },
        {
          question: 'Who can use Velolink?',
          answer:
            'You must be 18 years or older, legally allowed to enter contracts in your country, and comply with Velolink\'s rules about content.',
        },
        {
          question: 'Can I register and receive payouts on Velolink from anywhere around the world?',
          answer:
            'Yes, anywhere around the globe, from every country',
        }
      ],
    },
    {
      category: 'Content & Privacy',
      faqs: [
        {
          question: 'Can someone access my content without paying?',
          answer:
            'No. Velolink\'s system locks the content behind a payment wall, so it\'s not accessible until a buyer pays.',
        },
        {
          question: 'Do I see who bought my content?',
          answer:
            'Nope. Velolink preserves full anonymity: creators don\'t get identifying information about who paid or downloaded their content.',
        },
        {
          question: 'Is Velolink secure?',
          answer:
            'Yes. We use strong encryption to protect your files and personal data. Transactions are monitored to help prevent fraud.',
        },
      ],
    },
    {
      category: 'Payments & Fees',
      faqs: [
        {
          question: 'When do I get paid?',
          answer:
            'After a sale, funds take 3–7 days to appear in your Velolink wallet (for security). Once the money is in your wallet, transferring it to your verified bank account usually takes 24 hours to 48 hours depending on your bank and country.',
        },
        {
          question: 'What are the fees / commission?',
          answer:
            'Velolink charges a 20% commission on each transaction: 10% is taken from the creator\'s side, and 10% from the buyer\'s side, meaning, creators get to keep 90% of their earnings per transaction.',
        },
      ],
    },
    {
      category: 'Identity & Verification',
      faqs: [
        {
          question: 'How does identity verification work?',
          answer:
            'When you register, you need to upload a valid government-issued ID and take a selfie. This helps verify that you\'re a real person and ensures the integrity of the system.',
        },
      ],
    },
    {
      category: 'Using Velolink as a Buyer',
      faqs: [
        {
          question: 'Do I need to have a Velolink account to buy someone\'s content?',
          answer:
            'No! As a buyer, you don\'t need to download anything. You just pay through the link the creator gives you, and then you can download the content.',
        },
        {
          question: 'Are my details shared with the creator when I buy something?',
          answer:
            'No. Buyer anonymity is preserved: creators don\'t see your personal data.',
        },
      ],
    },
    {
      category: 'Safety & Account Management',
      faqs: [
        {
          question: 'Can my Velolink account be suspended?',
          answer:
            'Yes. If you violate Velolink\'s rules, your account can be suspended or terminated.',
        },
        {
          question: 'What content is NOT allowed on Velolink?',
          answer:
            'Velolink prohibits: Content involving minors, non-consensual or illegal content, copyrighted content you don\'t own, and malware, malicious scripts, or illegal files.',
        },
      ],
    },
    {
      category: 'Other',
      faqs: [
        {
          question: 'Where do I promote my Velolink link?',
          answer:
            'Anywhere you like! Share it on social media, in private messages, or embed it on your website.',
        },
        {
          question: 'Can I change the price of my file after setting it?',
          answer:
            'No, pricing is fixed per file once you\'ve set it.',
        },
        {
          question: 'How do I contact Velolink support?',
          answer:
            'You can reach out via support@velolink.club.',
        },
      ],
    },
  ];

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8" style={{backgroundColor: 'var(--card-surface)'}}>
      <div className="max-w-[900px] mx-auto">
        <ScrollReveal>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-16" style={{color: 'var(--dark-bg-text)'}}>
            Frequently Asked Questions
          </h2>
        </ScrollReveal>

        <div className="space-y-6">
          {faqCategories.map((category, categoryIndex) => {
            const isOpen = openCategories.has(categoryIndex);
            return (
              <div key={categoryIndex} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <ScrollReveal delay={categoryIndex * 0.05}>
                  <button
                    onClick={() => toggleCategory(categoryIndex)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-2xl font-bold" style={{color: 'var(--primary-accent)'}}>
                      {category.category}
                    </h3>
                    <svg
                      className={`w-6 h-6 transition-transform shrink-0 ml-4 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      style={{color: 'var(--primary-accent)'}}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </ScrollReveal>
                {isOpen && (
                  <div className="px-6 pb-6 space-y-3">
                    {category.faqs.map((faq, faqIndex) => (
                      <ScrollReveal key={faqIndex} delay={categoryIndex * 0.05 + faqIndex * 0.05}>
                        <FAQItem question={faq.question} answer={faq.answer} />
                      </ScrollReveal>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

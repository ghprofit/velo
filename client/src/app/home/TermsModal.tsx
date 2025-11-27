'use client';

import { useState, useEffect } from 'react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: string;
}

export default function TermsModal({ isOpen, onClose, section }: TermsModalProps) {
  const [content, setContent] = useState({ title: '', body: '' });

  useEffect(() => {
    const termsContent: Record<string, { title: string; body: string }> = {
      features: {
        title: 'How Velolink Works',
        body: `
          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">For Creators</h3>
          <p class="mb-3">Creators can:</p>
          <ul class="list-disc pl-6 space-y-2 mb-6">
            <li>Create an account and complete identity verification</li>
            <li>Upload digital files (photos, videos, documents, etc.)</li>
            <li>Set a selling price for each file</li>
            <li>Generate a unique "unlock link"</li>
            <li>Share the link anywhere (social media, messaging apps, websites)</li>
            <li>Receive payouts after successful purchases</li>
            <li>View analytics and earnings inside the dashboard</li>
          </ul>
          <p class="mb-6"><strong>Creators retain full ownership of all uploaded content.</strong></p>

          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">For Buyers</h3>
          <p class="mb-3">Buyers can:</p>
          <ul class="list-disc pl-6 space-y-2 mb-4">
            <li>Click a Velolink unlock link</li>
            <li>Pay the listed price</li>
            <li>Receive instant access and download rights to the content</li>
            <li>Use downloaded content for personal, non-commercial purposes only</li>
          </ul>
          <p><strong>Buyers do not gain copyright or commercial rights.</strong></p>
        `,
      },
      pricing: {
        title: 'Payments, Fees & Payouts',
        body: `
          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">Payment Processing</h3>
          <p class="mb-6">Velolink uses third-party payment processors. By using Velolink, you also agree to their separate terms and conditions.</p>

          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">Creator Earnings</h3>
          <ul class="list-disc pl-6 space-y-2 mb-6">
            <li>You choose your prices</li>
            <li>Velolink takes a platform fee</li>
            <li>The remaining balance is credited to your creator wallet</li>
            <li>You can request payout after reaching the minimum withdrawal threshold</li>
          </ul>

          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">Payout Details</h3>
          <ul class="list-disc pl-6 space-y-2 mb-6">
            <li>Payouts require verified banking information</li>
            <li>Your payout name must match your legal identity</li>
            <li>Payout timelines depend on your bank and payment processor</li>
            <li>Velolink is not responsible for bank delays or processor disputes</li>
          </ul>

          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">Refunds</h3>
          <p class="mb-3">Due to the nature of digital content, <strong>all purchases are final.</strong></p>
          <p class="mb-2">Refunds may be issued only if:</p>
          <ul class="list-disc pl-6 space-y-2 mb-4">
            <li>A payment was made fraudulently (proof required)</li>
            <li>The buyer did not receive access due to a Velolink system error</li>
          </ul>
          <p class="mb-2">Refunds are NOT granted if:</p>
          <ul class="list-disc pl-6 space-y-2">
            <li>You didn't like the content</li>
            <li>You downloaded it already</li>
            <li>The creator's identity or appearance didn't match your expectations</li>
            <li>You shared your download link with others</li>
          </ul>
        `,
      },
      security: {
        title: 'Security & Verification',
        body: `
          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">User Verification</h3>
          <p class="mb-4">Velolink uses third-party services to verify user identity and age.</p>
          <p class="mb-2">You agree to:</p>
          <ul class="list-disc pl-6 space-y-2 mb-6">
            <li>Submit real and accurate documents</li>
            <li>Allow us and our verification partners to process your data</li>
            <li>Avoid impersonation, false identity, or fraudulent documents</li>
          </ul>
          <p class="mb-6"><strong>Failure to pass verification may result in account suspension or termination.</strong></p>

          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">Privacy & Data Protection</h3>
          <p class="mb-3">Velolink collects and processes user data as described in its Privacy Policy.</p>
          <p class="mb-2">We take measures to protect:</p>
          <ul class="list-disc pl-6 space-y-2 mb-4">
            <li>Payment data</li>
            <li>Identity documents</li>
            <li>Uploaded content</li>
            <li>Account activity</li>
          </ul>
          <p><strong>We do not publicly display user identity or banking information.</strong></p>
        `,
      },
      privacy: {
        title: 'Privacy & Data',
        body: `
          <p class="mb-4">Velolink collects and processes user data as described in its Privacy Policy.</p>

          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">What We Protect</h3>
          <ul class="list-disc pl-6 space-y-2 mb-6">
            <li>Payment data</li>
            <li>Identity documents</li>
            <li>Uploaded content</li>
            <li>Account activity</li>
          </ul>

          <p class="mb-6"><strong>We do not publicly display user identity or banking information.</strong></p>

          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">Risk Disclaimer</h3>
          <p class="mb-2">You acknowledge the following risks:</p>
          <ul class="list-disc pl-6 space-y-2">
            <li>Digital content may be shared outside the platform</li>
            <li>Payments may be delayed due to processor issues</li>
            <li>Banking or withdrawal delays are outside Velolink's control</li>
            <li>Creators are responsible for ensuring uploads comply with copyright and law</li>
            <li>Buyers must verify that they are opening links safely and responsibly</li>
          </ul>
          <p class="mt-4"><strong>Velolink is not liable for third-party actions.</strong></p>
        `,
      },
      terms: {
        title: 'Terms of Service',
        body: `
          <p class="mb-4"><strong>Last Updated: 15th December 2025</strong></p>
          <p class="mb-6">These Terms of Service ("Terms") set out the rules for using Velolink.club. By creating an account or using any service offered on Velolink.club, you agree to be bound by these Terms.</p>

          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">Eligibility</h3>
          <p class="mb-2">To use Velolink:</p>
          <ul class="list-disc pl-6 space-y-2 mb-6">
            <li>You must be at least 18 years old</li>
            <li>You must provide accurate personal details during registration and verification</li>
            <li>You must not use Velolink for any illegal activity</li>
            <li>You must comply with the laws of your country when uploading or purchasing content</li>
          </ul>

          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">Content Ownership & Licensing</h3>
          <p class="mb-3"><strong>Creator Intellectual Property:</strong> Creators retain full ownership of their uploads.</p>
          <p class="mb-3">By uploading, you grant Velolink a non-exclusive, worldwide license to host, display, encrypt, and distribute to buyers who have paid.</p>
          <p class="mb-6"><strong>Buyer License:</strong> When buyers purchase content, they receive a limited, personal-use license with no right to redistribute or resell.</p>

          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">Account Termination</h3>
          <p class="mb-2">Velolink may suspend or terminate accounts for:</p>
          <ul class="list-disc pl-6 space-y-2 mb-4">
            <li>Repeated violations of platform rules</li>
            <li>Uploading illegal content</li>
            <li>Fraud, impersonation, or chargeback abuse</li>
            <li>Attempted scams</li>
            <li>Verifying with false information</li>
            <li>Orders from law enforcement</li>
          </ul>

          <p class="mt-4 text-sm text-gray-600">For the complete Terms of Service, please contact support@velolink.club</p>
        `,
      },
      compliance: {
        title: 'Compliance & Platform Rules',
        body: `
          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">Creator Responsibilities</h3>
          <p class="mb-3"><strong>You Own What You Upload:</strong> You must upload only content you created, or content for which you have full legal rights to sell.</p>

          <h4 class="text-lg font-semibold mb-2">Forbidden Content</h4>
          <p class="mb-2">You are strictly prohibited from uploading:</p>
          <ul class="list-disc pl-6 space-y-2 mb-6">
            <li>Underage content or any material involving minors</li>
            <li>Revenge porn or content uploaded without consent</li>
            <li>Bestiality or illegal sexual content</li>
            <li>Content that violates copyright</li>
            <li>Deepfakes or AI-generated images designed to impersonate real people without permission</li>
            <li>Malware, harmful scripts, or phishing material</li>
            <li>Anything illegal under international law</li>
          </ul>
          <p class="mb-6"><strong>Violations may lead to immediate account suspension and termination.</strong></p>

          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">Buyer Responsibilities</h3>
          <p class="mb-2">When purchasing content on Velolink, you agree to:</p>
          <ul class="list-disc pl-6 space-y-2 mb-6">
            <li>Pay the full listed amount before access is granted</li>
            <li>Use the content only for personal use</li>
            <li>Not repost, resell, re-share, screen-record, or distribute the content</li>
            <li>Not reverse engineer, scrape, or hack the Velolink system</li>
            <li>Not claim copyright ownership of purchased content</li>
          </ul>

          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">Platform Rules</h3>
          <p class="mb-2">You may not:</p>
          <ul class="list-disc pl-6 space-y-2">
            <li>Attempt to hack, decompile, reverse engineer, or scrape Velolink</li>
            <li>Interfere with site performance</li>
            <li>Share exploit instructions</li>
            <li>Use bots, crawlers, automation, or scripts</li>
            <li>Harass, threaten, or abuse any user</li>
            <li>Create multiple accounts to avoid bans</li>
            <li>Engage in fraud or chargeback abuse</li>
          </ul>
          <p class="mt-4"><strong>Violations may lead to permanent suspension.</strong></p>
        `,
      },
      help: {
        title: 'Help Center',
        body: `
          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">Need Assistance?</h3>
          <p class="mb-6">We're here to help! For support or inquiries, please reach out to our team.</p>

          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">Contact Information</h3>
          <p class="mb-4">Email: <a href="mailto:support@velolink.club" class="underline" style="color: var(--primary-accent)">support@velolink.club</a></p>
          <p class="mb-6">Website: <a href="https://velolink.club" class="underline" style="color: var(--primary-accent)">https://velolink.club</a></p>

          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">Disputes & Resolution</h3>
          <p class="mb-4">For any disputes, contact support@velolink.club. Velolink will attempt to resolve issues informally first.</p>
        `,
      },
      contact: {
        title: 'Contact Information',
        body: `
          <h3 class="text-xl font-bold mb-4" style="color: var(--primary-accent)">Get in Touch</h3>
          <p class="mb-6">For support or legal inquiries, please contact us:</p>

          <div class="bg-gray-50 rounded-xl p-6 mb-6">
            <p class="mb-3"><strong>Email:</strong></p>
            <p class="mb-4"><a href="mailto:support@velolink.club" class="text-lg underline" style="color: var(--primary-accent)">support@velolink.club</a></p>

            <p class="mb-3"><strong>Website:</strong></p>
            <p><a href="https://velolink.club" class="text-lg underline" style="color: var(--primary-accent)">https://velolink.club</a></p>
          </div>

          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">Response Time</h3>
          <p>We strive to respond to all inquiries within 12 hours during business days.</p>
        `,
      },
      status: {
        title: 'Service Availability',
        body: `
          <p class="mb-6">Velolink strives to keep services online 24/7.</p>

          <h3 class="text-xl font-bold mb-3" style="color: var(--primary-accent)">Maintenance & Downtime</h3>
          <p class="mb-2">We may temporarily suspend services for:</p>
          <ul class="list-disc pl-6 space-y-2 mb-6">
            <li>Security reviews</li>
            <li>Server maintenance</li>
            <li>Software updates</li>
            <li>Payment processor downtime</li>
            <li>Force majeure events</li>
          </ul>

          <p class="mb-4"><strong>If services are unavailable for more than 48 hours, we will alert users via email or dashboard.</strong></p>

          <div class="bg-gray-50 rounded-xl p-6">
            <p class="mb-2"><strong>Current Status:</strong></p>
            <p class="text-lg" style="color: var(--primary-accent)">✓ All Systems Operational</p>
          </div>
        `,
      },
    };

    setContent(termsContent[section] || termsContent.terms);
  }, [section]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-8 max-w-3xl w-full my-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--dark-bg-text)' }}>
          {content.title}
        </h2>

        <div
          className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Last Updated: 15th December 2025
          </p>
        </div>
      </div>
    </div>
  );
}

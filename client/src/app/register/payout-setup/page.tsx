'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { payoutApi } from '@/lib/api-client';
import Image from 'next/image';

export default function PayoutSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');

  const [formData, setFormData] = useState({
    bankAccountName: '',
    bankName: '',
    bankAccountNumber: '',
    bankRoutingNumber: '',
    bankSwiftCode: '',
    bankIban: '',
    bankCountry: '',
    bankCurrency: 'USD',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.bankAccountName || !formData.bankName || !formData.bankAccountNumber || !formData.bankCountry) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // Validate account number confirmation
      if (formData.bankAccountNumber !== confirmAccountNumber) {
        setError('Account numbers do not match');
        setIsLoading(false);
        return;
      }

      // Prepare payload - only send non-empty optional fields
      const payload: {
        bankAccountName: string;
        bankName: string;
        bankAccountNumber: string;
        bankCountry: string;
        bankCurrency: string;
        bankRoutingNumber?: string;
        bankSwiftCode?: string;
        bankIban?: string;
      } = {
        bankAccountName: formData.bankAccountName,
        bankName: formData.bankName,
        bankAccountNumber: formData.bankAccountNumber,
        bankCountry: formData.bankCountry,
        bankCurrency: formData.bankCurrency,
      };

      if (formData.bankRoutingNumber) payload.bankRoutingNumber = formData.bankRoutingNumber;
      if (formData.bankSwiftCode) payload.bankSwiftCode = formData.bankSwiftCode;
      if (formData.bankIban) payload.bankIban = formData.bankIban;

      await payoutApi.setupBankAccount(payload);

      // Navigate to creator dashboard
      router.push('/creator');
    } catch (err: unknown) {
      console.error('Payout setup error:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to setup payout account. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/creator');
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo" width={120} height={32} className="h-8" />
          </div>

          {/* Mobile: Simplified Step Indicator (Dots) */}
          <div className="flex md:hidden items-center justify-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
          </div>

          {/* Desktop: Full Step Indicator */}
          <div className="hidden md:flex items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              {/* Step 1 - Registration (Completed) */}
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold text-lg">
                ✓
              </div>

              {/* Line */}
              <div className="w-15 h-0.5 bg-green-500"></div>

              {/* Step 2 - Email Verification (Completed) */}
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold text-lg">
                ✓
              </div>

              {/* Line */}
              <div className="w-15 h-0.5 bg-green-500"></div>

              {/* Step 3 - KYC Verification (Completed) */}
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold text-lg">
                ✓
              </div>

              {/* Line */}
              <div className="w-15 h-0.5 bg-indigo-600"></div>

              {/* Step 4 - Payout Setup (Current) */}
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-lg">
                4
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mb-10">
            Step 4 of 4: Payout Setup
          </p>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Title */}
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Set Up Your Payout Account
              </h1>
              <p className="text-sm text-gray-600 max-w-xl mx-auto">
                Please provide your local bank account details. This is where your cleared earnings will be deposited.
              </p>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Secure Encryption. Your financial data is protected.
                  </p>
                </div>
              </div>
            </div>

            {/* Info Notice */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-600">
                Funds are available after the standard 7-day holding period. 9-digit routing number for US banks, 8-digit sort code for UK banks.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Country of Bank Account */}
              <div>
                <label htmlFor="bankCountry" className="block text-sm font-medium text-gray-700 mb-2">
                  Country of Bank Account <span className="text-red-500">*</span>
                </label>
                <select
                  id="bankCountry"
                  name="bankCountry"
                  required
                  value={formData.bankCountry}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select your country</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="ES">Spain</option>
                  <option value="IT">Italy</option>
                  <option value="NL">Netherlands</option>
                  <option value="AU">Australia</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Account Holder Full Name */}
              <div>
                <label htmlFor="bankAccountName" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="bankAccountName"
                  name="bankAccountName"
                  type="text"
                  required
                  value={formData.bankAccountName}
                  onChange={handleChange}
                  placeholder="Must match your KYC verified name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">This must exactly match the name used during KYC</p>
              </div>

              {/* Bank Name */}
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="bankName"
                  name="bankName"
                  type="text"
                  required
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="Enter your bank name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Routing/Sort Code (for US/UK banks) */}
              {(formData.bankCountry === 'US' || formData.bankCountry === 'GB') && (
                <div>
                  <label htmlFor="bankRoutingNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Routing/Sort Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="bankRoutingNumber"
                    name="bankRoutingNumber"
                    type="text"
                    required
                    value={formData.bankRoutingNumber}
                    onChange={handleChange}
                    placeholder="Enter routing or sort code"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.bankCountry === 'US'
                      ? '9-digit routing number for US banks'
                      : '8-digit sort code for UK banks'}
                  </p>
                </div>
              )}

              {/* Account Number */}
              <div>
                <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  type="text"
                  required
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="Enter your account number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Confirm Account Number */}
              <div>
                <label htmlFor="confirmAccountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmAccountNumber"
                  name="confirmAccountNumber"
                  type="text"
                  required
                  value={confirmAccountNumber}
                  onChange={(e) => setConfirmAccountNumber(e.target.value)}
                  placeholder="Re-enter your account number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* SWIFT Code (for international banks) */}
              {formData.bankCountry && formData.bankCountry !== 'US' && (
                <div>
                  <label htmlFor="bankSwiftCode" className="block text-sm font-medium text-gray-700 mb-2">
                    SWIFT/BIC Code
                  </label>
                  <input
                    id="bankSwiftCode"
                    name="bankSwiftCode"
                    type="text"
                    value={formData.bankSwiftCode}
                    onChange={handleChange}
                    placeholder="Optional for international transfers"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* IBAN (for European banks) */}
              {['DE', 'FR', 'ES', 'IT', 'NL', 'GB'].includes(formData.bankCountry) && (
                <div>
                  <label htmlFor="bankIban" className="block text-sm font-medium text-gray-700 mb-2">
                    IBAN
                  </label>
                  <input
                    id="bankIban"
                    name="bankIban"
                    type="text"
                    value={formData.bankIban}
                    onChange={handleChange}
                    placeholder="Optional - International Bank Account Number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Skip for Now
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Continue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

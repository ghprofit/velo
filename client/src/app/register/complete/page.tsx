'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import Image from 'next/image';

export default function CompletePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [country, setCountry] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [routingCode, setRoutingCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!country) {
      newErrors.country = 'Please select your country';
    }

    if (!accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required';
    } else if (accountHolderName.trim().length < 2) {
      newErrors.accountHolderName = 'Name must be at least 2 characters';
    }

    if (!bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!routingCode.trim()) {
      newErrors.routingCode = 'Routing/Sort code is required';
    }

    if (!accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    }

    if (!confirmAccountNumber.trim()) {
      newErrors.confirmAccountNumber = 'Please confirm your account number';
    } else if (accountNumber !== confirmAccountNumber) {
      newErrors.confirmAccountNumber = 'Account numbers do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      country: true,
      accountHolderName: true,
      bankName: true,
      routingCode: true,
      accountNumber: true,
      confirmAccountNumber: true,
    });

    if (validateForm()) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        // Save payout data and navigate to creator dashboard
        console.log('Payout data:', { country, accountHolderName, bankName, routingCode, accountNumber });
        router.push('/creator');
      }, 1500);
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
            <Image src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo"/>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              {/* Step 1 (Completed) */}
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold text-lg">
                1
              </div>

              {/* Line */}
              <div className="w-15 h-0.5 bg-green-500"></div>

              {/* Step 2 (Completed) */}
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold text-lg">
                2
              </div>

              {/* Line */}
              <div className="w-15 h-0.5 bg-green-500"></div>

              {/* Step 3 (Current) */}
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold text-lg">
                3
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Set Up Your Payout Account
            </h1>
            <p className="text-sm text-gray-600">
              Step 3 of 3: Payout Details
            </p>
          </div>

          {/* Description */}
          <p className="text-center text-gray-600 mb-6">
            Please provide your local bank account details. This is where your cleared earnings will be deposited.
          </p>

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-sm font-medium text-green-900">
                Secure Encryption. Your financial data is protected.
              </p>
            </div>
          </div>

          {/* Holding Period Notice */}
          <p className="text-center text-sm text-gray-500 mb-8">
            Funds are available after the standard 7-day holding period.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-semibold text-gray-900 mb-2">
                Country of Bank Account <span className="text-red-500">*</span>
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                onBlur={() => handleBlur('country')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white text-gray-700 ${
                  touched.country && errors.country
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-indigo-500'
                }`}
                required
              >
                <option value="">Select your country</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="ES">Spain</option>
                <option value="IT">Italy</option>
                <option value="NL">Netherlands</option>
                <option value="other">Other</option>
              </select>
              {touched.country && errors.country && (
                <p className="mt-1.5 text-sm text-red-600">{errors.country}</p>
              )}
            </div>

            {/* Account Holder Name */}
            <div>
              <label htmlFor="accountHolderName" className="block text-sm font-semibold text-gray-900 mb-2">
                Account Holder Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="accountHolderName"
                type="text"
                placeholder="Must match your KYC verified name"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                onBlur={() => handleBlur('accountHolderName')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                  touched.accountHolderName && errors.accountHolderName
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-indigo-500'
                }`}
                required
              />
              <p className="mt-1.5 text-xs text-gray-500">
                This must exactly match the name verified during KYC
              </p>
              {touched.accountHolderName && errors.accountHolderName && (
                <p className="mt-1.5 text-sm text-red-600">{errors.accountHolderName}</p>
              )}
            </div>

            {/* Bank Name */}
            <div>
              <label htmlFor="bankName" className="block text-sm font-semibold text-gray-900 mb-2">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <input
                id="bankName"
                type="text"
                placeholder="Enter your bank name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                onBlur={() => handleBlur('bankName')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                  touched.bankName && errors.bankName
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-indigo-500'
                }`}
                required
              />
              {touched.bankName && errors.bankName && (
                <p className="mt-1.5 text-sm text-red-600">{errors.bankName}</p>
              )}
            </div>

            {/* Routing/Sort Code */}
            <div>
              <label htmlFor="routingCode" className="block text-sm font-semibold text-gray-900 mb-2">
                Routing/Sort Code <span className="text-red-500">*</span>
              </label>
              <input
                id="routingCode"
                type="text"
                placeholder="Enter routing or sort code"
                value={routingCode}
                onChange={(e) => setRoutingCode(e.target.value)}
                onBlur={() => handleBlur('routingCode')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                  touched.routingCode && errors.routingCode
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-indigo-500'
                }`}
                required
              />
              <p className="mt-1.5 text-xs text-gray-500">
                9-digit routing number for US banks, 6-digit sort code for UK banks
              </p>
              {touched.routingCode && errors.routingCode && (
                <p className="mt-1.5 text-sm text-red-600">{errors.routingCode}</p>
              )}
            </div>

            {/* Account Number */}
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-semibold text-gray-900 mb-2">
                Account Number <span className="text-red-500">*</span>
              </label>
              <input
                id="accountNumber"
                type="text"
                placeholder="Enter your account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                onBlur={() => handleBlur('accountNumber')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                  touched.accountNumber && errors.accountNumber
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-indigo-500'
                }`}
                required
              />
              {touched.accountNumber && errors.accountNumber && (
                <p className="mt-1.5 text-sm text-red-600">{errors.accountNumber}</p>
              )}
            </div>

            {/* Confirm Account Number */}
            <div>
              <label htmlFor="confirmAccountNumber" className="block text-sm font-semibold text-gray-900 mb-2">
                Confirm Account Number <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmAccountNumber"
                type="text"
                placeholder="Re-enter your account number"
                value={confirmAccountNumber}
                onChange={(e) => setConfirmAccountNumber(e.target.value)}
                onBlur={() => handleBlur('confirmAccountNumber')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                  touched.confirmAccountNumber && errors.confirmAccountNumber
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-indigo-500'
                }`}
                required
              />
              {touched.confirmAccountNumber && errors.confirmAccountNumber && (
                <p className="mt-1.5 text-sm text-red-600">{errors.confirmAccountNumber}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              className="text-base py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold mt-8"
            >
              {isLoading ? 'Processing...' : 'Finish & Go to Dashboard'}
            </Button>

            {/* Skip Link */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={handleSkip}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                I will set this up later (Skip)
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

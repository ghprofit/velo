'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { earningsApi, payoutApi } from '@/lib/api-client';

interface RequestPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onSuccess?: () => void;
}

interface BankAccount {
  bankAccountName: string;
  bankName: string;
  bankAccountNumber: string;
  payoutSetupCompleted: boolean;
}

export default function RequestPayoutModal({ isOpen, onClose, availableBalance, onSuccess }: RequestPayoutModalProps) {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [loadingBankInfo, setLoadingBankInfo] = useState(true);

  // Fetch bank account info when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchBankAccount();
    }
  }, [isOpen]);

  const fetchBankAccount = async () => {
    try {
      setLoadingBankInfo(true);
      const response = await payoutApi.getBankAccountInfo();
      setBankAccount(response.data.data);
    } catch (err: unknown) {
      console.error('Error fetching bank account:', err);
      setBankAccount(null);
    } finally {
      setLoadingBankInfo(false);
    }
  };

  const handleMaxClick = () => {
    setAmount(availableBalance.toFixed(2));
  };

  const handleManagePayoutMethods = () => {
    router.push('/creator/settings#payout');
    onClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
    setError(null);
  };

  const processingFee = parseFloat(amount) > 0 ? 1.00 : 0;
  const netPayout = parseFloat(amount || '0') - processingFee;

  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      setError('Please enter a valid amount');
      return false;
    }
    if (numAmount < 50) {
      setError('Minimum payout amount is $50');
      return false;
    }
    if (numAmount > availableBalance) {
      setError(`Amount exceeds available balance ($${availableBalance.toFixed(2)})`);
      return false;
    }
    if (!confirmChecked) {
      setError('Please confirm the payout details');
      return false;
    }
    return true;
  };

  const handleConfirm = async () => {
    if (!validateAmount()) return;

    setIsLoading(true);
    setError(null);

    try {
      await earningsApi.requestPayout(parseFloat(amount));
      onClose();
      onSuccess?.();
      // Reset form
      setAmount('');
      setConfirmChecked(false);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(errorMessage || 'Failed to request payout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Request Payout</h2>
              <p className="text-gray-600">Withdraw funds from your available VELOLink balance.</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Available Balance */}
          <div className="bg-linear-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
            <p className="text-indigo-100 text-sm mb-2">Your Available Balance</p>
            <div className="flex items-center justify-between">
              <p className="text-4xl font-bold">${availableBalance.toFixed(2)}</p>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Payout Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Payout Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium">USD $</span>
              </div>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="w-full pl-20 pr-24 py-4 text-2xl border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
              <button
                onClick={handleMaxClick}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
              >
                Max
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Enter the amount you wish to withdraw (minimum $50.00)
            </p>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Select Payout Method */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-900">
                Select Payout Method
              </label>
              <button 
                onClick={handleManagePayoutMethods}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Manage Payout Methods
              </button>
            </div>

            {loadingBankInfo ? (
              <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-center justify-center gap-2 py-4">
                  <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-gray-600">Loading payment methods...</span>
                </div>
              </div>
            ) : bankAccount?.payoutSetupCompleted ? (
              <div className="border-2 border-indigo-500 rounded-xl p-4 bg-indigo-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full border-4 border-indigo-600 bg-white"></div>
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{bankAccount.bankName || 'Bank Account'}</p>
                      <p className="text-sm text-gray-600">
                        {bankAccount.bankAccountName} •••• {bankAccount.bankAccountNumber?.slice(-4) || '****'}
                      </p>
                    </div>
                  </div>
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleManagePayoutMethods}
                className="w-full border-2 border-dashed border-gray-300 hover:border-indigo-500 rounded-xl p-6 bg-gray-50 hover:bg-indigo-50/30 transition-all group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 group-hover:bg-indigo-100 rounded-lg flex items-center justify-center transition-colors">
                    <svg className="w-7 h-7 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">Add Bank Details</p>
                    <p className="text-sm text-gray-500 mt-1">Set up your payout method to receive funds</p>
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Payout Summary */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="font-semibold text-gray-900">Payout Summary</h3>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Requested Amount</span>
                <span className="font-semibold text-gray-900">${parseFloat(amount || '0').toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">VELOLink Processing Fee</span>
                <span className="font-semibold text-gray-900">- ${processingFee.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Net Payout</span>
                  <span className="text-2xl font-bold text-indigo-600">${netPayout.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">Estimated Arrival</p>
                <p className="text-sm text-blue-700">Funds arrive in 0-24 working hours</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center mt-3">
              Fees may vary based on region and payment provider.
            </p>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmChecked}
              onChange={(e) => setConfirmChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">
              I confirm this payout request and acknowledge any applicable{' '}
              <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">fees</a>
              {' '}and{' '}
              <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">terms</a>.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!confirmChecked || parseFloat(amount || '0') < 50 || isLoading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Confirm & Request Payout
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

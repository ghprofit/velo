'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Logo, Button, LockClosedIcon, Input } from '@/components/ui';

type PaymentMethod = 'card' | 'apple' | 'google' | 'cash';

interface ValidationErrors {
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  nameOnCard?: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  // Format expiry date as MM / YY
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + ' / ' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  // Validate card number (Luhn algorithm)
  const validateCardNumber = (number: string): boolean => {
    const cleaned = number.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  // Validate expiry date
  const validateExpiryDate = (date: string): boolean => {
    const cleaned = date.replace(/\D/g, '');
    if (cleaned.length !== 4) return false;

    const month = parseInt(cleaned.slice(0, 2));
    const year = parseInt('20' + cleaned.slice(2, 4));

    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }

    return true;
  };

  // Validate CVV
  const validateCVV = (cvvValue: string): boolean => {
    return /^\d{3,4}$/.test(cvvValue);
  };

  // Validate name
  const validateName = (name: string): boolean => {
    return name.trim().length >= 3;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!validateCardNumber(cardNumber)) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!validateExpiryDate(expiryDate)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM / YY)';
    }

    if (!validateCVV(cvv)) {
      newErrors.cvv = 'Please enter a valid CVV (3-4 digits)';
    }

    if (!validateName(nameOnCard)) {
      newErrors.nameOnCard = 'Please enter the name as it appears on the card';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle card number change
  const handleCardNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (/^\d*$/.test(value) && value.length <= 19) {
      setCardNumber(formatCardNumber(value));
      if (touched.cardNumber) {
        setErrors(prev => ({
          ...prev,
          cardNumber: validateCardNumber(formatCardNumber(value)) ? undefined : 'Please enter a valid card number'
        }));
      }
    }
  };

  // Handle expiry date change
  const handleExpiryDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setExpiryDate(formatExpiryDate(value));
      if (touched.expiryDate) {
        setErrors(prev => ({
          ...prev,
          expiryDate: validateExpiryDate(formatExpiryDate(value)) ? undefined : 'Please enter a valid expiry date'
        }));
      }
    }
  };

  // Handle CVV change
  const handleCVVChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 4) {
      setCvv(value);
      if (touched.cvv) {
        setErrors(prev => ({
          ...prev,
          cvv: validateCVV(value) ? undefined : 'Please enter a valid CVV'
        }));
      }
    }
  };

  // Handle name change
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow letters, spaces, hyphens, and apostrophes
    if (/^[a-zA-Z\s'-]*$/.test(value)) {
      setNameOnCard(value);
      if (touched.nameOnCard) {
        setErrors(prev => ({
          ...prev,
          nameOnCard: validateName(value) ? undefined : 'Please enter a valid name'
        }));
      }
    }
  };

  // Handle field blur
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    // Validate the specific field on blur
    const newErrors = { ...errors };

    switch (field) {
      case 'cardNumber':
        newErrors.cardNumber = validateCardNumber(cardNumber) ? undefined : 'Please enter a valid card number';
        break;
      case 'expiryDate':
        newErrors.expiryDate = validateExpiryDate(expiryDate) ? undefined : 'Please enter a valid expiry date';
        break;
      case 'cvv':
        newErrors.cvv = validateCVV(cvv) ? undefined : 'Please enter a valid CVV';
        break;
      case 'nameOnCard':
        newErrors.nameOnCard = validateName(nameOnCard) ? undefined : 'Please enter a valid name';
        break;
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      cardNumber: true,
      expiryDate: true,
      cvv: true,
      nameOnCard: true,
    });

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Handle payment logic here
    console.log('Payment:', { cardNumber, expiryDate, cvv, nameOnCard, saveCard });

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to success page
      router.push('/checkout/success');
    }, 2000);
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <LockClosedIcon className="w-4 h-4" />
            <span className="font-semibold text-gray-900">Secure Checkout</span>
            <span className="text-gray-500">• End-to-end encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-gray-50 min-h-[calc(100vh-180px)] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Side - Payment Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Choose Payment Method
                  </h1>
                  <p className="text-sm text-gray-600">
                    All transactions are encrypted and secure.
                  </p>
                </div>

                {/* Payment Method Tabs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all ${
                      paymentMethod === 'card'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple')}
                    className={`px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all ${
                      paymentMethod === 'apple'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Apple Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('google')}
                    className={`px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all ${
                      paymentMethod === 'google'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Google Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Cash App
                  </button>
                </div>

                {/* Card Payment Form */}
                {paymentMethod === 'card' && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Card Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        onBlur={() => handleBlur('cardNumber')}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                          errors.cardNumber ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                        }`}
                        required
                      />
                      {errors.cardNumber && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.cardNumber}</p>
                      )}
                    </div>

                    {/* Expiry Date & CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM / YY"
                          value={expiryDate}
                          onChange={handleExpiryDateChange}
                          onBlur={() => handleBlur('expiryDate')}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                            errors.expiryDate ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                          }`}
                          required
                        />
                        {errors.expiryDate && (
                          <p className="mt-1.5 text-sm text-red-600">{errors.expiryDate}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="•••"
                          value={cvv}
                          onChange={handleCVVChange}
                          onBlur={() => handleBlur('cvv')}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                            errors.cvv ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                          }`}
                          maxLength={4}
                          required
                        />
                        {errors.cvv && (
                          <p className="mt-1.5 text-sm text-red-600">{errors.cvv}</p>
                        )}
                      </div>
                    </div>

                    {/* Name on Card */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        placeholder="John Creates"
                        value={nameOnCard}
                        onChange={handleNameChange}
                        onBlur={() => handleBlur('nameOnCard')}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                          errors.nameOnCard ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                        }`}
                        required
                      />
                      {errors.nameOnCard && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.nameOnCard}</p>
                      )}
                    </div>

                    {/* Save Card Checkbox */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="saveCard"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="saveCard" className="text-sm text-gray-700 cursor-pointer">
                        Save card for faster checkout next time.
                      </label>
                    </div>

                    {/* Pay Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      isLoading={isLoading}
                      className="text-base py-3.5"
                    >
                      {isLoading ? 'Processing...' : 'Pay $10.49'}
                    </Button>

                    {/* Secured by Stripe */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <LockClosedIcon className="w-4 h-4" />
                      <span>Secured by Stripe</span>
                    </div>
                  </form>
                )}

                {/* Other Payment Methods */}
                {paymentMethod !== 'card' && (
                  <div className="py-12 text-center">
                    <p className="text-gray-600">
                      {paymentMethod === 'apple' && 'Apple Pay integration coming soon'}
                      {paymentMethod === 'google' && 'Google Pay integration coming soon'}
                      {paymentMethod === 'cash' && 'Cash App integration coming soon'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Content</div>
                    <div className="font-semibold text-gray-900">Exclusive Studio Tour</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">Creator</div>
                    <div className="font-semibold text-gray-900">@johncreates</div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Price</span>
                      <span className="font-semibold text-gray-900">$9.99</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-600">Fee</span>
                      <span className="font-semibold text-gray-900">$0.50</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <span className="text-base font-bold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-indigo-600">$10.49</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  No recurring charges. One-time payment only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-6 mb-4">
            <span className="text-sm text-gray-600 font-medium">Stripe</span>
            <span className="text-sm text-gray-600 font-medium">Visa</span>
            <span className="text-sm text-gray-600 font-medium">Mastercard</span>
            <span className="text-sm text-gray-600 font-medium">Apple Pay</span>
          </div>
          <p className="text-sm text-gray-500 text-center">
            Transactions processed securely by Velo.
          </p>
        </div>
      </footer>
    </>
  );
}

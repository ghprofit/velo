'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { useRegister } from '@/hooks/useRegister';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/ui/PageTransition';
import { staggerContainer, staggerItem, scaleInBounce } from '@/lib/animations';
import { ProgressDots } from '@/components/ui/ProgressBar';
import FloatingLogo from '@/components/FloatingLogo';

const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'CV', name: 'Cabo Verde' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CA', name: 'Canada' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'CD', name: 'Democratic Republic of the Congo' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'EE', name: 'Estonia' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'CI', name: 'Ivory Coast' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: 'Laos' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' },
  { code: 'MT', name: 'Malta' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MX', name: 'Mexico' },
  { code: 'FM', name: 'Micronesia' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KP', name: 'North Korea' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PW', name: 'Palau' },
  { code: 'PS', name: 'Palestine' },
  { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'WS', name: 'Samoa' },
  { code: 'SM', name: 'San Marino' },
  { code: 'ST', name: 'Sao Tome and Principe' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'VA', name: 'Vatican City' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
].sort((a, b) => a.name.localeCompare(b.name));

interface ValidationErrors {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  dateOfBirth?: string;
  country?: string;
  terms?: string;
}

export default function RegisterPage() {
  const { register, isLoading, error: serverError } = useRegister();

  // Form fields
  const [displayName, setDisplayName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [country, setCountry] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation functions
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('One number');
    }
    return errors;
  };

  const validateAge = (day: string, month: string, year: string): boolean => {
    if (!day || !month || !year) return false;

    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }

    return age >= 18;
  };

  const validateStep1 = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!displayName || displayName.trim().length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }

    if (!firstName || firstName.trim().length < 1) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName || lastName.trim().length < 1) {
      newErrors.lastName = 'Last name is required';
    }

    if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      newErrors.password = `Password needs: ${passwordErrors.join(', ')}`;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!validateAge(day, month, year)) {
      newErrors.dateOfBirth = 'You must be 18 or older to create an account';
    }

    if (!country) {
      newErrors.country = 'Please select your country';
    }

    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the Terms & Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleContinue = async (e: FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      displayName: true,
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
      dateOfBirth: true,
      country: true,
      terms: true,
    });

    if (validateStep1()) {
      try {
        await register({
          email,
          password,
          displayName,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          country,
        });
      } catch {
        // Error is already handled in the hook
      }
    }
  };

  // Generate arrays for date dropdowns
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 18 - i);

  return (
    <PageTransition>
      <main className="min-h-screen bg-gradient-playful-2 flex flex-col py-0 md:py-12 px-0 md:px-6 relative overflow-hidden">
      {/* Floating Brand Logo */}
      <FloatingLogo
        position="top-left"
        size={95}
        animation="orbit"
        opacity={0.10}
      />

      {/* Floating Decorative Elements */}
      <motion.div
        className="absolute top-20 left-10 w-48 h-48 bg-linear-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"
        animate={{
          x: [0, 80, -60, 0],
          y: [0, -60, 40, 0],
          scale: [1, 1.4, 0.7, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-40 h-40 bg-linear-to-br from-blue-400/12 to-cyan-400/12 rounded-full blur-2xl"
        animate={{
          x: [0, -70, 50, 0],
          y: [0, 50, -35, 0],
          scale: [1, 0.8, 1.3, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 w-32 h-32 bg-linear-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-xl"
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -40, 25, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
      {/* Mobile: Sticky Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-4 py-4 border-b border-gray-100 md:hidden">
        <Image src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo" className="h-12"/>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-6 md:py-0">
        <motion.div
          className="w-full max-w-lg"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Card Container */}
          <motion.div
            variants={staggerItem}
            className="bg-white md:rounded-2xl shadow-3d p-6 md:p-10 lg:p-12 border-0 md:border md:border-gray-100"
          >
            {/* Logo (Desktop Only) */}
            <motion.div variants={staggerItem} className="hidden md:flex justify-center mb-8">
              <Image src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo" className="h-15"/>
            </motion.div>

            {/* Title */}
            <motion.div variants={staggerItem} className="text-center mb-8 md:mb-10">
              <motion.h1 
                className="text-2xl md:text-3xl font-bold bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                Join the Creator Revolution! 🚀
              </motion.h1>
              <motion.p 
                className="text-gray-600 text-sm md:text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Start your journey to connect with amazing buyers and share your content ✨
              </motion.p>
            </motion.div>

            {/* Mobile: Simplified Step Indicator (Dots) */}
            <motion.div variants={staggerItem} className="flex md:hidden items-center justify-center mb-6">
              <ProgressDots currentStep={1} totalSteps={4} color="indigo" />
            </motion.div>

            {/* Desktop: Full Step Indicator */}
            <motion.div variants={staggerItem} className="hidden md:flex items-center justify-center mb-6">
              <div className="flex items-center gap-3">
                {/* Step 1 */}
                <motion.div
                  variants={scaleInBounce}
                  className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-lg shadow-lg"
                >
                  1
                </motion.div>

                {/* Line */}
                <div className="w-16 lg:w-20 h-0.5 bg-gray-300"></div>

                {/* Step 2 */}
                <div className="w-12 h-12 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-semibold text-lg">
                  2
                </div>

                {/* Line */}
                <div className="w-16 lg:w-20 h-0.5 bg-gray-300"></div>

                {/* Step 3 */}
                <div className="w-12 h-12 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-semibold text-lg">
                  3
                </div>

                {/* Line */}
                <div className="w-16 lg:w-20 h-0.5 bg-gray-300"></div>

                {/* Step 4 */}
                <div className="w-12 h-12 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-semibold text-lg">
                  4
                </div>
              </div>
            </motion.div>

            <motion.p variants={staggerItem} className="text-center text-xs md:text-sm text-gray-600 mb-8 md:mb-10">
              Step 1 of 4: Account Details
            </motion.p>

            {/* Server Error Display */}
            {serverError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">{serverError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleContinue} className="space-y-5">
              {/* Display Name */}
              <motion.div variants={staggerItem}>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-900 mb-2">
                  Creator Name (Display Name)
                </label>
                <motion.input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onBlur={() => handleBlur('displayName')}
                  placeholder="How you'll appear to viewers"
                  className={`w-full h-12 px-4 text-base border-2 rounded-xl focus-glow outline-none transition-all ${
                    touched.displayName && errors.displayName
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  animate={touched.displayName && errors.displayName ? { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } } : {}}
                  required
                />
                {touched.displayName && errors.displayName && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.displayName}</p>
                )}
              </motion.div>

              {/* First & Last Name - Stack on mobile, side-by-side on tablet+ */}
              <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-900 mb-2">
                    First Name
                  </label>
                  <motion.input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => handleBlur('firstName')}
                    className={`w-full h-12 px-4 text-base border-2 rounded-xl focus-glow outline-none transition-all ${
                      touched.firstName && errors.firstName
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-indigo-500'
                    }`}
                    animate={touched.firstName && errors.firstName ? { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } } : {}}
                    required
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-900 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() => handleBlur('lastName')}
                    className={`w-full h-12 px-4 text-base border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                      touched.lastName && errors.lastName
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-indigo-500'
                    }`}
                    required
                  />
                  {touched.lastName && errors.lastName && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </motion.div>

              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full h-12 px-4 text-base border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    touched.email && errors.email
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  required
                />
                {touched.email && errors.email && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur('password')}
                    className={`w-full h-12 px-4 pr-12 text-base border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                      touched.password && errors.password
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-indigo-500'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Must include: 8+ characters, uppercase, lowercase, and number
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`w-full h-12 px-4 pr-12 text-base border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                      touched.confirmPassword && errors.confirmPassword
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-indigo-500'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Date of Birth
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  You must be 18 or older to create an account
                </p>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    onBlur={() => handleBlur('dateOfBirth')}
                    className="h-12 px-3 md:px-4 text-sm md:text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-gray-700"
                    required
                  >
                    <option value="">Day</option>
                    {days.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>

                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    onBlur={() => handleBlur('dateOfBirth')}
                    className="h-12 px-3 md:px-4 text-sm md:text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-gray-700"
                    required
                  >
                    <option value="">Month</option>
                    {months.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>

                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    onBlur={() => handleBlur('dateOfBirth')}
                    className="h-12 px-3 md:px-4 text-sm md:text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-gray-700"
                    required
                  >
                    <option value="">Year</option>
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                {touched.dateOfBirth && errors.dateOfBirth && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.dateOfBirth}</p>
                )}
              </div>

              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-900 mb-2">
                  Country
                </label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  onBlur={() => handleBlur('country')}
                  className={`w-full h-12 px-4 text-base border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white ${
                    touched.country && errors.country
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  required
                >
                  <option value="">Select your country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {touched.country && errors.country && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.country}</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    onBlur={() => handleBlur('terms')}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <Link href="/terms" className="text-indigo-600 hover:text-indigo-700 font-medium">
                      Terms
                    </Link>
                    {' '}&{' '}
                    <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {touched.terms && errors.terms && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.terms}</p>
                )}
              </div>

              {/* Trust Badges - Responsive layout */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 py-6 md:py-8 border-t border-gray-200">
                <div className="flex items-center sm:flex-col sm:items-center sm:text-center gap-3 sm:gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="text-xs font-semibold text-gray-900">
                    <span className="sm:block">Secure by</span>
                    <span className="sm:block sm:ml-0 ml-1">Design</span>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col sm:items-center sm:text-center gap-3 sm:gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-xs font-semibold text-gray-900">
                    <span className="sm:block">Privacy-</span>
                    <span className="sm:block sm:ml-0 ml-1">first</span>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col sm:items-center sm:text-center gap-3 sm:gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-xs font-semibold text-gray-900">
                    <span className="sm:block">No Spam</span>
                    <span className="sm:block sm:ml-0 ml-1">Promise</span>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                disabled={!agreeToTerms}
                className="h-12 text-base bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
              >
                {isLoading ? 'Creating Account...' : 'Continue'}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                  >
                    Log In
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>

      {/* Mobile: Sticky Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 md:static md:border-0 md:mt-8">
        <p className="text-xs md:text-sm text-gray-500 text-center">
          © 2025 Velolink. All rights reserved.
        </p>
      </footer>
    </main>
    </PageTransition>
  );
}

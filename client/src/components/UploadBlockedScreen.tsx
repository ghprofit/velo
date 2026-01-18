'use client';

import Link from 'next/link';

type VerificationStatusType = 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

interface UploadBlockedScreenProps {
  verificationStatus: VerificationStatusType;
  emailVerified: boolean;
  onRefresh?: () => void;
}

interface BlockingConfig {
  icon: string;
  iconBg: string;
  title: string;
  message: string;
  primaryAction: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  benefits?: string[];
  tips?: string[];
  bgColor: string;
  borderColor: string;
}

export default function UploadBlockedScreen({
  verificationStatus,
  emailVerified,
  onRefresh,
}: UploadBlockedScreenProps) {
  const getBlockingConfig = (): BlockingConfig => {
    // Priority 1: Check email verification first
    if (!emailVerified) {
      return {
        icon: '📧',
        iconBg: 'bg-blue-100',
        title: 'Email Verification Required',
        message: 'Please verify your email address before uploading content. Check your inbox for the verification code.',
        primaryAction: {
          text: 'Enter Verification Code',
          href: '/register/verify',
        },
        secondaryAction: {
          text: 'Go to Settings',
          href: '/creator/settings',
        },
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      };
    }

    // Priority 2: Check KYC verification status
    switch (verificationStatus) {
      case 'PENDING':
        return {
          icon: '⚠️',
          iconBg: 'bg-yellow-100',
          title: 'Identity Verification Required',
          message: 'Complete identity verification to upload content and receive payments. The process takes 3-5 minutes.',
          primaryAction: {
            text: 'Start Verification',
            href: '/creator/verify-identity',
          },
          benefits: [
            'Upload unlimited content',
            'Receive payments directly',
            'Get verified creator badge',
          ],
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };

      case 'IN_PROGRESS':
        return {
          icon: '🔄',
          iconBg: 'bg-blue-100',
          title: 'Verification In Progress',
          message: 'Your identity verification is being reviewed. This usually takes a few minutes, but can take up to 24 hours.',
          primaryAction: {
            text: 'Check Status',
            onClick: onRefresh,
          },
          secondaryAction: {
            text: 'View Details',
            href: '/creator/verify-identity',
          },
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };

      case 'REJECTED':
        return {
          icon: '❌',
          iconBg: 'bg-red-100',
          title: 'Verification Declined',
          message: 'Your verification was declined. Please review the guidelines below and resubmit with updated information.',
          primaryAction: {
            text: 'Resubmit Verification',
            href: '/creator/verify-identity',
          },
          tips: [
            'Ensure photos are clear and well-lit',
            'Check that your document is valid and not expired',
            'Verify that the name on your document matches your profile',
            'Make sure all document edges are visible in the photo',
          ],
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };

      case 'EXPIRED':
        return {
          icon: '⏱️',
          iconBg: 'bg-gray-100',
          title: 'Verification Session Expired',
          message: 'Your verification session has expired. Please start a new verification to upload content.',
          primaryAction: {
            text: 'Start New Verification',
            href: '/creator/verify-identity',
          },
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };

      default:
        return {
          icon: '🔒',
          iconBg: 'bg-gray-100',
          title: 'Upload Unavailable',
          message: 'Upload functionality is currently unavailable. Please contact support if this persists.',
          primaryAction: {
            text: 'Refresh Page',
            onClick: onRefresh,
          },
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const config = getBlockingConfig();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className={`bg-white rounded-xl shadow-sm border ${config.borderColor} p-6 sm:p-8 lg:p-10`}>
          {/* Icon */}
          <div className={`w-16 h-16 sm:w-20 sm:h-20 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <span className="text-3xl sm:text-4xl">{config.icon}</span>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-2 sm:mb-3">
            {config.title}
          </h2>

          {/* Message */}
          <p className="text-sm sm:text-base text-gray-600 text-center mb-6 sm:mb-8 leading-relaxed">
            {config.message}
          </p>

          {/* Benefits List (for PENDING) */}
          {config.benefits && (
            <ul className="space-y-2 mb-6 sm:mb-8 max-w-md mx-auto">
              {config.benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-sm sm:text-base text-gray-700">
                  <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Tips (for REJECTED) */}
          {config.tips && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 sm:mb-8">
              <p className="text-sm font-medium text-red-900 mb-2">Common reasons for rejection:</p>
              <ul className="space-y-1">
                {config.tips.map((tip, i) => (
                  <li key={i} className="text-xs sm:text-sm text-red-700">
                    • {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {/* Primary Action */}
            {config.primaryAction.href ? (
              <Link
                href={config.primaryAction.href}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm sm:text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm hover:shadow-md"
              >
                {config.primaryAction.text}
              </Link>
            ) : (
              <button
                onClick={config.primaryAction.onClick}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm sm:text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm hover:shadow-md"
              >
                {config.primaryAction.text}
              </button>
            )}

            {/* Secondary Action */}
            {config.secondaryAction && (
              <>
                {config.secondaryAction.href ? (
                  <Link
                    href={config.secondaryAction.href}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm sm:text-base font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    {config.secondaryAction.text}
                  </Link>
                ) : (
                  <button
                    onClick={config.secondaryAction.onClick}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm sm:text-base font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    {config.secondaryAction.text}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Help Text */}
          <p className="text-xs sm:text-sm text-gray-500 text-center mt-6">
            <p className="text-sm text-blue-700">
                Need help? <Link href="/help" className="font-semibold underline hover:text-blue-900">Contact our support team</Link>
              </p>
          </p>
        </div>
      </div>
    </div>
  );
}

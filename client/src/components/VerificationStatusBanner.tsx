'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { veriffApi } from '@/lib/api-client';

type VerificationStatusType = 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

interface VerificationStatus {
  verificationStatus: VerificationStatusType;
  veriffSessionId?: string | null;
  verifiedAt?: string | null;
}

export default function VerificationStatusBanner() {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const response = await veriffApi.getMyVerificationStatus();
      setStatus(response.data.data);
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !status || status.verificationStatus === 'VERIFIED' || dismissed) {
    return null;
  }

  const getBannerConfig = () => {
    switch (status.verificationStatus) {
      case 'PENDING':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: '⚠️',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          title: 'Identity Verification Required',
          message: 'Complete identity verification to unlock all creator features and receive payments.',
          actionText: 'Verify Identity',
          actionHref: '/creator/verify-identity',
          actionColor: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        };
      case 'IN_PROGRESS':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: '🔄',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          title: 'Verification In Progress',
          message: 'Your identity verification is being reviewed. This usually takes a few minutes.',
          actionText: 'Check Status',
          actionHref: '/creator/verify-identity',
          actionColor: 'bg-blue-600 hover:bg-blue-700 text-white',
        };
      case 'REJECTED':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: '❌',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          title: 'Verification Declined',
          message: 'Your verification was declined. Please resubmit with updated information.',
          actionText: 'Resubmit Verification',
          actionHref: '/creator/verify-identity',
          actionColor: 'bg-red-600 hover:bg-red-700 text-white',
        };
      case 'EXPIRED':
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: '⏱️',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          title: 'Verification Expired',
          message: 'Your verification session has expired. Please start a new verification.',
          actionText: 'Start New Verification',
          actionHref: '/creator/verify-identity',
          actionColor: 'bg-gray-600 hover:bg-gray-700 text-white',
        };
      default:
        return null;
    }
  };

  const config = getBannerConfig();
  if (!config) return null;

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 mb-6 shadow-sm`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`${config.iconBg} rounded-full p-2 shrink-0`}>
          <span className="text-2xl">{config.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {config.title}
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            {config.message}
          </p>
          <div className="flex items-center gap-3">
            <Link
              href={config.actionHref}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${config.actionColor} transition-colors`}
            >
              {config.actionText}
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          aria-label="Close banner"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

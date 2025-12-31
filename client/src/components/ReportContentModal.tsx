'use client';

import { useState, FormEvent } from 'react';
import { Button, ShieldCheckIcon } from './ui';

interface ReportContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentTitle: string;
  contentType: string;
  contentDuration?: string;
}

type ReportReason =
  | 'hate-speech'
  | 'violence'
  | 'copyright'
  | 'policy-violation'
  | 'refund-quality'
  | 'other'
  | '';

export default function ReportContentModal({
  isOpen,
  onClose,
  contentTitle,
  contentType,
  contentDuration,
}: ReportContentModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason>('');
  const [details, setDetails] = useState('');
  const [isConfidentialChecked, setIsConfidentialChecked] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;

    setIsSubmitting(true);

    // Handle report submission
    console.log('Report submitted:', {
      reason: selectedReason,
      details,
      contentTitle,
    });

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      // Reset form
      setSelectedReason('');
      setDetails('');
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto
        scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-gray-100
        [&::-webkit-scrollbar-track]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-gray-300
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:hover:bg-gray-400">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Content */}
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Report Content for Review
              </h2>
              <p className="text-sm text-gray-600">
                Your report will be reviewed by our moderation team. All reports are confidential.
              </p>
            </div>
          </div>

          {/* Content Being Reported */}
          <div className="bg-gray-50 border-l-4 border-indigo-500 rounded-lg p-4 mb-8">
            <div className="text-sm text-gray-600 mb-1">Reporting Content:</div>
            <div className="font-bold text-gray-900 mb-1">&quot;{contentTitle}&quot;</div>
            <div className="text-sm text-gray-500">
              {contentType}
              {contentDuration && ` • ${contentDuration}`}
            </div>
          </div>

          {/* Report Form */}
          <form onSubmit={handleSubmit}>
            {/* Reason Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Why are you reporting this content?
              </h3>

              <div className="space-y-3">
                {/* Hate Speech */}
                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="reason"
                    value="hate-speech"
                    checked={selectedReason === 'hate-speech'}
                    onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                    className="mt-0.5 w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Hate Speech or Harassment</div>
                    <div className="text-sm text-gray-600">Contains offensive language, threats, or discriminatory content</div>
                  </div>
                </label>

                {/* Violence */}
                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="reason"
                    value="violence"
                    checked={selectedReason === 'violence'}
                    onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                    className="mt-0.5 w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">Violence or Illegal Activity</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">Critical</span>
                    </div>
                    <div className="text-sm text-gray-600">Contains violence, illegal activities, or dangerous behavior</div>
                  </div>
                </label>

                {/* Copyright */}
                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="reason"
                    value="copyright"
                    checked={selectedReason === 'copyright'}
                    onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                    className="mt-0.5 w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Intellectual Property / Copyright</div>
                    <div className="text-sm text-gray-600">Uses copyrighted material without permission</div>
                  </div>
                </label>

                {/* Policy Violation */}
                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="reason"
                    value="policy-violation"
                    checked={selectedReason === 'policy-violation'}
                    onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                    className="mt-0.5 w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Policy Violation / Spam</div>
                    <div className="text-sm text-gray-600">Violates community guidelines, misleading content, or spam</div>
                  </div>
                </label>

                {/* Refund/Quality */}
                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="reason"
                    value="refund-quality"
                    checked={selectedReason === 'refund-quality'}
                    onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                    className="mt-0.5 w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Refund/Quality Issue</div>
                    <div className="text-sm text-gray-600">Content doesn&apos;t match description or is low quality</div>
                  </div>
                </label>

                {/* Other */}
                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="reason"
                    value="other"
                    checked={selectedReason === 'other'}
                    onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                    className="mt-0.5 w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Other</div>
                    <div className="text-sm text-gray-600">Please specify in the details below</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Additional Details */}
            <div className="mb-6">
              <label className="block text-base font-bold text-gray-900 mb-3">
                Provide more details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none text-gray-900 placeholder:text-gray-400"
                placeholder="Please explain why you believe this content should be removed or reviewed. If reporting a specific part of a video, please note the timestamp."
              />
            </div>

            {/* Confidential Checkbox */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isConfidentialChecked}
                  onChange={(e) => setIsConfidentialChecked(e.target.checked)}
                  className="mt-0.5 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
                    <ShieldCheckIcon className="w-4 h-4 text-indigo-600" />
                    I understand this report is confidential
                  </div>
                  <div className="text-xs text-indigo-700">
                    Your identity will remain anonymous throughout the review process
                  </div>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={!selectedReason || !isConfidentialChecked}
                className="px-8 py-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

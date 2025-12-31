'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { supportApi } from '@/lib/api-client';
import TermsModal from '@/app/home/TermsModal';
import { fileToBase64, validateSupportAttachment } from '@/utils/file-utils';

// File attachment constraints
const ATTACHMENT_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_TOTAL: 20 * 1024 * 1024, // 20MB
  MAX_COUNT: 5,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'video/mp4'],
};

export default function SupportTicketPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Form states
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [contentId, setContentId] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSection, setModalSection] = useState<'terms' | 'privacy' | 'community' | 'compliance'>('compliance');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Check total file count
      if (uploadedFiles.length + newFiles.length > ATTACHMENT_LIMITS.MAX_COUNT) {
        setError(`Maximum ${ATTACHMENT_LIMITS.MAX_COUNT} files allowed`);
        return;
      }

      // Validate each file
      for (const file of newFiles) {
        const validationError = validateSupportAttachment(file);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const handleOpenModal = (section: 'terms' | 'privacy' | 'community' | 'compliance') => {
    setModalSection(section);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate user is logged in
    if (!user?.email) {
      setError('You must be logged in to submit a support ticket');
      return;
    }

    try {
      setIsSubmitting(true);

      // Validate total file size if files are present
      if (uploadedFiles.length > 0) {
        const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
        if (totalSize > ATTACHMENT_LIMITS.MAX_TOTAL) {
          setError(
            `Total file size exceeds 20MB limit. Current total: ${(totalSize / 1024 / 1024).toFixed(2)}MB`
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Convert files to base64 if present
      let attachments;
      if (uploadedFiles.length > 0) {
        attachments = await Promise.all(
          uploadedFiles.map(async (file) => {
            const base64 = await fileToBase64(file);
            return {
              fileData: base64,
              fileName: file.name,
              contentType: file.type,
              fileSize: file.size,
            };
          })
        );
      }

      // Submit the ticket
      await supportApi.createTicket({
        category,
        subject,
        description,
        contentId: contentId || undefined,
        email: user.email,
        attachments: attachments && attachments.length > 0 ? attachments : undefined,
      });

      // Redirect to success page on successful submission
      router.push('/creator/support/ticket/success');
    } catch (err: unknown) {
      console.error('Failed to submit ticket:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to submit ticket. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Submit a Support Ticket</h1>
              <p className="text-sm text-gray-600 mt-1">Fill out the form below and we&apos;ll get back to you within 24 hours</p>
            </div>
            <Link
              href="/creator/support"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Back to Help Center</span>
            </Link>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-red-900 mb-0.5 sm:mb-1 text-sm sm:text-base">Error</h3>
                <p className="text-xs sm:text-sm text-red-800">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-700 flex-shrink-0"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Core Issue Details */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Core Issue Details</h2>

              {/* Issue Category */}
              <div className="mb-4 sm:mb-6">
                <label htmlFor="category" className="block text-xs sm:text-sm font-medium text-gray-900 mb-1.5 sm:mb-2">
                  Issue Category<span className="text-red-600">*</span>
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="payouts">Payouts & Financial Issues</option>
                  <option value="uploads">Upload Problems</option>
                  <option value="account">Account & Security</option>
                  <option value="content">Content Moderation</option>
                  <option value="technical">Technical Issues</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Subject Line */}
              <div className="mb-4 sm:mb-6">
                <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-gray-900 mb-1.5 sm:mb-2">
                  Subject Line (Brief Summary)<span className="text-red-600">*</span>
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Brief summary of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-900 mb-1.5 sm:mb-2">
                  Detailed Description<span className="text-red-600">*</span>
                </label>
                <textarea
                  id="description"
                  rows={6}
                  placeholder="Please provide as much detail as possible about your issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none sm:rows-8"
                  required
                />
              </div>
            </div>

            {/* Context & Attachments */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Context & Attachments</h2>

              {/* Related Content ID */}
              <div className="mb-4 sm:mb-6">
                <label htmlFor="contentId" className="block text-xs sm:text-sm font-medium text-gray-900 mb-1.5 sm:mb-2">
                  Related Content ID or Link (Optional)
                </label>
                <input
                  id="contentId"
                  type="text"
                  placeholder="e.g., video ID or content URL"
                  value={contentId}
                  onChange={(e) => setContentId(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
                <p className="mt-1.5 sm:mt-2 text-xs text-gray-500">If this issue is related to a specific upload</p>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1.5 sm:mb-2">
                  Attach Files/Screenshots (Optional)
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 sm:p-8 lg:p-12 text-center transition-colors ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <input
                    id="fileUpload"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,video/mp4"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm sm:text-base font-medium text-gray-900 mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs sm:text-sm text-gray-500">JPEG, PNG, MP4 (max 5MB per file, 5 files total)</p>
                    </div>
                  </label>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 sm:mt-4 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span className="text-xs sm:text-sm text-gray-900 truncate">{file.name}</span>
                          <span className="text-xs text-gray-500 flex-shrink-0">({Math.round(file.size / 1024)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))}
                          className="text-red-600 hover:text-red-700 flex-shrink-0"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                By submitting, you agree to our{' '}
                <button
                  type="button"
                  onClick={() => handleOpenModal('compliance')}
                  className="text-indigo-600 hover:text-indigo-700 font-medium underline"
                >
                  Support Policy
                </button>
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base ${
                  isSubmitting
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Ticket
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-500">© 2025 Velolink — Designed to protect creators and their data.</p>
          </div>
        </div>

        {/* Terms Modal */}
        <TermsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          section={modalSection}
        />
    </>
  );
}

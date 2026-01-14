'use client';

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { contentApi, veriffApi } from '@/lib/api-client';
import UploadBlockedScreen from '@/components/UploadBlockedScreen';
import NextImage from 'next/image';
import FloatingLogo from '@/components/FloatingLogo';

interface UploadedFile {
  file: File;
  thumbnail: string;
  id: string;
}

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { number: 1, title: 'Upload', description: 'Add your content' },
  { number: 2, title: 'Details', description: 'Set info & price' },
  { number: 3, title: 'Generate', description: 'Create your link' },
  { number: 4, title: 'Share', description: 'Share & earn' },
];

export default function UploadContentPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step management
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [contentType, setContentType] = useState<'IMAGE' | 'VIDEO' | 'GALLERY'>('IMAGE');

  // Generated link state
  const [generatedLink, setGeneratedLink] = useState('');
  const [shortId, setShortId] = useState('');
  const [contentStatus, setContentStatus] = useState<string>('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Verification state
  const [isCheckingVerification, setIsCheckingVerification] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<string>('PENDING');
  const [emailVerified, setEmailVerified] = useState(false);
  const [canUpload, setCanUpload] = useState(false);

  // Check verification status on mount
  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      setIsCheckingVerification(true);
      const response = await veriffApi.getMyVerificationStatus();
      const data = response.data.data;

      setVerificationStatus(data.verificationStatus);
      setEmailVerified(data.emailVerified);

      // Only allow upload if BOTH conditions met
      const allowed = data.emailVerified && data.verificationStatus === 'VERIFIED';
      setCanUpload(allowed);
    } catch (err: unknown) {
      console.error('Failed to check verification:', err);
      setError('Failed to check verification status. Please refresh.');
    } finally {
      setIsCheckingVerification(false);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFiles(Array.from(files));
    }
  };

  const generateThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        // For images, use object URL and resize
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          let width = img.width;
          let height = img.height;
          const maxSize = 300;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          // Revoke object URL to free memory
          URL.revokeObjectURL(img.src);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        // For videos, use object URL (no base64 loading)
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadeddata = () => {
          video.currentTime = 0.1;
        };

        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth > 300 ? 300 : video.videoWidth;
          canvas.height = (canvas.width / video.videoWidth) * video.videoHeight;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Revoke object URL to free memory
          URL.revokeObjectURL(video.src);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };

        video.onerror = reject;
        video.src = URL.createObjectURL(file); // Use object URL instead of base64
      }
    });
  };

  const processFiles = async (files: File[]) => {
    setError('');

    if (uploadedFiles.length + files.length > 20) {
      setError('Maximum 20 files allowed per upload');
      return;
    }

    // Warning for 15+ files
    if (uploadedFiles.length + files.length >= 15) {
      console.warn(`Uploading ${uploadedFiles.length + files.length} files. This may take some time.`);
    }

    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return isImage || isVideo;
    });

    if (validFiles.length !== files.length) {
      setError('Only image and video files are allowed');
    }

    // Validate file sizes
    const MAX_FILE_SIZE = 524288000; // 500MB in bytes
    const oversizedFiles = validFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(', ');
      const sizes = oversizedFiles.map(f => `${(f.size / 1048576).toFixed(1)}MB`).join(', ');
      setError(`Files exceed 500MB limit: ${fileNames} (${sizes}). Please compress or reduce quality.`);
      return;
    }

    for (const file of validFiles) {
      try {
        // Generate thumbnail only (no base64 conversion of full file)
        const thumbnail = await generateThumbnail(file);

        const newFile: UploadedFile = {
          file,
          thumbnail,
          id: Math.random().toString(36).substring(7),
        };

        setUploadedFiles(prev => [...prev, newFile]);

        if (validFiles.length > 1) {
          setContentType('GALLERY');
        } else if (file.type.startsWith('video/')) {
          setContentType('VIDEO');
        } else {
          setContentType('IMAGE');
        }
      } catch (err) {
        console.error('Error processing file:', file.name, err);
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to process "${file.name}": ${errorMsg}`);
      }
    }
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleGenerateLink = async () => {
    setError('');
    setUploading(true);

    try {
      // Create FormData
      const formData = new FormData();

      // Add form fields
      formData.append('title', title.trim());
      if (description.trim()) {
        formData.append('description', description.trim());
      }
      formData.append('price', price);
      formData.append('contentType', contentType);

      // Add files metadata as JSON
      const filesMetadata = uploadedFiles.map(uf => ({
        fileName: uf.file.name,
        contentType: uf.file.type,
        fileSize: uf.file.size,
        duration: undefined,
      }));
      formData.append('filesMetadata', JSON.stringify(filesMetadata));

      // Add actual file objects
      uploadedFiles.forEach(uf => {
        formData.append('files', uf.file);
      });

      // Add thumbnail (convert base64 to Blob)
      const thumbnailBlob = await fetch(uploadedFiles[0].thumbnail).then(r => r.blob());
      formData.append('thumbnail', thumbnailBlob, 'thumbnail.jpg');

      // Send multipart request
      const response = await contentApi.createContentMultipart(formData);

      setGeneratedLink(response.data.data.link);
      setShortId(response.data.data.shortId);
      setContentStatus(response.data.data.status || 'PENDING_REVIEW');
      setCurrentStep(4);
    } catch (err: unknown) {
      console.error('Error creating content:', err);

      // Handle different error types with specific user-friendly messages
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        code?: string;
        message?: string;
      };

      let errorMessage = 'Failed to create content';

      if (axiosError.code === 'ECONNABORTED' || axiosError.message?.includes('timeout')) {
        errorMessage = 'Upload timed out. For large videos, please ensure stable internet connection and try again.';
      } else if (axiosError.code === 'ERR_NETWORK' || !axiosError.response) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (axiosError.response?.status === 413) {
        errorMessage = 'File too large for server. Maximum total upload size is 500MB per file.';
      } else if (axiosError.response?.status === 400) {
        errorMessage = axiosError.response?.data?.message || 'Invalid upload data. Please check file format and try again.';
      } else if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        errorMessage = 'Authentication error. Please log in again.';
      } else if (axiosError.response?.status === 500) {
        errorMessage = 'Server error. Please try again or contact support if the issue persists.';
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      }

      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Check out my exclusive content! ${generatedLink}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(generatedLink)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Check out my exclusive content! ${generatedLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Check out my exclusive content`);
    const body = encodeURIComponent(`I just uploaded some exclusive content. Check it out here: ${generatedLink}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const getFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canProceedToStep2 = uploadedFiles.length > 0;
  const canProceedToStep3 = title.trim() !== '' && parseFloat(price) > 0;

  const handleNextStep = () => {
    if (currentStep === 1 && canProceedToStep2) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedToStep3) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1 && currentStep < 4) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setUploadedFiles([]);
    setTitle('');
    setDescription('');
    setPrice('');
    setGeneratedLink('');
    setShortId('');
    setError('');
  };

  return (
    <>
      {/* Loading State */}
      {isCheckingVerification && (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Checking verification status...</p>
          </div>
        </div>
      )}

      {/* Blocked State */}
      {!isCheckingVerification && !canUpload && (
        <>
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Upload & Monetize Your Content
            </h1>
          </div>

          {/* Blocked Screen */}
          <UploadBlockedScreen
            verificationStatus={verificationStatus as never}
            emailVerified={emailVerified}
            onRefresh={checkVerificationStatus}
          />
        </>
      )}

      {/* Upload Form - Only show if verified */}
      {!isCheckingVerification && canUpload && (
        <>
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Upload & Monetize Your Content</h1>
        <p className="hidden text-sm sm:text-base text-gray-600">Follow the steps to upload, price, and share your exclusive content.</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-colors ${
                      currentStep >= step.number
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="mt-1.5 sm:mt-2 text-center">
                    <p className={`text-xs sm:text-sm font-medium ${currentStep >= step.number ? 'text-indigo-600' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400 hidden sm:block">{step.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${currentStep > step.number ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 relative">
        {/* Floating Brand Logos */}
        <FloatingLogo
          position="top-right"
          size={110}
          animation="float-rotate"
          opacity={0.08}
        />
        <FloatingLogo
          position="bottom-left"
          size={90}
          animation="pulse"
          opacity={0.06}
        />

        <div className="max-w-3xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Step 1: Upload Content */}
          {currentStep === 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Step 1: Upload Your Content</h2>
                  <p className="hidden text-sm text-gray-600 mt-1">Drag and drop or browse to upload your files</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
                  <span className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2.5 sm:px-3 py-1 rounded-full w-fit">
                    {uploadedFiles.length}/20 files
                  </span>
                  {uploadedFiles.length >= 15 && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2.5 sm:px-3 py-1 rounded-full w-fit flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Large upload - may take time
                    </span>
                  )}
                </div>
              </div>

              {uploadedFiles.length < 20 && (
                <div
                  className={`border-2 border-dashed rounded-xl p-6 sm:p-8 lg:p-12 text-center transition-colors mb-4 sm:mb-6 ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 bg-gray-50 hover:border-indigo-400'
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
                    Drag & drop your files here
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                    or click to browse from your computer
                  </p>
                  <button
                    type="button"
                    onClick={handleBrowseFiles}
                    className="px-5 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
                  >
                    Browse Files
                  </button>
                  <p className="text-xs text-gray-400 mt-3 sm:mt-4">
                    Supported: JPG, PNG, GIF, MP4, MOV (max 500MB each, 20 files max)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                  />
                </div>
              )}

              {/* Uploaded Files Grid */}
              {uploadedFiles.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Uploaded Files</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {uploadedFiles.map((uf) => (
                      <div key={uf.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <NextImage
                            src={uf.thumbnail}
                            alt={uf.file.name}
                            className="w-full h-full object-cover"
                          />
                          {uf.file.type.startsWith('video/') && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black/50 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveFile(uf.id)}
                          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <p className="mt-1.5 sm:mt-2 text-xs text-gray-600 truncate">{uf.file.name}</p>
                        <p className="text-xs text-gray-400">{getFileSize(uf.file.size)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Button */}
              <div className="flex justify-end pt-3 sm:pt-4 border-t border-gray-200">
                <button
                  onClick={handleNextStep}
                  disabled={!canProceedToStep2}
                  className="w-full sm:w-auto px-5 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  Continue to Details
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Content Details */}
          {currentStep === 2 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Step 2: Content Details</h2>
                <p className="hidden text-sm text-gray-600 mt-1">Give your content a title, description, and set your price</p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Preview Thumbnail */}
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <NextImage
                      src={uploadedFiles[0]?.thumbnail}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Content Preview</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900">{uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} uploaded</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                      contentType === 'IMAGE' ? 'bg-blue-100 text-blue-700' :
                      contentType === 'VIDEO' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {contentType}
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="title" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    placeholder="Give your content a catchy title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Description <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Briefly describe what buyers will get..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none sm:rows-4"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Price (USD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm sm:text-base">$</span>
                    <input
                      id="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 sm:mt-2">
                    You&apos;ll receive <span className="font-semibold text-gray-900">${price && !isNaN(parseFloat(price)) ? (parseFloat(price) * 0.90).toFixed(2) : '0.00'}</span> (90% of your price)
                  </p>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200">
                <button
                  onClick={handlePrevStep}
                  className="w-full sm:w-auto px-5 sm:px-6 py-2 sm:py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!canProceedToStep3}
                  className="w-full sm:w-auto px-5 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Continue to Generate Link</span>
                  <span className="sm:hidden">Generate Link</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Generate Link */}
          {currentStep === 3 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Step 3: Generate Your Unique Link</h2>
                <p className="hidden text-sm text-gray-600 mt-1">Review your content and generate a unique, trackable link</p>
              </div>

              {/* Content Summary */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 relative">
                    <NextImage
                      src={uploadedFiles[0]?.thumbnail}
                      alt="Preview"
                      className="w-full h-full object-cover blur-sm"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{title}</h3>
                    {description && (
                      <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">{description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3">
                      <span className="text-xl sm:text-2xl font-bold text-indigo-600">${parseFloat(price).toFixed(2)}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        contentType === 'IMAGE' ? 'bg-blue-100 text-blue-700' :
                        contentType === 'VIDEO' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {uploadedFiles.length} {contentType.toLowerCase()}{uploadedFiles.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Link Info */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-700">
                      <strong>Your unique link will be:</strong>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      A short, unique URL like <code className="bg-white px-1.5 sm:px-2 py-0.5 rounded text-indigo-600 text-xs break-all">velolink.club/c/abc123xyz</code> that:
                    </p>
                    <ul className="text-xs sm:text-sm text-gray-600 mt-2 space-y-1">
                      <li className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Is unique to this content only
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Tracks all views and purchases
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Links back to your creator profile
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-3 sm:pt-4 border-t border-gray-200">
                <button
                  onClick={handlePrevStep}
                  className="w-full sm:w-auto px-5 sm:px-6 py-2 sm:py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button
                  onClick={handleGenerateLink}
                  disabled={uploading}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 text-sm sm:text-base"
                >
                  {uploading ? (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="hidden sm:inline">Uploading & Generating...</span>
                      <span className="sm:hidden">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Generate My Link
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Share */}
          {currentStep === 4 && (
            <div className="space-y-4 sm:space-y-6">

              {/* PENDING REVIEW NOTIFICATION */}
              {contentStatus === 'PENDING_REVIEW' && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Content is Pending Approval</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Your content has been submitted for review. We&apos;ll notify you via email when it&apos;s approved or if we need more information.
                      </p>
                      <p className="text-xs text-amber-700 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Typical review time: 1-2 hours</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* FLAGGED CONTENT WARNING */}
              {contentStatus === 'FLAGGED' && (
                <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Content Flagged for Review</h3>
                      <p className="text-sm text-gray-600">
                        Our automated safety system has flagged your content for manual review. Our team will review it within 24 hours and notify you via email.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* AUTO-APPROVED SUCCESS */}
              {contentStatus === 'APPROVED' && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Content Approved!</h3>
                      <p className="text-sm text-gray-600">
                        Your content passed our safety checks and is now live! Start sharing your link to earn.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message - Only show when content is approved */}
              {contentStatus === 'APPROVED' && (
              <>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Your Link is Ready!</h2>
                  <p className="text-sm sm:text-base text-gray-600">Share it anywhere to start earning</p>
                </div>

                {/* Generated Link Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Your Unique Content Link</h3>

                <div className="bg-indigo-50 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <input
                      type="text"
                      value={generatedLink}
                      readOnly
                      className="flex-1 bg-transparent border-none outline-none text-gray-900 font-mono text-xs sm:text-sm truncate"
                    />
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 flex items-center justify-center gap-2 text-sm ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-white hover:bg-gray-50 border border-gray-300 text-gray-700'
                    }`}
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Content ID: <code className="bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded text-gray-700 text-xs">{shortId}</code>
                </div>
              </div>

              {/* Share Options */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Share Your Link</h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <button
                    onClick={handleShareTwitter}
                    className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors group"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1DA1F2] rounded-full flex items-center justify-center text-white">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-blue-600">Twitter</span>
                  </button>

                  <button
                    onClick={handleShareFacebook}
                    className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors group"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1877F2] rounded-full flex items-center justify-center text-white">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-blue-600">Facebook</span>
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors group"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#25D366] rounded-full flex items-center justify-center text-white">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-green-600">WhatsApp</span>
                  </button>

                  <button
                    onClick={handleShareEmail}
                    className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-600 rounded-full flex items-center justify-center text-white">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-gray-900">Email</span>
                  </button>
                </div>
              </div>
              </>
              )}

              {/* Content Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Content Summary</h3>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <NextImage
                      src={uploadedFiles[0]?.thumbnail}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">{title}</h4>
                    {description && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                      <span className="text-base sm:text-lg font-bold text-indigo-600">${parseFloat(price).toFixed(2)}</span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Another Button */}
              <div className="text-center">
                <button
                  onClick={handleRestart}
                  className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Upload Another Content
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </>
  );
}

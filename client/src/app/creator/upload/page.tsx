'use client';

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { contentApi, veriffApi } from '@/lib/api-client';
import UploadBlockedScreen from '@/components/UploadBlockedScreen';
import NextImage from 'next/image';
import FloatingLogo from '@/components/FloatingLogo';

interface UploadedFile {
  file: File;
  thumbnail: string;
  id: string;
}

type Step = 1 | 2 | 'success';

export default function UploadContentPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step management
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [contentType, setContentType] = useState<'IMAGE' | 'VIDEO' | 'GALLERY'>('IMAGE');

  // Success state
  const [shortId, setShortId] = useState('');
  const [error, setError] = useState('');

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
        // For images, use object URL and resize with blur
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { alpha: false }); // No alpha for better JPEG compression
            
            if (!ctx) {
              throw new Error('Failed to get canvas context');
            }

            let width = img.width;
            let height = img.height;
            const maxSize = 600; // Increased from 300 for better quality

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
            
            // Apply CSS blur filter for strong, visible blur
            ctx.filter = 'blur(25px)'; // Strong blur effect
            ctx.drawImage(img, 0, 0, width, height);
            ctx.filter = 'none'; // Reset filter

            // Revoke object URL to free memory
            URL.revokeObjectURL(img.src);
            
            // Use good quality for blurred thumbnail
            const dataURL = canvas.toDataURL('image/jpeg', 0.8);
            
            // Verify we got a valid data URL
            if (!dataURL || !dataURL.startsWith('data:image/jpeg')) {
              throw new Error('Failed to generate valid JPEG thumbnail');
            }
            
            resolve(dataURL);
          } catch (err) {
            URL.revokeObjectURL(img.src);
            reject(err);
          }
        };
        img.onerror = (err) => {
          URL.revokeObjectURL(img.src);
          reject(err || new Error('Failed to load image'));
        };
        img.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        // For videos, use object URL (no base64 loading)
        console.log(`[THUMBNAIL] Generating thumbnail for video: ${file.name}`);
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;
        
        // Reduce timeout to 5 seconds for faster failures
        const timeoutId = setTimeout(() => {
          console.warn(`[THUMBNAIL] Timeout for ${file.name}, using fallback`);
          const blobUrl = video.src;
          video.src = '';
          video.load();
          if (blobUrl && blobUrl.startsWith('blob:')) {
            URL.revokeObjectURL(blobUrl);
          }
          // Don't reject, resolve with fallback instead
          resolve('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23000" width="400" height="300"/%3E%3Ctext fill="%23fff" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="20"%3EVideo%3C/text%3E%3C/svg%3E');
        }, 5000);

        video.onloadedmetadata = () => {
          console.log(`[THUMBNAIL] Metadata loaded for ${file.name}`);
          // Don't seek, just capture first frame immediately
          video.currentTime = 0;
        };

        video.onseeked = () => {
          clearTimeout(timeoutId);
          try {
            const canvas = document.createElement('canvas');
            
            if (!video.videoWidth || !video.videoHeight) {
              throw new Error('Invalid video dimensions');
            }
            
            // Reduce thumbnail size for faster generation (300px instead of 600px)
            const maxWidth = 300;
            let width = video.videoWidth;
            let height = video.videoHeight;
            
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d', { alpha: false });
            if (!ctx) {
              throw new Error('Failed to get canvas context');
            }
            
            // Apply blur to video thumbnail as well
            ctx.filter = 'blur(20px)'; // Blur for video thumbnails
            ctx.drawImage(video, 0, 0, width, height);
            ctx.filter = 'none';

            const blobUrl = video.src;
            video.src = '';
            video.load();
            if (blobUrl && blobUrl.startsWith('blob:')) {
              URL.revokeObjectURL(blobUrl);
            }
            
            // Lower quality for faster generation (0.7 instead of 0.9)
            const dataURL = canvas.toDataURL('image/jpeg', 0.7);
            
            if (!dataURL || !dataURL.startsWith('data:image/jpeg')) {
              throw new Error('Failed to generate JPEG');
            }
            
            console.log(`[THUMBNAIL] ✅ Generated for ${file.name}`);
            resolve(dataURL);
          } catch (err) {
            console.error(`[THUMBNAIL] Error:`, err);
            const blobUrl = video.src;
            video.src = '';
            video.load();
            if (blobUrl && blobUrl.startsWith('blob:')) {
              URL.revokeObjectURL(blobUrl);
            }
            // Resolve with fallback instead of rejecting
            resolve('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23000" width="400" height="300"/%3E%3Ctext fill="%23fff" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="20"%3EVideo%3C/text%3E%3C/svg%3E');
          }
        };

        video.onerror = (err) => {
          clearTimeout(timeoutId);
          console.error(`[THUMBNAIL] Video error:`, err);
          const blobUrl = video.src;
          if (blobUrl && blobUrl.startsWith('blob:')) {
            URL.revokeObjectURL(blobUrl);
          }
          // Resolve with fallback instead of rejecting
          resolve('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23000" width="400" height="300"/%3E%3Ctext fill="%23fff" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="20"%3EVideo%3C/text%3E%3C/svg%3E');
        };
        
        try {
          video.src = URL.createObjectURL(file);
          console.log(`[THUMBNAIL] Object URL created`);
        } catch (err) {
          clearTimeout(timeoutId);
          console.error(`[THUMBNAIL] Failed to create URL:`, err);
          resolve('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23000" width="400" height="300"/%3E%3Ctext fill="%23fff" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="20"%3EVideo%3C/text%3E%3C/svg%3E');
        }
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

    const newFiles: UploadedFile[] = [];
    
    for (const file of validFiles) {
      try {
        console.log(`[UPLOAD] Processing file: ${file.name}, type: ${file.type}, size: ${(file.size / 1048576).toFixed(2)}MB`);
        
        // Generate blurred thumbnail
        const thumbnail = await generateThumbnail(file);
        
        console.log(`[UPLOAD] ✅ Blurred thumbnail generated for ${file.name}`);

        const newFile: UploadedFile = {
          file,
          thumbnail,
          id: Math.random().toString(36).substring(7),
        };

        newFiles.push(newFile);
      } catch (err) {
        console.error(`[UPLOAD] ❌ Error processing file "${file.name}":`, err);
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        
        // For videos, try to add with a fallback thumbnail
        if (file.type.startsWith('video/')) {
          console.log(`[UPLOAD] Using fallback thumbnail for video: ${file.name}`);
          const fallbackThumbnail = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23000" width="400" height="300"/%3E%3Ctext fill="%23fff" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="20"%3EVideo%3C/text%3E%3C/svg%3E';
          
          newFiles.push({
            file,
            thumbnail: fallbackThumbnail,
            id: Math.random().toString(36).substring(7),
          });
        } else {
          setError(`Failed to process "${file.name}": ${errorMsg}`);
        }
      }
    }

    // Add all new files at once
    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Update content type based on TOTAL files count
    const totalFiles = uploadedFiles.length + newFiles.length;
    if (totalFiles > 1) {
      setContentType('GALLERY');
    } else if (newFiles.length === 1 && newFiles[0].file.type.startsWith('video/')) {
      setContentType('VIDEO');
    } else if (newFiles.length === 1) {
      setContentType('IMAGE');
    }
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => {
      const newFiles = prev.filter(f => f.id !== id);
      
      // Update content type based on remaining files
      if (newFiles.length > 1) {
        setContentType('GALLERY');
      } else if (newFiles.length === 1) {
        if (newFiles[0].file.type.startsWith('video/')) {
          setContentType('VIDEO');
        } else {
          setContentType('IMAGE');
        }
      }
      
      return newFiles;
    });
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleSubmitContent = async () => {
    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      // Step 0: Convert thumbnail to blob (already blurred from generateThumbnail) (2%)
      setUploadProgress(2);
      
      // Get thumbnail (already blurred)
      const thumbnailDataUrl = uploadedFiles[0].thumbnail;
      
      // Convert data URL to blob
      const thumbnailBlob = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.onload = async () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d', { alpha: false });
            
            if (!ctx) {
              throw new Error('Failed to get canvas context');
            }
            
            // Just draw the already-blurred image
            ctx.drawImage(img, 0, 0);
            
            // Convert to blob with good quality
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error('Failed to create blob from thumbnail'));
                }
              },
              'image/jpeg',
              0.8
            );
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error('Failed to load thumbnail'));
        img.src = thumbnailDataUrl;
      });
      
      // Step 1: Get presigned upload URLs from backend (5%)
      setUploadProgress(5);
      
      const uploadUrlsResponse = await contentApi.getUploadUrls({
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        thumbnailFileName: 'thumbnail.jpg',
        thumbnailContentType: 'image/jpeg',
        thumbnailFileSize: thumbnailBlob.size,
        contentFiles: uploadedFiles.map(uf => ({
          fileName: uf.file.name,
          contentType: uf.file.type,
          fileSize: uf.file.size,
          type: uf.file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO',
        })),
      });

      const { contentId, thumbnailUrl, contentUrls } = uploadUrlsResponse.data.data;

      // Step 2: Upload blurred thumbnail directly to S3 (10%)
      setUploadProgress(10);
      await fetch(thumbnailUrl.uploadUrl, {
        method: 'PUT',
        body: thumbnailBlob,
        headers: {
          'Content-Type': 'image/jpeg',
        },
      });

      // Step 3: Upload content files directly to S3 (10% -> 90%)
      const totalBytes = uploadedFiles.reduce((sum, uf) => sum + uf.file.size, 0);
      let uploadedBytes = 0;

      const uploadedItems = await Promise.all(
        contentUrls.map(async (urlData: { uploadUrl: string; key: string; index: number; originalFileName: string }, index: number) => {
          const file = uploadedFiles[index].file;
          
          // Upload to S3 with progress tracking
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', (e) => {
              if (e.lengthComputable) {
                uploadedBytes = contentUrls
                  .slice(0, index)
                  .reduce((sum: number, _: unknown, i: number) => sum + uploadedFiles[i].file.size, 0) + e.loaded;
                
                const percentCompleted = Math.min(90, 10 + Math.round((uploadedBytes / totalBytes) * 80));
                setUploadProgress(percentCompleted);
              }
            });

            xhr.addEventListener('load', () => {
              if (xhr.status === 200) {
                resolve();
              } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            });

            xhr.addEventListener('error', () => reject(new Error('Upload failed')));
            xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

            xhr.open('PUT', urlData.uploadUrl);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.send(file);
          });

          return {
            s3Key: urlData.key,
            type: file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO',
            fileSize: file.size,
          };
        })
      );

      // Step 4: Confirm upload with backend (95%)
      setUploadProgress(95);
      const response = await contentApi.confirmUpload({
        contentId,
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        thumbnailS3Key: thumbnailUrl.key,
        items: uploadedItems,
      });

      // Upload complete
      setUploadProgress(100);
      
      setShortId(response.data.data.shortId);
      setCurrentStep('success');
      
      // No automatic redirect - user stays on success page
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
        errorMessage = 'File too large. Maximum file size is 500MB per file.';
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
      setUploadProgress(0);
    }
  };

  const getFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canProceedToStep2 = uploadedFiles.length > 0;
  const canSubmit = title.trim() !== '' && parseFloat(price) > 0;

  const handleNextStep = () => {
    if (currentStep === 1 && canProceedToStep2) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setUploadedFiles([]);
    setTitle('');
    setDescription('');
    setPrice('');
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
                    <div className="w-16 h-16 sm:w-20 sm:h-20 icon-3d-container icon-3d-indigo rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/x-msvideo,video/webm"
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
                            width={300}
                            height={300}
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
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                    <NextImage
                      src={uploadedFiles[0]?.thumbnail}
                      alt="Preview"
                      width={80}
                      height={80}
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
                  disabled={uploading}
                  className="w-full sm:w-auto px-5 sm:px-6 py-2 sm:py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button
                  onClick={handleSubmitContent}
                  disabled={!canSubmit || uploading}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 text-sm sm:text-base"
                >
                  {uploading ? (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="hidden sm:inline">Uploading & Submitting...</span>
                      <span className="sm:hidden">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Submit for Review
                    </>
                  )}
                </button>
              </div>

              {/* Upload Progress Bar */}
              {uploading && (
                <div className="mt-4 sm:mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-indigo-900">
                      {uploadProgress < 95 ? 'Uploading content...' : 
                       uploadProgress < 100 ? 'Upload complete, processing...' : 
                       'Finalizing...'}
                    </p>
                    <span className="text-sm font-semibold text-indigo-700">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-indigo-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-indigo-700 mt-2">
                    {uploadProgress < 95 
                      ? 'Please wait while your files are being uploaded to our servers...' 
                      : uploadProgress < 100
                      ? 'Files uploaded successfully! Processing content and generating thumbnails...'
                      : 'Almost done! Finalizing your content...'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Success State */}
          {currentStep === 'success' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Success Message */}
              <div className="bg-linear-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 sm:p-8 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 icon-3d-container icon-3d-green rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Content Submitted for Review</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Your content has been uploaded successfully and is now being reviewed.
                </p>
                <p className="text-sm text-gray-500">
                  We&apos;ll send you an email once your content is approved with your shareable link.
                </p>
              </div>

              {/* Content ID Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 icon-3d-container icon-3d-indigo rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Content ID</p>
                    <code className="text-lg font-mono font-semibold text-gray-900">{shortId}</code>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-amber-800">Review in Progress</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Typical review time is 1-2 minutes for images and up to 5 minutes for videos. You&apos;ll receive an email notification when approved.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => router.push('/creator')}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={handleRestart}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors text-sm"
                  >
                    Upload Another
                  </button>
                </div>
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
/**
 * Convert a File object to base64 string
 * @param file - The file to convert
 * @returns Promise resolving to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Validate a file for support ticket attachment
 * @param file - The file to validate
 * @returns Error message if invalid, null if valid
 */
export const validateSupportAttachment = (file: File): string | null => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'video/mp4'];

  if (file.size > MAX_SIZE) {
    return `File "${file.name}" exceeds 5MB limit`;
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return `File type not allowed. Use JPEG, PNG, or MP4.`;
  }

  return null;
};

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

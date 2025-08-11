// File validation utilities following ATS optimization rules from PRD
import { 
  FILE_UPLOAD_CONFIG, 
  UPLOAD_ERROR_CODES, 
  UploadError, 
  SupportedFileType,
  type UploadErrorCode 
} from '@/types/file-upload';

// Re-export for convenience
export { UPLOAD_ERROR_CODES } from '@/types/file-upload';

/**
 * Validates file type against supported formats (.pdf, .docx)
 * @param file - File to validate
 * @returns SupportedFileType or throws UploadError
 */
export function validateFileType(file: File): SupportedFileType {
  const mimeType = file.type;
  const extension = getFileExtension(file.name);

  // Check MIME type first
  if (mimeType in FILE_UPLOAD_CONFIG.SUPPORTED_TYPES) {
    return FILE_UPLOAD_CONFIG.SUPPORTED_TYPES[mimeType as keyof typeof FILE_UPLOAD_CONFIG.SUPPORTED_TYPES];
  }

  // Fallback to extension check for cases where MIME type might be missing
  if (extension === '.pdf') return 'pdf';
  if (extension === '.docx') return 'docx';

  throw createUploadError(
    UPLOAD_ERROR_CODES.INVALID_FILE_TYPE,
    `Unsupported file type. Please upload a PDF or DOCX file. Received: ${mimeType || 'unknown'} (${extension})`,
    file.name
  );
}

/**
 * Validates file size against 10MB limit per PRD
 * @param file - File to validate
 * @throws UploadError if file is too large
 */
export function validateFileSize(file: File): void {
  if (file.size > FILE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
    const maxSizeMB = FILE_UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    
    throw createUploadError(
      UPLOAD_ERROR_CODES.FILE_TOO_LARGE,
      `File size (${fileSizeMB}MB) exceeds the ${maxSizeMB}MB limit. Please choose a smaller file.`,
      file.name
    );
  }
}

/**
 * Validates if file appears to be corrupted based on basic checks
 * @param file - File to validate
 * @throws UploadError if file appears corrupted
 */
export function validateFileIntegrity(file: File): void {
  // Basic file integrity checks
  if (file.size === 0) {
    throw createUploadError(
      UPLOAD_ERROR_CODES.FILE_CORRUPTED,
      'File appears to be empty or corrupted. Please try a different file.',
      file.name
    );
  }

  // Check if file name is suspicious
  if (file.name.length === 0 || file.name === 'blob') {
    throw createUploadError(
      UPLOAD_ERROR_CODES.FILE_CORRUPTED,
      'File name appears invalid. Please ensure the file is not corrupted.',
      file.name
    );
  }
}

/**
 * Comprehensive file validation following PRD security requirements
 * @param file - File to validate
 * @returns SupportedFileType if valid
 * @throws UploadError if validation fails
 */
export function validateFile(file: File): SupportedFileType {
  if (!file) {
    throw createUploadError(
      UPLOAD_ERROR_CODES.NO_FILE_SELECTED,
      'No file selected. Please choose a PDF or DOCX file to upload.'
    );
  }

  // Run all validation checks
  validateFileIntegrity(file);
  validateFileSize(file);
  return validateFileType(file);
}

/**
 * Extracts file extension from filename
 * @param filename - Name of the file
 * @returns File extension including the dot (e.g., '.pdf')
 */
function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.slice(lastDotIndex).toLowerCase() : '';
}

/**
 * Creates a standardized UploadError object
 * @param code - Error code from UPLOAD_ERROR_CODES
 * @param message - Human-readable error message
 * @param filename - Optional filename for context
 * @returns UploadError object
 */
export function createUploadError(
  code: UploadErrorCode, 
  message: string, 
  filename?: string
): UploadError {
  return {
    code,
    message,
    file: filename,
  };
}

/**
 * Formats file size for display
 * @param bytes - File size in bytes
 * @returns Human-readable file size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Checks if browser supports File API (required for client-side processing)
 * @returns boolean indicating File API support
 */
export function isFileAPISupported(): boolean {
  if (typeof window === 'undefined') {
    return false; // Server-side rendering
  }
  return !!(window.File && window.FileReader && window.FileList && window.Blob);
}

/**
 * Gets user-friendly error message for display
 * @param error - UploadError object
 * @returns User-friendly error message
 */
export function getErrorMessage(error: UploadError): string {
  return error.message;
}

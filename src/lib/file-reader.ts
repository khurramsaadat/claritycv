// File reading utilities for client-side processing per PRD privacy requirements
import { 
  UploadedFile, 
  FileMetadata, 
  UploadProgress, 
  UPLOAD_ERROR_CODES
} from '@/types/file-upload';
import { validateFile, createUploadError } from './file-validation';

/**
 * Reads file as ArrayBuffer for processing by pdf-parse or mammoth.js
 * @param file - File to read
 * @param onProgress - Optional progress callback
 * @returns Promise resolving to UploadedFile with buffer
 */
export async function readFileAsBuffer(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const fileId = generateFileId();

    // Create file metadata
    const metadata: FileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    };

    // Handle progress updates
    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress: UploadProgress = {
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded / event.total) * 100),
        };
        onProgress(progress);
      }
    };

    // Handle successful read
    reader.onload = () => {
      try {
        const buffer = reader.result as ArrayBuffer;
        
        if (!buffer || buffer.byteLength === 0) {
          reject(createUploadError(
            UPLOAD_ERROR_CODES.FILE_READ_ERROR,
            'Failed to read file content. The file may be corrupted.',
            file.name
          ));
          return;
        }

        const uploadedFile: UploadedFile = {
          file,
          metadata,
          buffer,
          id: fileId,
        };

        resolve(uploadedFile);
      } catch (error) {
        reject(createUploadError(
          UPLOAD_ERROR_CODES.FILE_READ_ERROR,
          `Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          file.name
        ));
      }
    };

    // Handle read errors
    reader.onerror = () => {
      reject(createUploadError(
        UPLOAD_ERROR_CODES.FILE_READ_ERROR,
        'Failed to read the file. Please try again or choose a different file.',
        file.name
      ));
    };

    // Handle read abortion
    reader.onabort = () => {
      reject(createUploadError(
        UPLOAD_ERROR_CODES.FILE_READ_ERROR,
        'File reading was cancelled.',
        file.name
      ));
    };

    // Start reading the file
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Validates and reads a file with comprehensive error handling
 * @param file - File to validate and read
 * @param onProgress - Optional progress callback
 * @returns Promise resolving to UploadedFile with buffer
 */
export async function processUploadedFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedFile> {
  try {
    // First validate the file according to PRD requirements
    validateFile(file);
    
    // Read the file as buffer for parsing
    const uploadedFile = await readFileAsBuffer(file, onProgress);
    
    return uploadedFile;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      // Re-throw our custom UploadError
      throw error;
    }
    
    // Wrap unexpected errors
    throw createUploadError(
      UPLOAD_ERROR_CODES.PROCESSING_ERROR,
      `Unexpected error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      file.name
    );
  }
}

/**
 * Generates a unique ID for file tracking
 * @returns Unique string ID
 */
function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Creates a preview URL for file (if needed for UI)
 * @param file - File to create preview for
 * @returns Object URL for preview (remember to revoke after use)
 */
export function createFilePreviewURL(file: File): string {
  if (typeof window === 'undefined') {
    return ''; // Server-side rendering
  }
  return URL.createObjectURL(file);
}

/**
 * Revokes a file preview URL to free memory
 * @param url - URL to revoke
 */
export function revokeFilePreviewURL(url: string): void {
  if (typeof window === 'undefined') {
    return; // Server-side rendering
  }
  URL.revokeObjectURL(url);
}

/**
 * Estimates processing time based on file size
 * @param fileSize - File size in bytes
 * @returns Estimated processing time in milliseconds
 */
export function estimateProcessingTime(fileSize: number): number {
  // Simple estimation: ~1MB per second for processing
  const mbSize = fileSize / (1024 * 1024);
  return Math.max(1000, mbSize * 1000); // Minimum 1 second
}

/**
 * Checks if file reading is currently supported in this browser
 * @returns Boolean indicating support
 */
export function isFileReadingSupported(): boolean {
  if (typeof window === 'undefined') {
    return false; // Server-side rendering
  }
  return !!(window.FileReader && typeof FileReader.prototype.readAsArrayBuffer === 'function');
}

/**
 * Creates a safe filename for download (removes special characters)
 * @param originalName - Original filename
 * @param suffix - Optional suffix to add
 * @returns Safe filename
 */
export function createSafeFilename(originalName: string, suffix?: string): string {
  // Remove extension
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  
  // Remove special characters and replace with underscores
  const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '_');
  
  // Add suffix if provided
  const finalName = suffix ? `${safeName}_${suffix}` : safeName;
  
  return finalName;
}

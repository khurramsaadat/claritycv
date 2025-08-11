// File upload types and interfaces following workflow.mdc standards

export type SupportedFileType = 'pdf' | 'docx';

export type UploadState = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface UploadedFile {
  file: File;
  metadata: FileMetadata;
  buffer?: ArrayBuffer;
  id: string;
}

export interface UploadError {
  code: string;
  message: string;
  file?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadStatus {
  state: UploadState;
  file?: UploadedFile;
  error?: UploadError;
  progress?: UploadProgress;
}

// File validation constants per PRD requirements
export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB as specified in PRD
  SUPPORTED_TYPES: {
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    // Legacy DOCX MIME type for better compatibility
    'application/msword': 'docx',
  } as const,
  SUPPORTED_EXTENSIONS: ['.pdf', '.docx'] as const,
} as const;

// Error codes for consistent error handling
export const UPLOAD_ERROR_CODES = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_READ_ERROR: 'FILE_READ_ERROR',
  FILE_CORRUPTED: 'FILE_CORRUPTED',
  NO_FILE_SELECTED: 'NO_FILE_SELECTED',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
} as const;

export type UploadErrorCode = typeof UPLOAD_ERROR_CODES[keyof typeof UPLOAD_ERROR_CODES];

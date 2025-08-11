"use client";

import { useState, useCallback } from 'react';
import { 
  UploadStatus, 
  UploadedFile, 
  UploadError
} from '@/types/file-upload';

interface UseFileUploadReturn {
  uploadStatus: UploadStatus;
  isUploading: boolean;
  isProcessing: boolean;
  isComplete: boolean;
  hasError: boolean;
  uploadedFile: UploadedFile | undefined;
  error: UploadError | undefined;
  handleFileProcessed: (file: UploadedFile) => void;
  handleError: (error: UploadError) => void;
  resetUpload: () => void;
  clearError: () => void;
}

/**
 * Custom hook for managing file upload state following workflow.mdc standards
 * Provides centralized state management for file upload operations
 */
export function useFileUpload(): UseFileUploadReturn {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    state: 'idle'
  });

  // Computed state helpers
  const isUploading = uploadStatus.state === 'uploading';
  const isProcessing = uploadStatus.state === 'processing';
  const isComplete = uploadStatus.state === 'complete';
  const hasError = uploadStatus.state === 'error';

  const handleFileProcessed = useCallback((file: UploadedFile) => {
    setUploadStatus({
      state: 'complete',
      file,
      error: undefined,
      progress: {
        loaded: file.metadata.size,
        total: file.metadata.size,
        percentage: 100
      }
    });
  }, []);

  const handleError = useCallback((error: UploadError) => {
    setUploadStatus({
      state: 'error',
      error,
      file: undefined,
      progress: undefined
    });
  }, []);

  const resetUpload = useCallback(() => {
    setUploadStatus({
      state: 'idle',
      file: undefined,
      error: undefined,
      progress: undefined
    });
  }, []);

  const clearError = useCallback(() => {
    if (uploadStatus.state === 'error') {
      setUploadStatus({
        state: 'idle',
        file: undefined,
        error: undefined,
        progress: undefined
      });
    }
  }, [uploadStatus.state]);

  return {
    uploadStatus,
    isUploading,
    isProcessing, 
    isComplete,
    hasError,
    uploadedFile: uploadStatus.file,
    error: uploadStatus.error,
    handleFileProcessed,
    handleError,
    resetUpload,
    clearError
  };
}

"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  UploadStatus, 
  UploadProgress, 
  UploadedFile,
  UploadError,
  FILE_UPLOAD_CONFIG 
} from '@/types/file-upload';
import { processUploadedFile } from '@/lib/file-reader';
import { formatFileSize, getErrorMessage, isFileAPISupported } from '@/lib/file-validation';

interface FileUploaderProps {
  onFileProcessed: (file: UploadedFile) => void;
  onError: (error: UploadError) => void;
  disabled?: boolean;
  className?: string;
}

export function FileUploader({ 
  onFileProcessed, 
  onError, 
  disabled = false,
  className = "" 
}: FileUploaderProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    state: 'idle'
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use state to track File API support to avoid hydration mismatch
  const [isSupported, setIsSupported] = useState(true); // Assume supported initially
  
  useEffect(() => {
    // Check File API support after hydration
    setIsSupported(isFileAPISupported());
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    if (disabled) return;

    try {
      setUploadStatus({ state: 'uploading', file: undefined, error: undefined });

      const uploadedFile = await processUploadedFile(file, (progress: UploadProgress) => {
        setUploadStatus(prev => ({
          ...prev,
          state: 'processing',
          progress
        }));
      });

      setUploadStatus({ 
        state: 'complete', 
        file: uploadedFile,
        progress: { loaded: 100, total: 100, percentage: 100 }
      });

      onFileProcessed(uploadedFile);
    } catch (error) {
      const uploadError = error as UploadError;
      setUploadStatus({ 
        state: 'error', 
        error: uploadError 
      });
      onError(uploadError);
    }
  }, [disabled, onFileProcessed, onError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]); // Only process first file
    }
  }, [disabled, handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleClickUpload = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const resetUpload = useCallback(() => {
    setUploadStatus({ state: 'idle' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  if (!isSupported) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Browser Not Supported
          </h3>
          <p className="text-muted-foreground">
            Your browser doesn&apos;t support file uploads. Please use a modern browser 
            like Chrome, Firefox, Safari, or Edge.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { state, file, error, progress } = uploadStatus;

  return (
    <div className={`w-full ${className}`}>
      <Card 
        className={`
          transition-all duration-200 cursor-pointer
          ${isDragOver ? 'border-primary bg-primary/5 scale-105' : ''}
          ${state === 'error' ? 'border-destructive' : ''}
          ${state === 'complete' ? 'border-green-500' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickUpload}
      >
        <CardContent className="p-8 text-center">
          {state === 'idle' && (
            <div className="space-y-4">
              <Upload className={`h-16 w-16 mx-auto ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {isDragOver ? 'Drop your resume here' : 'Upload Your Resume'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop your resume or click to browse
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Supported formats: PDF, DOCX</p>
                  <p>Maximum size: {formatFileSize(FILE_UPLOAD_CONFIG.MAX_FILE_SIZE)}</p>
                  <p className="text-green-600 font-medium">Your data never leaves your browser</p>
                </div>
              </div>
              <Button variant="outline" size="lg" onClick={handleClickUpload}>
                Choose File
              </Button>
            </div>
          )}

          {(state === 'uploading' || state === 'processing') && (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {state === 'uploading' ? 'Reading File...' : 'Processing Resume...'}
                </h3>
                {progress && (
                  <div className="space-y-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {progress.percentage}% complete
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {state === 'complete' && file && (
            <div className="space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-green-700 mb-2">
                  File Ready for Processing
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>File:</strong> {file.metadata.name}</p>
                  <p><strong>Size:</strong> {formatFileSize(file.metadata.size)}</p>
                  <p><strong>Type:</strong> {file.metadata.type}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  resetUpload();
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Upload Different File
              </Button>
            </div>
          )}

          {state === 'error' && error && (
            <div className="space-y-4">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-destructive mb-2">
                  Upload Error
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {getErrorMessage(error)}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  resetUpload();
                }}
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}

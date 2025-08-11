"use client";

import { useEffect, useState, useCallback } from 'react';
import { processDocument, type ProcessingResult, type ProcessingProgress } from '@/lib/document-processor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Clock,
  FileCheck
} from 'lucide-react';
import type { UploadedFile } from '@/types/file-upload';

interface DocumentProcessorProps {
  uploadedFile: UploadedFile;
  onComplete: (result: ProcessingResult) => void;
  onError: (error: Error) => void;
  autoStart?: boolean;
}

export function DocumentProcessor({ 
  uploadedFile, 
  onComplete, 
  onError, 
  autoStart = false 
}: DocumentProcessorProps) {
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const handleStartProcessing = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const processingResult = await processDocument(uploadedFile, setProgress);
      setResult(processingResult);
      onComplete(processingResult);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Processing failed');
      setError(error);
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFile, onComplete, onError]);

  useEffect(() => {
    if (autoStart && !isProcessing && !result && !error) {
      handleStartProcessing();
    }
  }, [autoStart, isProcessing, result, error, handleStartProcessing]);

  const downloadFile = (content: string | Uint8Array, filename: string, mimeType: string) => {
    // Handle different content types for Blob creation
    const blobParts: BlobPart[] = typeof content === 'string' ? [content] : [content];
    const blob = new Blob(blobParts, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Processing Error
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error.message}
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setError(null);
              handleStartProcessing();
            }}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (result) {
    return (
      <div className="space-y-6">
        {/* Processing Complete Card */}
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-5 w-5" />
              ATS Optimization Complete!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {result.optimizedDocument.statistics.issuesFixed}
                </div>
                <div className="text-muted-foreground">Issues Fixed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {result.optimizedDocument.statistics.sectionsStandardized}
                </div>
                <div className="text-muted-foreground">Sections Standardized</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(result.processingTime / 1000).toFixed(1)}s
                </div>
                <div className="text-muted-foreground">Processing Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Your ATS-Optimized Resume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {result.downloadOptions.map((option, index) => (
                <Card key={index} className="border border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{option.label}</h4>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {formatFileSize(option.size)}
                      </Badge>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => downloadFile(option.content, option.filename, option.mimeType)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download {option.format.toUpperCase()}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Optimization Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              What We Optimized
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.optimizedDocument.optimizations.map((opt, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium">{opt.description}</div>
                    {opt.beforeSample && opt.afterSample && (
                      <div className="text-xs text-muted-foreground mt-1">
                        <span className="line-through">{opt.beforeSample}</span> → <span className="font-medium">{opt.afterSample}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {result.optimizedDocument.warnings.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Recommendations
                </h4>
                <div className="space-y-1">
                  {result.optimizedDocument.warnings.map((warning, index) => (
                    <div key={index} className="text-sm text-muted-foreground pl-6">
                      • {warning}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <FileText className="h-8 w-8 text-primary" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {progress?.message || 'Processing your resume...'}
              </h3>
              
              {progress && (
                <div className="space-y-3">
                  <Progress value={progress.progress} className="w-full max-w-md mx-auto" />
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Stage: {progress.stage}</span>
                    <span>•</span>
                    <span>{progress.progress}% complete</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Initial state - ready to process
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Ready to Optimize
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your resume has been uploaded successfully. Click below to start the ATS optimization process.
          </p>
          
          <div className="grid gap-2 text-sm text-muted-foreground">
            <div><strong>File:</strong> {uploadedFile.metadata.name}</div>
            <div><strong>Size:</strong> {formatFileSize(uploadedFile.metadata.size)}</div>
            <div><strong>Type:</strong> {uploadedFile.metadata.type}</div>
          </div>
          
          <Button size="lg" onClick={handleStartProcessing} className="w-full sm:w-auto">
            <FileCheck className="h-4 w-4 mr-2" />
            Start ATS Optimization
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

"use client";

import { useState } from 'react';
import { FileUploader } from './FileUploader';
import { useFileUpload } from '@/hooks/useFileUpload';
import { DocumentProcessor } from './DocumentProcessor';
import { ClientOnly } from '@/components/ClientOnly';
import { EditorInterface } from '../editor/EditorInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, Download, CheckCircle2, Edit3 } from 'lucide-react';
import type { ProcessingResult } from '@/lib/document-processor';

export function FileUploadSection() {
  const {
    isComplete,
    hasError,
    uploadedFile,
    error,
    handleFileProcessed,
    handleError,
    resetUpload
  } = useFileUpload();
  
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  
  const handleProcessingComplete = (result: ProcessingResult) => {
    setProcessingResult(result);
    setIsProcessing(false);
  };
  
  const handleProcessingError = (error: Error) => {
    handleError({
      code: 'PROCESSING_ERROR',
      message: error.message
    });
    setIsProcessing(false);
  };
  
  const startProcessing = () => {
    if (uploadedFile) {
      setIsProcessing(true);
    }
  };
  
  const resetAll = () => {
    setProcessingResult(null);
    setIsProcessing(false);
    setShowEditor(false);
    resetUpload();
  };

  const handleOpenEditor = () => {
    setShowEditor(true);
  };

  const handleBackFromEditor = () => {
    setShowEditor(false);
  };

  // Show editor interface if processing is complete and user wants to edit
  if (showEditor && processingResult) {
    return (
      <ClientOnly fallback={<div className="text-center p-8">Loading editor...</div>}>
        <EditorInterface
          processingResult={processingResult}
          onBack={handleBackFromEditor}
        />
      </ClientOnly>
    );
  }

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl mb-4">
              Get Started - Upload Your Resume
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your resume in seconds. Your document stays private and secure in your browser.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* File Upload Area - Takes up 2 columns */}
            <div className="lg:col-span-2">
              {!isComplete && !processingResult && (
                <FileUploader 
                  onFileProcessed={handleFileProcessed}
                  onError={handleError}
                  className="h-full"
                />
              )}
              
              {isComplete && uploadedFile && !processingResult && !isProcessing && (
                <ClientOnly fallback={<div className="text-center p-8">Loading processor...</div>}>
                  <DocumentProcessor
                    uploadedFile={uploadedFile}
                    onComplete={handleProcessingComplete}
                    onError={handleProcessingError}
                    autoStart={false}
                  />
                </ClientOnly>
              )}
              
              {isProcessing && uploadedFile && (
                <ClientOnly fallback={<div className="text-center p-8">Loading processor...</div>}>
                  <DocumentProcessor
                    uploadedFile={uploadedFile}
                    onComplete={handleProcessingComplete}
                    onError={handleProcessingError}
                    autoStart={true}
                  />
                </ClientOnly>
              )}
              
              {processingResult && (
                <ClientOnly fallback={<div className="text-center p-8">Loading results...</div>}>
                  <DocumentProcessor
                    uploadedFile={uploadedFile!}
                    onComplete={handleProcessingComplete}
                    onError={handleProcessingError}
                    autoStart={false}
                  />
                </ClientOnly>
              )}
            </div>

            {/* Privacy & Security Info - Takes up 1 column */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    100% Private
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>No server uploads</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>No data storage</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>No tracking or analytics</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Processing happens in your browser</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    Quick Process
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>1. Upload File</span>
                      <Badge variant="outline" className="text-xs">Instant</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>2. Process Resume</span>
                      <Badge variant="outline" className="text-xs">&lt;3 sec</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>3. Download Result</span>
                      <Badge variant="outline" className="text-xs">Ready</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {isComplete && uploadedFile && !processingResult && !isProcessing && (
                <Card className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle2 className="h-5 w-5" />
                      Ready to Process
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-green-600 dark:text-green-400 mb-3">
                      Your resume has been uploaded successfully and is ready for ATS optimization.
                    </p>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                      onClick={startProcessing}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Start Processing
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {(isProcessing || processingResult) && (
                <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <Zap className="h-5 w-5" />
                      {isProcessing ? 'Processing...' : 'Complete!'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                      {isProcessing 
                        ? 'Your resume is being optimized for ATS systems...' 
                        : 'Your ATS-optimized resume is ready for download!'
                      }
                    </p>
                    {processingResult && (
                      <div className="space-y-2">
                        <Button 
                          className="w-full"
                          onClick={handleOpenEditor}
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Resume
                        </Button>
                        <Button 
                          className="w-full"
                          variant="outline"
                          onClick={resetAll}
                        >
                          Process Another Resume
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {hasError && error && (
                <Card className="border-destructive bg-destructive/5">
                  <CardContent className="pt-6">
                    <p className="text-sm text-destructive mb-3">
                      {error.message}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={resetAll}
                      className="w-full"
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <div className="grid gap-4 sm:grid-cols-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Bank-level security</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span>Lightning fast processing</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Download className="h-4 w-4 text-purple-500" />
                <span>Multiple download formats</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

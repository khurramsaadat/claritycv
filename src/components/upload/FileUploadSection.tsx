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
                     <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                       <CardHeader className="pb-3">
                         <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-300">
                           <Shield className="h-5 w-5 text-green-500" />
                           100% Private & Secure
                         </CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-3">
                         <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-3">
                           Your resume never leaves your device. We guarantee it.
                         </div>
                         
                         <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                           <CheckCircle2 className="h-4 w-4 text-green-500" />
                           <span>Zero server uploads</span>
                         </div>
                         <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                           <CheckCircle2 className="h-4 w-4 text-green-500" />
                           <span>No data storage anywhere</span>
                         </div>
                         <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                           <CheckCircle2 className="h-4 w-4 text-green-500" />
                           <span>No tracking or analytics</span>
                         </div>
                         <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                           <CheckCircle2 className="h-4 w-4 text-green-500" />
                           <span>All processing in your browser</span>
                         </div>
                         
                         <div className="mt-3 p-2 bg-white dark:bg-green-900 border border-green-200 dark:border-green-700 rounded text-xs text-green-600 dark:text-green-400">
                           <strong>How we&apos;re different:</strong> Unlike other tools that upload your resume to servers, 
                           ClarityCV processes everything locally using advanced browser technology. Your data is 100% yours.
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

                           {/* Enhanced Privacy Notice */}
                 <div className="mt-8">
                   <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                     <div className="flex items-center justify-center gap-2 mb-3">
                       <Shield className="h-6 w-6 text-green-500" />
                       <span className="text-lg font-semibold text-green-700 dark:text-green-300">Privacy-First Promise</span>
                     </div>
                     
                     <p className="text-sm text-green-600 dark:text-green-400 max-w-2xl mx-auto mb-4">
                       We built ClarityCV with privacy as our foundation. Your resume data is processed entirely in your browser 
                       using advanced client-side technology. No servers, no uploads, no exceptions.
                     </p>
                     
                     <div className="grid gap-3 sm:grid-cols-3 text-sm">
                       <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                         <Shield className="h-4 w-4" />
                         <span>Military-grade privacy</span>
                       </div>
                       <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                         <Zap className="h-4 w-4" />
                         <span>Instant processing</span>
                       </div>
                       <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400">
                         <Download className="h-4 w-4" />
                         <span>Professional formats</span>
                       </div>
                     </div>
                   </div>
                 </div>
        </div>
      </div>
    </section>
  );
}

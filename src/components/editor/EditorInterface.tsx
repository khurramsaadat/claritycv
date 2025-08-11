"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  FileText, 
  Edit3, 
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react';
import { ResumeEditor } from './ResumeEditor';
import { SectionManager } from './SectionManager';
import { ATSComparison } from './ATSComparison';
import { cn } from '@/lib/utils';
import type { ProcessingResult } from '@/lib/document-processor';
import type { DetectedSection } from '@/lib/ats-optimizer';

interface EditorInterfaceProps {
  processingResult: ProcessingResult;
  onBack?: () => void;
  onDownload?: (format: 'txt' | 'docx') => void;
  className?: string;
}

export function EditorInterface({ 
  processingResult, 
  onBack, 
  onDownload, 
  className 
}: EditorInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'sections' | 'comparison'>('editor');
  const [currentContent, setCurrentContent] = useState(processingResult.optimizedDocument.content);
  const [currentSections, setCurrentSections] = useState(processingResult.optimizedDocument.sections);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges) {
      setIsAutoSaving(true);
      const timeoutId = setTimeout(() => {
        // Save to localStorage
        const editorData = {
          content: currentContent,
          sections: currentSections,
          timestamp: new Date().toISOString(),
          originalFileName: processingResult.originalDocument.originalFileName || 'resume'
        };
        localStorage.setItem('claritycv-editor-session', JSON.stringify(editorData));
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        setIsAutoSaving(false);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [currentContent, currentSections, hasUnsavedChanges, processingResult.originalDocument.originalFileName]);

  // Load saved session on mount
  useEffect(() => {
    const savedData = localStorage.getItem('claritycv-editor-session');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.originalFileName === (processingResult.originalDocument.originalFileName || 'resume')) {
          setCurrentContent(parsedData.content);
          setCurrentSections(parsedData.sections);
          setLastSaved(new Date(parsedData.timestamp));
        }
      } catch (error) {
        console.warn('Failed to restore editor session:', error);
      }
    }
  }, [processingResult.originalDocument.originalFileName]);

  const handleContentChange = (newContent: string) => {
    setCurrentContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleSectionsChange = (newSections: DetectedSection[]) => {
    setCurrentSections(newSections);
    setHasUnsavedChanges(true);
    
    // Regenerate content from sections
    const newContent = newSections
      .map(section => `${section.standardTitle}\n\n${section.content}`)
      .join('\n\n---\n\n');
    setCurrentContent(newContent);
  };

  const handleManualSave = () => {
    const editorData = {
      content: currentContent,
      sections: currentSections,
      timestamp: new Date().toISOString(),
      originalFileName: processingResult.originalDocument.originalFileName || 'resume'
    };
    localStorage.setItem('claritycv-editor-session', JSON.stringify(editorData));
    setLastSaved(new Date());
    setHasUnsavedChanges(false);
  };

  const handleDownload = (format: 'txt' | 'docx') => {
    // Find the matching download option
    const downloadOption = processingResult.downloadOptions.find(option => option.format === format);
    if (downloadOption) {
      // Create updated content blob with proper type handling
      const updatedContent = format === 'txt' ? currentContent : downloadOption.content;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = new Blob([updatedContent as any], { type: downloadOption.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadOption.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    onDownload?.(format);
  };

  const clearSession = () => {
    localStorage.removeItem('claritycv-editor-session');
    setCurrentContent(processingResult.optimizedDocument.content);
    setCurrentSections(processingResult.optimizedDocument.sections);
    setHasUnsavedChanges(false);
    setLastSaved(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatLastSaved = (date: Date | null): string => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn("w-full min-h-screen bg-background", className)}>
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-4">
                {onBack && (
                  <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                <div>
                  <h1 className="text-lg font-semibold">Resume Editor</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{processingResult.originalDocument.originalFileName || 'Untitled'}</span>
                    {hasUnsavedChanges && (
                      <Badge variant="secondary" className="text-xs">
                        Unsaved changes
                      </Badge>
                    )}
                    {isAutoSaving && (
                      <Badge variant="outline" className="text-xs">
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Saving...
                      </Badge>
                    )}
                    {lastSaved && (
                      <span className="text-xs">
                        Last saved: {formatLastSaved(lastSaved)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualSave}
                  disabled={!hasUnsavedChanges}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                
                <div className="flex items-center gap-1">
                  {processingResult.downloadOptions.map((option) => (
                    <Button
                      key={option.format}
                      size="sm"
                      onClick={() => handleDownload(option.format as 'txt' | 'docx')}
                      className="h-8"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {option.format.toUpperCase()}
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {formatFileSize(option.size)}
                      </Badge>
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSession}
                  className="text-muted-foreground"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="mx-auto max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab as (value: string) => void}>
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-6">
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="sections" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Sections
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-6">
              <ResumeEditor
                optimizedDocument={{
                  ...processingResult.optimizedDocument,
                  content: currentContent,
                  sections: currentSections
                }}
                onSave={handleContentChange}
                onDownload={() => handleDownload('docx')}
              />
            </TabsContent>

            <TabsContent value="sections" className="space-y-6">
              <SectionManager
                sections={currentSections}
                onSectionsChange={handleSectionsChange}
              />
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              <ATSComparison
                originalDocument={processingResult.originalDocument}
                optimizedDocument={{
                  ...processingResult.optimizedDocument,
                  content: currentContent,
                  sections: currentSections
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

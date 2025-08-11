"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  RotateCcw, 
  RotateCw,
  Save,
  Download,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ATSOptimizedDocument } from '@/lib/ats-optimizer';

interface ResumeEditorProps {
  optimizedDocument: ATSOptimizedDocument;
  onSave?: (content: string) => void;
  onDownload?: () => void;
  className?: string;
}

interface EditorState {
  content: string;
  history: string[];
  historyIndex: number;
  hasChanges: boolean;
  wordCount: number;
  characterCount: number;
}

interface ATSScore {
  overall: number;
  sections: number;
  formatting: number;
  keywords: number;
  readability: number;
}

export function ResumeEditor({ 
  optimizedDocument, 
  onSave, 
  onDownload, 
  className 
}: ResumeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [editorState, setEditorState] = useState<EditorState>({
    content: optimizedDocument.content,
    history: [optimizedDocument.content],
    historyIndex: 0,
    hasChanges: false,
    wordCount: 0,
    characterCount: 0
  });
  const [atsScore] = useState<ATSScore>({
    overall: 85,
    sections: 90,
    formatting: 88,
    keywords: 75,
    readability: 82
  });

  // Calculate word and character count
  useEffect(() => {
    const text = editorState.content;
    const wordCount = text.trim().split(/\s+/).length;
    const characterCount = text.length;
    
    setEditorState(prev => ({
      ...prev,
      wordCount,
      characterCount
    }));
  }, [editorState.content]);

  // Auto-save to localStorage
  useEffect(() => {
    if (editorState.hasChanges) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('claritycv-draft', editorState.content);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [editorState.content, editorState.hasChanges]);

  const updateContent = (newContent: string) => {
    setEditorState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newContent);
      
      return {
        ...prev,
        content: newContent,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        hasChanges: true
      };
    });
  };

  const handleUndo = () => {
    if (editorState.historyIndex > 0) {
      setEditorState(prev => ({
        ...prev,
        historyIndex: prev.historyIndex - 1,
        content: prev.history[prev.historyIndex - 1],
        hasChanges: true
      }));
    }
  };

  const handleRedo = () => {
    if (editorState.historyIndex < editorState.history.length - 1) {
      setEditorState(prev => ({
        ...prev,
        historyIndex: prev.historyIndex + 1,
        content: prev.history[prev.historyIndex + 1],
        hasChanges: true
      }));
    }
  };

  const applyFormatting = (command: string, value?: string) => {
    if (editorRef.current) {
      document.execCommand(command, false, value);
      const newContent = editorRef.current.innerHTML;
      updateContent(newContent);
    }
  };

  const handleSave = () => {
    onSave?.(editorState.content);
    setEditorState(prev => ({ ...prev, hasChanges: false }));
  };

  const getATSScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getATSScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Editor Toolbar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Resume Editor</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {editorState.wordCount} words
              </Badge>
              <Badge variant="outline" className="text-xs">
                {editorState.characterCount} chars
              </Badge>
              {editorState.hasChanges && (
                <Badge variant="secondary" className="text-xs">
                  Unsaved
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formatting Toolbar */}
          <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyFormatting('bold')}
                className="h-8 w-8 p-0"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyFormatting('italic')}
                className="h-8 w-8 p-0"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyFormatting('underline')}
                className="h-8 w-8 p-0"
              >
                <Underline className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyFormatting('insertUnorderedList')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="h-4 w-px bg-border" />
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={editorState.historyIndex === 0}
                className="h-8 w-8 p-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={editorState.historyIndex === editorState.history.length - 1}
                className="h-8 w-8 p-0"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-4 w-px bg-border" />

            <div className="flex items-center gap-1 ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="h-8 px-3"
              >
                {isPreviewMode ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Edit
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={!editorState.hasChanges}
                className="h-8 px-3"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button
                size="sm"
                onClick={onDownload}
                className="h-8 px-3"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {/* ATS Score Panel */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 border rounded-lg bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Overall Score</div>
              <Badge 
                variant={getATSScoreBadgeVariant(atsScore.overall)}
                className="text-lg font-bold px-3 py-1"
              >
                {atsScore.overall}%
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Sections</div>
              <div className={cn("text-sm font-semibold", getATSScoreColor(atsScore.sections))}>
                {atsScore.sections}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Format</div>
              <div className={cn("text-sm font-semibold", getATSScoreColor(atsScore.formatting))}>
                {atsScore.formatting}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Keywords</div>
              <div className={cn("text-sm font-semibold", getATSScoreColor(atsScore.keywords))}>
                {atsScore.keywords}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Readability</div>
              <div className={cn("text-sm font-semibold", getATSScoreColor(atsScore.readability))}>
                {atsScore.readability}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor Content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="md:col-span-2">
          <Card className="h-[600px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                {isPreviewMode ? 'Preview' : 'Edit Mode'}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full pb-6">
              {isPreviewMode ? (
                <div 
                  className="w-full h-full p-4 bg-white text-black border rounded-lg overflow-auto text-sm leading-relaxed font-mono"
                  style={{ fontFamily: 'Courier New, monospace' }}
                  dangerouslySetInnerHTML={{ __html: editorState.content }}
                />
              ) : (
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => updateContent(e.currentTarget.innerHTML)}
                  className="w-full h-full p-4 border rounded-lg overflow-auto focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm leading-relaxed"
                  style={{ minHeight: '500px' }}
                  dangerouslySetInnerHTML={{ __html: editorState.content }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* ATS Suggestions Sidebar */}
        <div className="space-y-4">
          {/* Optimization Tips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                ATS Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-green-800 dark:text-green-200">Great section headers!</div>
                  <div className="text-green-700 dark:text-green-300">Using standard ATS section names</div>
                </div>
              </div>
              
              <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-yellow-800 dark:text-yellow-200">Add more keywords</div>
                  <div className="text-yellow-700 dark:text-yellow-300">Include industry-specific terms</div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-blue-800 dark:text-blue-200">Quantify achievements</div>
                  <div className="text-blue-700 dark:text-blue-300">Add numbers and percentages</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Management */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {optimizedDocument.sections.map((section, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">{section.standardTitle}</span>
                  <Badge variant="outline" className="text-xs">
                    {section.content.split('\n').length} lines
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

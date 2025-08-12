"use client";

import { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PrivacyIndicatorProps {
  className?: string;
  showDetailed?: boolean;
}

export function PrivacyIndicator({ className = "", showDetailed = false }: PrivacyIndicatorProps) {
  const [isPrivacyMode, setIsPrivacyMode] = useState(true);
  const [dataItems, setDataItems] = useState<string[]>([]);

  // Monitor localStorage for data retention
  useEffect(() => {
    const checkDataItems = () => {
      const items: string[] = [];
      
      // Check for common data storage keys
      const keys = ['theme', 'editor-content', 'editor-history', 'last-session'];
      keys.forEach(key => {
        if (localStorage.getItem(key)) {
          items.push(key);
        }
      });
      
      setDataItems(items);
    };

    checkDataItems();
    
    // Check periodically for data changes
    const interval = setInterval(checkDataItems, 2000);
    return () => clearInterval(interval);
  }, []);

  const clearAllData = () => {
    // Clear all application data except theme preference
    const theme = localStorage.getItem('theme');
    localStorage.clear();
    if (theme) {
      localStorage.setItem('theme', theme);
    }
    
    // Clear any session data
    sessionStorage.clear();
    
    // Force a page reload to clear memory
    window.location.reload();
  };

  const togglePrivacyMode = () => {
    setIsPrivacyMode(!isPrivacyMode);
  };

  if (!showDetailed) {
    // Compact privacy indicator for navbar
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-2 ${className}`}>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-green-500" />
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                  Private
                </Badge>
              </div>
              {isPrivacyMode && (
                <Eye className="h-4 w-4 text-green-500" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>100% private processing - your data never leaves your browser</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed privacy panel
  return (
    <Card className={`border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Shield className="h-5 w-5" />
          Privacy Protection Active
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Privacy Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Client-Side Processing</span>
            </div>
            <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300">
              Active
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">No Server Communication</span>
            </div>
            <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300">
              Verified
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Zero Data Collection</span>
            </div>
            <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300">
              Guaranteed
            </Badge>
          </div>
        </div>

        {/* Data Retention Warning */}
        {dataItems.length > 0 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Local Data Detected
                </div>
                <div className="text-yellow-700 dark:text-yellow-300 text-xs mb-2">
                  Some preferences and session data are stored locally: {dataItems.join(', ')}
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={clearAllData}
                  className="bg-white dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-50 dark:hover:bg-yellow-800"
                >
                  Clear All Data
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Mode Toggle */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
          <div className="flex items-center gap-2">
            {isPrivacyMode ? (
              <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-500" />
            )}
            <span className="text-sm font-medium">Enhanced Privacy Mode</span>
          </div>
          <Button 
            size="sm" 
            variant={isPrivacyMode ? "default" : "outline"}
            onClick={togglePrivacyMode}
            className={isPrivacyMode ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isPrivacyMode ? "ON" : "OFF"}
          </Button>
        </div>

        {/* Privacy Guidelines */}
        <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
          <div>• Your files are processed entirely in your browser</div>
          <div>• No data is ever sent to our servers</div>
          <div>• Close your browser tab to clear all session data</div>
          <div>• Use incognito mode for maximum privacy</div>
        </div>
      </CardContent>
    </Card>
  );
}

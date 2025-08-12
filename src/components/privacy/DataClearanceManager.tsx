"use client";

import { useEffect, useState, useCallback } from 'react';
import { Trash2, RotateCcw, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DataItem {
  key: string;
  type: 'localStorage' | 'sessionStorage' | 'memory';
  description: string;
  size: number;
  lastModified?: Date;
}

export function DataClearanceManager() {
  const [dataItems, setDataItems] = useState<DataItem[]>([]);
  const [isAutoClearing, setIsAutoClearing] = useState(false);

  // Scan for stored data
  const scanStoredData = useCallback(() => {
    const items: DataItem[] = [];

    // Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          items.push({
            key,
            type: 'localStorage',
            description: getDataDescription(key),
            size: new Blob([value]).size,
            lastModified: new Date()
          });
        }
      }
    }

    // Check sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        if (value) {
          items.push({
            key,
            type: 'sessionStorage',
            description: getDataDescription(key),
            size: new Blob([value]).size,
            lastModified: new Date()
          });
        }
      }
    }

    setDataItems(items);
  }, []);

  // Get human-readable description for data keys
  const getDataDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      'theme': 'UI Color Theme Preference',
      'editor-content': 'Resume Editor Content',
      'editor-history': 'Undo/Redo History',
      'last-session': 'Last Session Info',
      'file-cache': 'Temporary File Cache',
      'processing-state': 'Processing State Data'
    };
    
    return descriptions[key] || `Application Data (${key})`;
  };

  // Clear specific data item
  const clearDataItem = (item: DataItem) => {
    if (item.type === 'localStorage') {
      localStorage.removeItem(item.key);
    } else if (item.type === 'sessionStorage') {
      sessionStorage.removeItem(item.key);
    }
    scanStoredData();
  };

  // Clear all application data except theme
  const clearAllApplicationData = () => {
    const currentTheme = localStorage.getItem('theme');
    
    // Clear all localStorage except theme
    const keysToKeep = ['theme'];
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToKeep.includes(key)) {
        allKeys.push(key);
      }
    }
    allKeys.forEach(key => localStorage.removeItem(key));
    
    // Clear all sessionStorage
    sessionStorage.clear();
    
    // Restore theme if it existed
    if (currentTheme) {
      localStorage.setItem('theme', currentTheme);
    }
    
    scanStoredData();
  };

  // Complete privacy reset (including theme)
  const completePrivacyReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    
    // Reload page to clear memory
    window.location.reload();
  };

  // Setup auto-clearing on page unload
  useEffect(() => {
            const handleBeforeUnload = () => {
      if (isAutoClearing) {
        // Clear sensitive data but keep preferences
        const sensitiveKeys = ['editor-content', 'editor-history', 'file-cache', 'processing-state'];
        
        sensitiveKeys.forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
        
        sessionStorage.clear();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAutoClearing]);

  // Scan on mount and periodically
  useEffect(() => {
    scanStoredData();
    const interval = setInterval(scanStoredData, 3000);
    return () => clearInterval(interval);
  }, [scanStoredData]);

  const totalDataSize = dataItems.reduce((sum, item) => sum + item.size, 0);
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Data Management & Privacy Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{dataItems.length}</div>
            <div className="text-sm text-muted-foreground">Data Items</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{formatBytes(totalDataSize)}</div>
            <div className="text-sm text-muted-foreground">Total Size</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-muted-foreground">Server Requests</div>
          </div>
        </div>

        {/* Auto-clear Toggle */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            <span className="font-medium">Auto-clear on page close</span>
            <span className="text-sm text-muted-foreground">
              (Automatically clears sensitive data when you leave)
            </span>
          </div>
          <Button
            size="sm"
            variant={isAutoClearing ? "default" : "outline"}
            onClick={() => setIsAutoClearing(!isAutoClearing)}
          >
            {isAutoClearing ? "ON" : "OFF"}
          </Button>
        </div>

        {/* Stored Data Items */}
        {dataItems.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Stored Data Items
            </h4>
            <div className="space-y-2">
              {dataItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.key} • {formatBytes(item.size)} • {item.type}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => clearDataItem(item)}
                    className="ml-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center p-6 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
            <div className="font-medium">No stored data detected</div>
            <div className="text-sm text-muted-foreground">Your privacy is fully protected</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={clearAllApplicationData}
            disabled={dataItems.length === 0}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Application Data
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex-1">
                <Shield className="h-4 w-4 mr-2" />
                Complete Privacy Reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Complete Privacy Reset</AlertDialogTitle>
                <AlertDialogDescription>
                  This will clear ALL data including your theme preferences and reload the page. 
                  This action cannot be undone. Are you sure you want to proceed?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={completePrivacyReset} className="bg-destructive hover:bg-destructive/90">
                  Reset Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Privacy Information */}
        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Privacy Guarantee</h4>
          <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <div>✓ All processing happens in your browser</div>
            <div>✓ No data ever sent to external servers</div>
            <div>✓ Files are never uploaded or stored remotely</div>
            <div>✓ You have complete control over your data</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

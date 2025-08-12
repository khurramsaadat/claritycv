"use client";

import { useState, useEffect } from 'react';
import { Activity, Zap, HardDrive, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { memoryManager } from '@/lib/performance/memory-manager';
import { lazyLoader } from '@/lib/performance/lazy-loader';

interface PerformanceMonitorProps {
  className?: string;
  compact?: boolean;
}

export function PerformanceMonitor({ className = "", compact = false }: PerformanceMonitorProps) {
  const [memoryStats, setMemoryStats] = useState<{
    fileCount: number;
    storedSize: string;
    memoryUsage: string;
    memoryLimit: string;
    usagePercent: string;
  } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<Record<string, boolean>>({});
  const [loadedStatus, setLoadedStatus] = useState<Record<string, boolean>>({});
  const [performanceData, setPerformanceData] = useState<{
    pageLoadTime: number;
    libraryLoadTimes: Record<string, number>;
    processingTimes: number[];
  }>({
    pageLoadTime: 0,
    libraryLoadTimes: {},
    processingTimes: []
  });

  // Update performance data periodically
  useEffect(() => {
    const updateStats = () => {
      // Get memory statistics
      const summary = memoryManager.getSummary();
      setMemoryStats(summary);

      // Get library loading status
      const loading = lazyLoader.getLoadingStatus();
      const loaded = lazyLoader.getLoadedStatus();
      setLoadingStatus(loading);
      setLoadedStatus(loaded);

      // Calculate page load time if available
      if (typeof performance !== 'undefined' && performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        if (loadTime > 0) {
          setPerformanceData(prev => ({
            ...prev,
            pageLoadTime: loadTime
          }));
        }
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const getMemoryUsageColor = (usagePercent: string) => {
    const percent = parseFloat(usagePercent);
    if (percent < 50) return 'text-green-600';
    if (percent < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceScore = () => {
    // Simple performance scoring based on available metrics
    let score = 100;
    
    if (memoryStats?.usagePercent) {
      const usage = parseFloat(memoryStats.usagePercent);
      if (usage > 80) score -= 30;
      else if (usage > 60) score -= 15;
    }

    if (performanceData.pageLoadTime > 3000) score -= 20;
    else if (performanceData.pageLoadTime > 1500) score -= 10;

    return Math.max(0, Math.min(100, score));
  };

  if (compact) {
    // Compact view for header/navbar
    const score = getPerformanceScore();
    const scoreColor = score > 80 ? 'text-green-600' : score > 60 ? 'text-yellow-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Activity className="h-4 w-4 text-muted-foreground" />
        <Badge variant="outline" className={`${scoreColor} border-current`}>
          {score}% Performance
        </Badge>
      </div>
    );
  }

  // Full performance dashboard
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Score */}
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {getPerformanceScore()}%
          </div>
          <div className="text-sm text-muted-foreground">Overall Performance Score</div>
          <Progress value={getPerformanceScore()} className="mt-2" />
        </div>

        {/* Memory Usage */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Memory Usage
          </h4>
          
          {memoryStats && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>JS Heap Usage</span>
                  <span className={getMemoryUsageColor(memoryStats.usagePercent)}>
                    {memoryStats.usagePercent}%
                  </span>
                </div>
                <Progress 
                  value={parseFloat(memoryStats.usagePercent)} 
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground">
                  {memoryStats.memoryUsage} / {memoryStats.memoryLimit}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Stored Files</span>
                  <span className="text-primary">{memoryStats.fileCount}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {memoryStats.storedSize} total
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Library Loading Status */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Library Status
          </h4>
          
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(loadedStatus).map(([library, loaded]) => (
              <div key={library} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm capitalize">{library}</span>
                <div className="flex items-center gap-2">
                  {loadingStatus[library] && (
                    <Badge variant="outline" className="text-xs">Loading...</Badge>
                  )}
                  <Badge 
                    variant={loaded ? "default" : "outline"}
                    className="text-xs"
                  >
                    {loaded ? "Loaded" : "Pending"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timing Metrics
          </h4>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="text-sm font-medium">Page Load Time</div>
              <div className="text-2xl font-bold text-primary">
                {performanceData.pageLoadTime ? `${(performanceData.pageLoadTime / 1000).toFixed(2)}s` : 'N/A'}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium">Libraries Loaded</div>
              <div className="text-2xl font-bold text-primary">
                {Object.values(loadedStatus).filter(Boolean).length}/{Object.keys(loadedStatus).length}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance Tips
          </h4>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <div>• ClarityCV loads libraries only when needed</div>
            <div>• Close browser tabs to free up memory</div>
            <div>• Use incognito mode for maximum performance</div>
            <div>• Larger files may take longer to process</div>
          </div>
        </div>

        {/* Memory Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => memoryManager.clearAllFiles()}
            className="flex-1 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded border text-center"
          >
            Clear Memory
          </button>
          <button
                      onClick={() => {
            if ('gc' in window) {
              (window as unknown as { gc: () => void }).gc();
            }
          }}
            className="flex-1 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded border text-center"
            disabled={typeof window === 'undefined' || !('gc' in window)}
          >
            Force GC
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

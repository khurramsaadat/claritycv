// Memory management utilities for optimal performance
interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface FileReference {
  id: string;
  size: number;
  type: string;
  createdAt: Date;
  data: ArrayBuffer | string;
}

class MemoryManager {
  private fileReferences = new Map<string, FileReference>();
  private cleanupTimeout: NodeJS.Timeout | null = null;
  private readonly MAX_MEMORY_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly CLEANUP_INTERVAL = 30000; // 30 seconds

  constructor() {
    // Start automatic cleanup
    this.startAutomaticCleanup();
    
    // Monitor memory warnings
    this.monitorMemoryWarnings();
  }

  /**
   * Store file data with automatic cleanup
   */
  storeFileData(id: string, data: ArrayBuffer | string, type: string): void {
    const size = data instanceof ArrayBuffer ? data.byteLength : new Blob([data]).size;
    
    // Check if we're approaching memory limits
    if (this.getTotalStoredSize() + size > this.MAX_MEMORY_SIZE) {
      console.warn('⚠️ Approaching memory limit, cleaning up old files...');
      this.cleanupOldFiles();
    }

    // Store the file reference
    this.fileReferences.set(id, {
      id,
      size,
      type,
      createdAt: new Date(),
      data
    });

    console.log(`📁 Stored file ${id} (${this.formatBytes(size)})`);
    this.logMemoryStats();
  }

  /**
   * Retrieve stored file data
   */
  getFileData(id: string): ArrayBuffer | string | null {
    const ref = this.fileReferences.get(id);
    if (ref) {
      // Update access time by recreating the entry
      ref.createdAt = new Date();
      return ref.data;
    }
    return null;
  }

  /**
   * Remove specific file from memory
   */
  removeFile(id: string): boolean {
    const removed = this.fileReferences.delete(id);
    if (removed) {
      console.log(`🗑️ Removed file ${id} from memory`);
      this.logMemoryStats();
    }
    return removed;
  }

  /**
   * Clear all stored files
   */
  clearAllFiles(): void {
    const count = this.fileReferences.size;
    this.fileReferences.clear();
    console.log(`🧹 Cleared ${count} files from memory`);
    this.logMemoryStats();
  }

  /**
   * Get total size of stored data
   */
  getTotalStoredSize(): number {
    let total = 0;
    this.fileReferences.forEach(ref => {
      total += ref.size;
    });
    return total;
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): MemoryStats | null {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as unknown as { memory: MemoryStats }).memory;
    }
    return null;
  }

  /**
   * Cleanup old files based on age and memory pressure
   */
  private cleanupOldFiles(): void {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago
    
    let removedCount = 0;
    let freedBytes = 0;

    this.fileReferences.forEach((ref, id) => {
      if (ref.createdAt < cutoffTime) {
        freedBytes += ref.size;
        this.fileReferences.delete(id);
        removedCount++;
      }
    });

    if (removedCount > 0) {
      console.log(`🧹 Auto-cleanup: removed ${removedCount} old files, freed ${this.formatBytes(freedBytes)}`);
      this.logMemoryStats();
    }
  }

  /**
   * Start automatic cleanup process
   */
  private startAutomaticCleanup(): void {
    this.cleanupTimeout = setInterval(() => {
      this.cleanupOldFiles();
      this.checkMemoryPressure();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Stop automatic cleanup
   */
  stopAutomaticCleanup(): void {
    if (this.cleanupTimeout) {
      clearInterval(this.cleanupTimeout);
      this.cleanupTimeout = null;
    }
  }

  /**
   * Check for memory pressure and warn user
   */
  private checkMemoryPressure(): void {
    const stats = this.getMemoryStats();
    if (stats) {
      const usagePercent = (stats.usedJSHeapSize / stats.jsHeapSizeLimit) * 100;
      
      if (usagePercent > 80) {
        console.warn(`⚠️ High memory usage: ${usagePercent.toFixed(1)}%`);
        this.forceCleanup();
      }
    }
  }

  /**
   * Force aggressive cleanup under memory pressure
   */
  private forceCleanup(): void {
    console.log('🚨 Forcing aggressive cleanup due to memory pressure...');
    
    // Remove all but the most recent 2 files
    const entries = Array.from(this.fileReferences.entries())
      .sort(([,a], [,b]) => b.createdAt.getTime() - a.createdAt.getTime());
    
    let removedCount = 0;
    let freedBytes = 0;
    
    entries.slice(2).forEach(([id, ref]) => {
      freedBytes += ref.size;
      this.fileReferences.delete(id);
      removedCount++;
    });

    if (removedCount > 0) {
      console.log(`🧹 Emergency cleanup: removed ${removedCount} files, freed ${this.formatBytes(freedBytes)}`);
    }

    // Request garbage collection if available
    if ('gc' in window) {
      (window as unknown as { gc: () => void }).gc();
      console.log('🗑️ Forced garbage collection');
    }
  }

  /**
   * Monitor for memory warnings
   */
  private monitorMemoryWarnings(): void {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Listen for memory pressure events if available
    if (typeof navigator !== 'undefined' && 'onmemorywarning' in navigator) {
      (navigator as unknown as { onmemorywarning: () => void }).onmemorywarning = () => {
        console.warn('🚨 System memory warning received');
        this.forceCleanup();
      };
    }

    // Monitor page visibility to cleanup when hidden
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          console.log('📱 Page hidden, performing cleanup...');
          this.cleanupOldFiles();
        }
      });
    }
  }

  /**
   * Log current memory statistics
   */
  private logMemoryStats(): void {
    const stats = this.getMemoryStats();
    const storedSize = this.getTotalStoredSize();
    const fileCount = this.fileReferences.size;

    console.log(`📊 Memory: ${fileCount} files, ${this.formatBytes(storedSize)} stored`);
    
    if (stats) {
      const usagePercent = (stats.usedJSHeapSize / stats.jsHeapSizeLimit) * 100;
      console.log(`📊 JS Heap: ${this.formatBytes(stats.usedJSHeapSize)}/${this.formatBytes(stats.jsHeapSizeLimit)} (${usagePercent.toFixed(1)}%)`);
    }
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get summary for UI display
   */
  getSummary() {
    const stats = this.getMemoryStats();
    const storedSize = this.getTotalStoredSize();
    const fileCount = this.fileReferences.size;

    return {
      fileCount,
      storedSize: this.formatBytes(storedSize),
      memoryUsage: stats ? this.formatBytes(stats.usedJSHeapSize) : 'Unknown',
      memoryLimit: stats ? this.formatBytes(stats.jsHeapSizeLimit) : 'Unknown',
      usagePercent: stats ? ((stats.usedJSHeapSize / stats.jsHeapSizeLimit) * 100).toFixed(1) : 'Unknown'
    };
  }

  /**
   * Cleanup on app exit
   */
  destroy(): void {
    this.stopAutomaticCleanup();
    this.clearAllFiles();
    console.log('🧹 Memory manager destroyed');
  }
}

// Singleton instance
export const memoryManager = new MemoryManager();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    memoryManager.destroy();
  });
}

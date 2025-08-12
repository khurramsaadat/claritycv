// Lazy loading utilities for performance optimization
export type LibraryName = 'pdfjs' | 'mammoth' | 'docx' | 'dnd';

interface LibraryModule {
  loaded: boolean;
  loading: Promise<unknown> | null;
  module: unknown;
}

class LazyLibraryLoader {
  private libraries = new Map<LibraryName, LibraryModule>();

  constructor() {
    // Initialize library states
    const libraryNames: LibraryName[] = ['pdfjs', 'mammoth', 'docx', 'dnd'];
    libraryNames.forEach(name => {
      this.libraries.set(name, {
        loaded: false,
        loading: null,
        module: null
      });
    });
  }

  /**
   * Load PDF.js library dynamically
   */
  async loadPDFJS() {
    return this.loadLibrary('pdfjs', async () => {
      if (typeof window === 'undefined') {
        throw new Error('PDF.js is only available in browser environment');
      }

      const pdfjs = await import('pdfjs-dist');
      
      // Configure worker only on client side
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      }

      console.log('✅ PDF.js loaded successfully');
      return pdfjs;
    });
  }

  /**
   * Load Mammoth.js library dynamically
   */
  async loadMammoth() {
    return this.loadLibrary('mammoth', async () => {
      const mammoth = await import('mammoth');
      console.log('✅ Mammoth.js loaded successfully');
      return mammoth;
    });
  }

  /**
   * Load DOCX library dynamically
   */
  async loadDOCX() {
    return this.loadLibrary('docx', async () => {
      const docx = await import('docx');
      console.log('✅ DOCX library loaded successfully');
      return docx;
    });
  }

  /**
   * Load Drag and Drop library dynamically
   */
  async loadDND() {
    return this.loadLibrary('dnd', async () => {
      const dnd = await import('@hello-pangea/dnd');
      console.log('✅ DnD library loaded successfully');
      return dnd;
    });
  }

  /**
   * Generic library loader with caching
   */
  private async loadLibrary(name: LibraryName, loader: () => Promise<unknown>) {
    const lib = this.libraries.get(name);
    if (!lib) {
      throw new Error(`Unknown library: ${name}`);
    }

    // Return cached module if already loaded
    if (lib.loaded && lib.module) {
      return lib.module;
    }

    // Return existing loading promise if in progress
    if (lib.loading) {
      return lib.loading;
    }

    // Start loading
    lib.loading = this.executeLoad(name, loader);
    
    try {
      const loadedModule = await lib.loading;
      lib.module = loadedModule;
      lib.loaded = true;
      lib.loading = null;
      return loadedModule;
    } catch (error) {
      lib.loading = null;
      console.error(`Failed to load ${name}:`, error);
      throw error;
    }
  }

  /**
   * Execute the actual loading with performance monitoring
   */
  private async executeLoad(name: LibraryName, loader: () => Promise<unknown>) {
    const startTime = performance.now();
    
    try {
      const loadedModule = await loader();
      const loadTime = performance.now() - startTime;
      console.log(`📊 ${name} loaded in ${loadTime.toFixed(2)}ms`);
      return loadedModule;
    } catch (error) {
      const loadTime = performance.now() - startTime;
      console.error(`❌ ${name} failed to load after ${loadTime.toFixed(2)}ms:`, error);
      throw error;
    }
  }

  /**
   * Preload critical libraries based on user actions
   */
  async preloadForFileUpload() {
    // Don't preload until user shows intent
    console.log('🚀 Preloading libraries for file upload...');
    
    // Preload parsing libraries since they're likely to be needed
    try {
      await Promise.all([
        this.loadPDFJS(),
        this.loadMammoth()
      ]);
      console.log('✅ Core parsing libraries preloaded');
    } catch (error) {
      console.warn('⚠️ Some libraries failed to preload:', error);
    }
  }

  /**
   * Preload DOCX generation when processing completes
   */
  async preloadForDocGeneration() {
    console.log('🚀 Preloading DOCX generation...');
    try {
      await this.loadDOCX();
      console.log('✅ DOCX generation ready');
    } catch (error) {
      console.warn('⚠️ DOCX preload failed:', error);
    }
  }

  /**
   * Preload editor libraries when entering edit mode
   */
  async preloadForEditor() {
    console.log('🚀 Preloading editor libraries...');
    try {
      await this.loadDND();
      console.log('✅ Editor libraries ready');
    } catch (error) {
      console.warn('⚠️ Editor preload failed:', error);
    }
  }

  /**
   * Get loading status for UI indicators
   */
  getLoadingStatus(): Record<LibraryName, boolean> {
    const status = {} as Record<LibraryName, boolean>;
    
    this.libraries.forEach((lib, name) => {
      status[name] = lib.loading !== null;
    });
    
    return status;
  }

  /**
   * Get loaded status for UI indicators
   */
  getLoadedStatus(): Record<LibraryName, boolean> {
    const status = {} as Record<LibraryName, boolean>;
    
    this.libraries.forEach((lib, name) => {
      status[name] = lib.loaded;
    });
    
    return status;
  }

  /**
   * Force cleanup of all libraries (for privacy)
   */
  cleanup() {
    console.log('🧹 Cleaning up library cache...');
    this.libraries.forEach((lib) => {
      lib.loaded = false;
      lib.loading = null;
      lib.module = null;
    });
  }
}

// Singleton instance
export const lazyLoader = new LazyLibraryLoader();

// Preload utilities
export const preloadLibraries = {
  forFileUpload: () => lazyLoader.preloadForFileUpload(),
  forDocGeneration: () => lazyLoader.preloadForDocGeneration(),
  forEditor: () => lazyLoader.preloadForEditor()
};

// Library loaders
export const loadLibrary = {
  pdfjs: () => lazyLoader.loadPDFJS(),
  mammoth: () => lazyLoader.loadMammoth(),
  docx: () => lazyLoader.loadDOCX(),
  dnd: () => lazyLoader.loadDND()
};

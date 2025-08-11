// Document processing service that orchestrates parsing and ATS optimization
import { parseDocumentEnhanced } from './parsers/document-parser';
import { optimizeForATS, generateOptimizationSummary } from './ats-optimizer';
import { generateDOCX, isDOCXGenerationSupported } from './docx-generator';
import type { UploadedFile } from '@/types/file-upload';
import type { ParsedDocument } from './parsers/pdf-parser';
import type { ATSOptimizedDocument } from './ats-optimizer';

export interface ProcessingResult {
  originalDocument: ParsedDocument & { htmlContent?: string };
  optimizedDocument: ATSOptimizedDocument;
  summary: string;
  downloadOptions: DownloadOption[];
  processingTime: number;
}

export interface DownloadOption {
  format: 'txt' | 'docx';
  label: string;
  description: string;
  content: string | Uint8Array;
  filename: string;
  size: number;
  mimeType: string;
}

export interface ProcessingProgress {
  stage: 'parsing' | 'optimizing' | 'generating' | 'complete';
  progress: number;
  message: string;
}

/**
 * Main document processing function that handles complete workflow
 * @param uploadedFile - File to process
 * @param onProgress - Optional progress callback
 * @returns Promise resolving to complete processing result
 */
export async function processDocument(
  uploadedFile: UploadedFile,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<ProcessingResult> {
  // Ensure we're running in browser environment
  if (typeof window === 'undefined') {
    throw new Error('Document processing is only available in browser environment');
  }
  
  const startTime = Date.now();
  
  try {
    // Stage 1: Parse document
    onProgress?.({
      stage: 'parsing',
      progress: 10,
      message: 'Extracting text from document...'
    });
    
    const originalDocument = await parseDocumentEnhanced(uploadedFile);
    
    onProgress?.({
      stage: 'parsing',
      progress: 30,
      message: 'Document parsed successfully'
    });
    
    // Stage 2: Optimize for ATS
    onProgress?.({
      stage: 'optimizing',
      progress: 50,
      message: 'Applying ATS optimizations...'
    });
    
    const optimizedDocument = optimizeForATS(originalDocument);
    
    onProgress?.({
      stage: 'optimizing',
      progress: 70,
      message: 'ATS optimization complete'
    });
    
    // Stage 3: Generate download options
    onProgress?.({
      stage: 'generating',
      progress: 85,
      message: 'Preparing download formats...'
    });
    
    const downloadOptions = await generateDownloadOptions(optimizedDocument, uploadedFile.metadata.name);
    const summary = generateOptimizationSummary(optimizedDocument);
    
    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Processing complete!'
    });
    
    const processingTime = Date.now() - startTime;
    
    return {
      originalDocument,
      optimizedDocument,
      summary,
      downloadOptions,
      processingTime
    };
    
  } catch (error) {
    throw new Error(`Document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates download options for the optimized document
 * @param optimizedDocument - ATS optimized document
 * @param originalFilename - Original filename for naming
 * @returns Promise resolving to array of download options
 */
async function generateDownloadOptions(
  optimizedDocument: ATSOptimizedDocument,
  originalFilename: string
): Promise<DownloadOption[]> {
  const baseName = originalFilename.replace(/\.[^/.]+$/, ''); // Remove extension
  const content = optimizedDocument.content;
  
  const options: DownloadOption[] = [];
  
  // TXT format (always available)
  const txtContent = content;
  options.push({
    format: 'txt',
    label: 'Plain Text (.txt)',
    description: 'Universal format compatible with all ATS systems',
    content: txtContent,
    filename: `${baseName}_ATS_optimized.txt`,
    size: new Blob([txtContent]).size,
    mimeType: 'text/plain'
  });
  
  // DOCX format - generate real Microsoft Word document
  if (isDOCXGenerationSupported()) {
    try {
      const { buffer, filename } = await generateDOCX(optimizedDocument, originalFilename);
      options.push({
        format: 'docx',
        label: 'Microsoft Word (.docx)',
        description: 'Professional DOCX file ready for any application',
        content: buffer,
        filename,
        size: buffer.length,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
    } catch (error) {
      console.warn('DOCX generation failed, providing fallback text format:', error);
      // Fallback to formatted text
      const formattedContent = formatForWord(content, optimizedDocument.sections);
      options.push({
        format: 'docx',
        label: 'Word-ready Text (.txt)',
        description: 'Formatted text ready to copy into Microsoft Word',
        content: formattedContent,
        filename: `${baseName}_Word_ready.txt`,
        size: new Blob([formattedContent]).size,
        mimeType: 'text/plain'
      });
    }
  } else {
    // Fallback for unsupported environments
    const formattedContent = formatForWord(content, optimizedDocument.sections);
    options.push({
      format: 'docx',
      label: 'Word-ready Text (.txt)',
      description: 'Formatted text ready to copy into Microsoft Word',
      content: formattedContent,
      filename: `${baseName}_Word_ready.txt`,
      size: new Blob([formattedContent]).size,
      mimeType: 'text/plain'
    });
  }
  
  return options;
}

/**
 * Formats content for easy copying into Microsoft Word
 * @param content - Optimized content
 * @param sections - Detected sections
 * @returns Formatted content
 */
function formatForWord(content: string, sections: { standardTitle: string }[]): string {
  let formatted = content;
  
  // Add formatting instructions at the top
  const instructions = `=== WORD FORMATTING INSTRUCTIONS ===
1. Copy and paste this content into Microsoft Word
2. Select section headings and make them bold
3. Use Arial or Calibri font, size 11-12
4. Set margins to 0.5-1 inch on all sides
5. Save as .docx format

=== YOUR ATS-OPTIMIZED RESUME ===

`;
  
  formatted = instructions + formatted;
  
  // Add extra spacing around section headings for easier formatting
  sections.forEach(section => {
    const headingPattern = new RegExp(`^${section.standardTitle}$`, 'gm');
    formatted = formatted.replace(headingPattern, `\n${section.standardTitle}\n`);
  });
  
  return formatted;
}

/**
 * Validates processing result for quality assurance
 * @param result - Processing result to validate
 * @returns Array of validation issues (empty if valid)
 */
export function validateProcessingResult(result: ProcessingResult): string[] {
  const issues: string[] = [];
  
  // Check content length
  if (result.optimizedDocument.content.length < 100) {
    issues.push('Optimized content is very short');
  }
  
  // Check for essential sections
  const sectionTitles = result.optimizedDocument.sections.map(s => s.standardTitle);
  if (!sectionTitles.includes('Work Experience') && !sectionTitles.includes('Professional Summary')) {
    issues.push('Missing essential resume sections');
  }
  
  // Check download options
  if (result.downloadOptions.length === 0) {
    issues.push('No download options generated');
  }
  
  // Check processing time (should be under 10 seconds for good UX)
  if (result.processingTime > 10000) {
    issues.push('Processing took too long (over 10 seconds)');
  }
  
  return issues;
}

/**
 * Creates a processing preview without full optimization (for quick feedback)
 * @param uploadedFile - File to preview
 * @returns Basic document information
 */
export async function previewDocument(uploadedFile: UploadedFile): Promise<{
  wordCount: number;
  estimatedSections: number;
  fileType: string;
  estimatedProcessingTime: number;
}> {
  // Ensure we're running in browser environment
  if (typeof window === 'undefined') {
    throw new Error('Document preview is only available in browser environment');
  }
  
  try {
    const parsed = await parseDocumentEnhanced(uploadedFile);
    
    // Simple section detection for preview
    const sectionCount = (parsed.text.match(/^[A-Z][A-Z\s]{2,20}$/gm) || []).length;
    
    // Estimate processing time based on word count (rough: 1000 words = 1 second)
    const estimatedTime = Math.max(1000, Math.min(5000, parsed.metadata.wordCount));
    
    return {
      wordCount: parsed.metadata.wordCount,
      estimatedSections: Math.max(3, sectionCount),
      fileType: parsed.source.toUpperCase(),
      estimatedProcessingTime: estimatedTime
    };
  } catch (error) {
    throw new Error(`Preview failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Utility function to format file size for display
 * @param bytes - Size in bytes
 * @returns Human-readable size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

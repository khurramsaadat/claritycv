// DOCX parsing engine using mammoth.js library for client-side processing
import { createUploadError, UPLOAD_ERROR_CODES } from '@/lib/file-validation';
import { loadLibrary } from '@/lib/performance/lazy-loader';
import { memoryManager } from '@/lib/performance/memory-manager';
import type { UploadedFile } from '@/types/file-upload';
import type { ParsedDocument } from './pdf-parser';

/**
 * Parses DOCX file and extracts text content for ATS optimization
 * @param uploadedFile - File with ArrayBuffer ready for parsing
 * @returns Promise resolving to ParsedDocument
 */
export async function parseDOCX(uploadedFile: UploadedFile): Promise<ParsedDocument> {
  try {
    if (!uploadedFile.buffer) {
      throw createUploadError(
        UPLOAD_ERROR_CODES.FILE_READ_ERROR,
        'File buffer is missing. Please try uploading the file again.',
        uploadedFile.metadata.name
      );
    }

    // Load mammoth.js library dynamically
    const mammoth = await loadLibrary.mammoth() as typeof import('mammoth');
    
    // Parse DOCX using mammoth.js with text extraction
    const result = await mammoth.extractRawText({ arrayBuffer: uploadedFile.buffer });

    if (!result.value || result.value.trim().length === 0) {
      throw createUploadError(
        UPLOAD_ERROR_CODES.FILE_CORRUPTED,
        'No text content found in DOCX file. The file may be empty or corrupted.',
        uploadedFile.metadata.name
      );
    }

    // Log warnings if any (for debugging in development)
    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX parsing warnings:', result.messages);
    }

    // Clean and normalize the extracted text
    const cleanedText = cleanDOCXText(result.value);
    
    // Calculate word count
    const wordCount = countWords(cleanedText);

    // Create parsed document object
    const parsedDocument: ParsedDocument = {
      text: cleanedText,
      metadata: {
        // DOCX files don't provide metadata through mammoth.js raw text extraction
        pages: estimatePageCount(cleanedText),
        wordCount
      },
      source: 'docx',
      originalFileName: uploadedFile.metadata.name
    };

    return parsedDocument;

  } catch (error) {
    // Handle our custom UploadError
    if (error && typeof error === 'object' && 'code' in error) {
      throw error;
    }

    // Handle mammoth.js specific errors
    if (error instanceof Error) {
      if (error.message.includes('not a valid zip file') || 
          error.message.includes('invalid signature')) {
        throw createUploadError(
          UPLOAD_ERROR_CODES.FILE_CORRUPTED,
          'Invalid DOCX file. Please ensure the file is not corrupted and try again.',
          uploadedFile.metadata.name
        );
      }
      
      if (error.message.includes('password') || error.message.includes('encrypted')) {
        throw createUploadError(
          UPLOAD_ERROR_CODES.PROCESSING_ERROR,
          'Password-protected DOCX files are not supported. Please upload an unprotected version.',
          uploadedFile.metadata.name
        );
      }
    }

    // Generic error fallback
    throw createUploadError(
      UPLOAD_ERROR_CODES.PROCESSING_ERROR,
      `Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`,
      uploadedFile.metadata.name
    );
  }
}

/**
 * Enhanced DOCX parsing with HTML structure preservation for better ATS optimization
 * @param uploadedFile - File with ArrayBuffer ready for parsing
 * @returns Promise resolving to ParsedDocument with enhanced structure
 */
export async function parseEnhancedDOCX(uploadedFile: UploadedFile): Promise<ParsedDocument & { htmlContent?: string }> {
  try {
    if (!uploadedFile.buffer) {
      throw createUploadError(
        UPLOAD_ERROR_CODES.FILE_READ_ERROR,
        'File buffer is missing. Please try uploading the file again.',
        uploadedFile.metadata.name
      );
    }

              // Load mammoth.js library dynamically
          const mammoth = await loadLibrary.mammoth() as typeof import('mammoth');
          
          // Store file in memory manager for potential reuse
          memoryManager.storeFileData(`docx-${uploadedFile.metadata.name}`, uploadedFile.buffer, 'docx');

          // Extract both raw text and HTML for better structure understanding
          const [textResult, htmlResult] = await Promise.all([
            mammoth.extractRawText({ arrayBuffer: uploadedFile.buffer }),
            mammoth.convertToHtml({ arrayBuffer: uploadedFile.buffer })
          ]);

    if (!textResult.value || textResult.value.trim().length === 0) {
      throw createUploadError(
        UPLOAD_ERROR_CODES.FILE_CORRUPTED,
        'No text content found in DOCX file. The file may be empty or corrupted.',
        uploadedFile.metadata.name
      );
    }

    const cleanedText = cleanDOCXText(textResult.value);
    const wordCount = countWords(cleanedText);

    return {
      text: cleanedText,
      htmlContent: htmlResult.value,
      metadata: {
        pages: estimatePageCount(cleanedText),
        wordCount
      },
      source: 'docx',
      originalFileName: uploadedFile.metadata.name
    };

  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      throw error;
    }

    throw createUploadError(
      UPLOAD_ERROR_CODES.PROCESSING_ERROR,
      `Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`,
      uploadedFile.metadata.name
    );
  }
}

/**
 * Cleans and normalizes DOCX text content for ATS optimization
 * @param rawText - Raw text extracted from DOCX
 * @returns Cleaned text suitable for ATS processing
 */
function cleanDOCXText(rawText: string): string {
  let cleaned = rawText;

  // Normalize line breaks and whitespace
  cleaned = cleaned.replace(/\r\n/g, '\n');
  cleaned = cleaned.replace(/\r/g, '\n');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // Limit consecutive line breaks
  cleaned = cleaned.replace(/[ \t]{2,}/g, ' '); // Replace multiple spaces with single space
  
  // Remove DOCX-specific artifacts
  cleaned = cleaned.replace(/\f/g, '\n'); // Replace form feeds
  cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control characters
  
  // Fix spacing issues common in DOCX extraction
  cleaned = cleaned.replace(/([a-z])([A-Z])/g, '$1 $2'); // Add space between cases
  cleaned = cleaned.replace(/(\d)([A-Za-z])/g, '$1 $2'); // Add space between numbers and letters
  cleaned = cleaned.replace(/([A-Za-z])(\d)/g, '$1 $2'); // Add space between letters and numbers
  
  // Standardize bullet points
  cleaned = cleaned.replace(/[•·▪▫■□‣⁃]/g, '•');
  cleaned = cleaned.replace(/^\s*[○◦‣⁃]\s*/gm, '• ');
  
  // Remove common Word artifacts
  cleaned = cleaned.replace(/^\s*_+\s*$/gm, ''); // Remove underline-only lines
  cleaned = cleaned.replace(/^\s*-+\s*$/gm, ''); // Remove dash-only lines
  
  // Clean up spacing and empty lines
  cleaned = cleaned
    .split('\n')
    .map(line => line.trim())
    .filter((line, index, arr) => {
      // Keep non-empty lines and don't remove more than one consecutive empty line
      return line.length > 0 || (index > 0 && arr[index - 1].length > 0);
    })
    .join('\n')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '');

  return cleaned;
}

/**
 * Estimates page count based on text content (roughly 250 words per page)
 * @param text - Text content to analyze
 * @returns Estimated number of pages
 */
function estimatePageCount(text: string): number {
  const wordCount = countWords(text);
  const WORDS_PER_PAGE = 250; // Conservative estimate for resume content
  
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_PAGE));
}

/**
 * Counts words in text content
 * @param text - Text to count words in
 * @returns Number of words
 */
function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  
  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;
}

/**
 * Validates if DOCX contains sufficient text content for processing
 * @param parsedDocument - Parsed document to validate
 * @returns Boolean indicating if document has sufficient content
 */
export function validateDOCXContent(parsedDocument: ParsedDocument): boolean {
  const MIN_WORD_COUNT = 50;
  return parsedDocument.metadata.wordCount >= MIN_WORD_COUNT;
}

/**
 * Extracts section headings from DOCX HTML content
 * @param htmlContent - HTML content from mammoth.js
 * @returns Array of detected section headings
 */
export function extractSectionHeadings(htmlContent: string): string[] {
  if (!htmlContent) return [];

  const headings: string[] = [];
  
  // Extract text from heading tags
  const headingRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi;
  let match;
  
  while ((match = headingRegex.exec(htmlContent)) !== null) {
    const heading = match[1].replace(/<[^>]*>/g, '').trim();
    if (heading.length > 0) {
      headings.push(heading);
    }
  }
  
  // Also look for bold text that might be section headers
  const boldRegex = /<(strong|b)>(.*?)<\/(strong|b)>/gi;
  while ((match = boldRegex.exec(htmlContent)) !== null) {
    const boldText = match[2].replace(/<[^>]*>/g, '').trim();
    
    // Only consider as heading if it's short (likely a section title)
    if (boldText.length > 0 && boldText.length < 50 && !headings.includes(boldText)) {
      headings.push(boldText);
    }
  }
  
  return headings;
}

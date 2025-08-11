// PDF parsing engine using pdfjs-dist library for client-side processing
import { createUploadError, UPLOAD_ERROR_CODES } from '@/lib/file-validation';
import type { UploadedFile } from '@/types/file-upload';

// Dynamic import for pdfjs-dist to avoid SSR issues
async function loadPDFJS() {
  if (typeof window === 'undefined') {
    throw new Error('PDF parsing is only available in browser environment');
  }
  
  const pdfjs = await import('pdfjs-dist');
  
  // Configure PDF.js worker only on client side
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  }
  
  return pdfjs;
}

export interface ParsedDocument {
  text: string;
  metadata: {
    title?: string;
    author?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
    pages: number;
    wordCount: number;
  };
  source: 'pdf' | 'docx';
  originalFileName: string;
}

/**
 * Parses PDF file and extracts text content for ATS optimization
 * @param uploadedFile - File with ArrayBuffer ready for parsing
 * @returns Promise resolving to ParsedDocument
 */
export async function parsePDF(uploadedFile: UploadedFile): Promise<ParsedDocument> {
  try {
    if (!uploadedFile.buffer) {
      throw createUploadError(
        UPLOAD_ERROR_CODES.FILE_READ_ERROR,
        'File buffer is missing. Please try uploading the file again.',
        uploadedFile.metadata.name
      );
    }

    // Load PDF.js dynamically (client-side only)
    const pdfjs = await loadPDFJS();
    
    // Load PDF document using pdfjs-dist
    const pdf = await pdfjs.getDocument({ data: uploadedFile.buffer }).promise;
    
    let allText = '';
    const pageTexts: string[] = [];

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: unknown) => 
          typeof item === 'object' && item !== null && 'str' in item 
            ? String((item as { str: string }).str) 
            : ''
        )
        .filter((text: string) => text.length > 0)
        .join(' ');
      
      pageTexts.push(pageText);
      allText += pageText + '\n';
    }

    if (!allText || allText.trim().length === 0) {
      throw createUploadError(
        UPLOAD_ERROR_CODES.FILE_CORRUPTED,
        'No text content found in PDF. The file may be image-based or corrupted.',
        uploadedFile.metadata.name
      );
    }

    // Extract metadata
    const metadataResult = await pdf.getMetadata().catch(() => ({ info: {}, metadata: null }));
    const info = metadataResult.info as Record<string, unknown> || {};

    // Extract and clean text content
    const cleanedText = cleanPDFText(allText);
    
    // Calculate word count
    const wordCount = countWords(cleanedText);

    // Create parsed document object
    const parsedDocument: ParsedDocument = {
      text: cleanedText,
      metadata: {
        title: typeof info.Title === 'string' ? info.Title : undefined,
        author: typeof info.Author === 'string' ? info.Author : undefined,
        creator: typeof info.Creator === 'string' ? info.Creator : undefined,
        producer: typeof info.Producer === 'string' ? info.Producer : undefined,
        creationDate: typeof info.CreationDate === 'string' ? new Date(info.CreationDate) : undefined,
        modificationDate: typeof info.ModDate === 'string' ? new Date(info.ModDate) : undefined,
        pages: pdf.numPages,
        wordCount
      },
      source: 'pdf',
      originalFileName: uploadedFile.metadata.name
    };

    return parsedDocument;

  } catch (error) {
    // Handle our custom UploadError
    if (error && typeof error === 'object' && 'code' in error) {
      throw error;
    }

    // Handle pdfjs-dist specific errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF') || error.message.includes('Invalid or corrupted PDF')) {
        throw createUploadError(
          UPLOAD_ERROR_CODES.FILE_CORRUPTED,
          'Invalid PDF file. Please ensure the file is not corrupted and try again.',
          uploadedFile.metadata.name
        );
      }
      
      if (error.message.includes('password') || error.message.includes('encrypted')) {
        throw createUploadError(
          UPLOAD_ERROR_CODES.PROCESSING_ERROR,
          'Password-protected PDFs are not supported. Please upload an unprotected version.',
          uploadedFile.metadata.name
        );
      }
    }

    // Generic error fallback
    throw createUploadError(
      UPLOAD_ERROR_CODES.PROCESSING_ERROR,
      `Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
      uploadedFile.metadata.name
    );
  }
}

/**
 * Cleans and normalizes PDF text content for ATS optimization
 * @param rawText - Raw text extracted from PDF
 * @returns Cleaned text suitable for ATS processing
 */
function cleanPDFText(rawText: string): string {
  let cleaned = rawText;

  // Remove excessive whitespace and normalize line breaks
  cleaned = cleaned.replace(/\r\n/g, '\n'); // Normalize line endings
  cleaned = cleaned.replace(/\r/g, '\n'); // Handle old Mac line endings
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // Limit consecutive line breaks to max 2
  cleaned = cleaned.replace(/[ \t]{2,}/g, ' '); // Replace multiple spaces/tabs with single space
  
  // Remove common PDF artifacts
  cleaned = cleaned.replace(/\f/g, '\n'); // Replace form feeds with line breaks
  cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control characters except \n and \t
  
  // Fix common OCR/PDF extraction issues
  cleaned = cleaned.replace(/([a-z])([A-Z])/g, '$1 $2'); // Add space between lowercase and uppercase letters
  cleaned = cleaned.replace(/(\d)([A-Za-z])/g, '$1 $2'); // Add space between numbers and letters
  cleaned = cleaned.replace(/([A-Za-z])(\d)/g, '$1 $2'); // Add space between letters and numbers
  
  // Clean up bullet points and list markers
  cleaned = cleaned.replace(/[•·▪▫■□‣⁃]/g, '•'); // Standardize bullet points
  cleaned = cleaned.replace(/^\s*[○◦‣⁃]\s*/gm, '• '); // Convert various bullet styles to standard
  
  // Remove page numbers and headers/footers patterns
  cleaned = cleaned.replace(/^\s*Page\s+\d+\s*$/gim, ''); // Remove "Page X" lines
  cleaned = cleaned.replace(/^\s*\d+\s*$/gm, ''); // Remove standalone numbers (likely page numbers)
  
  // Trim each line and remove empty lines at start/end
  cleaned = cleaned
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/^\n+/, '') // Remove leading newlines
    .replace(/\n+$/, ''); // Remove trailing newlines

  return cleaned;
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
 * Validates if PDF contains sufficient text content for processing
 * @param parsedDocument - Parsed document to validate
 * @returns Boolean indicating if document has sufficient content
 */
export function validatePDFContent(parsedDocument: ParsedDocument): boolean {
  // Must have at least 50 words to be considered a valid resume
  const MIN_WORD_COUNT = 50;
  
  return parsedDocument.metadata.wordCount >= MIN_WORD_COUNT;
}

/**
 * Extracts contact information patterns from PDF text
 * @param text - Text content to search
 * @returns Object with potential contact information
 */
export function extractContactInfo(text: string): {
  emails: string[];
  phones: string[];
  urls: string[];
} {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g;
  const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+/g;

  return {
    emails: text.match(emailRegex) || [],
    phones: text.match(phoneRegex) || [],
    urls: text.match(urlRegex) || []
  };
}

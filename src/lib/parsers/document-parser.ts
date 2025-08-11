// Universal document parser that routes to appropriate parsing engine
import { validateFile } from '@/lib/file-validation';
import { parsePDF, validatePDFContent } from './pdf-parser';
import { parseDOCX, validateDOCXContent, parseEnhancedDOCX } from './docx-parser';
import type { UploadedFile } from '@/types/file-upload';
import type { ParsedDocument } from './pdf-parser';

export type { ParsedDocument };

/**
 * Main parsing function that routes to appropriate parser based on file type
 * @param uploadedFile - File to parse
 * @returns Promise resolving to ParsedDocument
 */
export async function parseDocument(uploadedFile: UploadedFile): Promise<ParsedDocument> {
  // Validate file first
  const fileType = validateFile(uploadedFile.file);
  
  let parsedDocument: ParsedDocument;
  
  // Route to appropriate parser
  switch (fileType) {
    case 'pdf':
      parsedDocument = await parsePDF(uploadedFile);
      
      if (!validatePDFContent(parsedDocument)) {
        throw new Error(`PDF contains insufficient content (${parsedDocument.metadata.wordCount} words). Please ensure your resume has at least 50 words.`);
      }
      break;
      
    case 'docx':
      parsedDocument = await parseDOCX(uploadedFile);
      
      if (!validateDOCXContent(parsedDocument)) {
        throw new Error(`DOCX contains insufficient content (${parsedDocument.metadata.wordCount} words). Please ensure your resume has at least 50 words.`);
      }
      break;
      
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
  
  return parsedDocument;
}

/**
 * Enhanced parsing with additional structure extraction for DOCX files
 * @param uploadedFile - File to parse
 * @returns Promise resolving to ParsedDocument with optional HTML content
 */
export async function parseDocumentEnhanced(uploadedFile: UploadedFile): Promise<ParsedDocument & { htmlContent?: string }> {
  const fileType = validateFile(uploadedFile.file);
  
  switch (fileType) {
    case 'pdf':
      return await parsePDF(uploadedFile);
      
    case 'docx':
      const enhanced = await parseEnhancedDOCX(uploadedFile);
      
      if (!validateDOCXContent(enhanced)) {
        throw new Error(`DOCX contains insufficient content (${enhanced.metadata.wordCount} words). Please ensure your resume has at least 50 words.`);
      }
      
      return enhanced;
      
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

/**
 * Quick document analysis without full parsing (for preview/validation)
 * @param uploadedFile - File to analyze
 * @returns Basic document information
 */
export async function analyzeDocument(uploadedFile: UploadedFile): Promise<{
  fileType: 'pdf' | 'docx';
  estimatedWords: number;
  canProcess: boolean;
  issues: string[];
}> {
  const fileType = validateFile(uploadedFile.file);
  const issues: string[] = [];
  
  try {
    const doc = await parseDocument(uploadedFile);
    
    return {
      fileType,
      estimatedWords: doc.metadata.wordCount,
      canProcess: true,
      issues
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    issues.push(errorMessage);
    
    return {
      fileType,
      estimatedWords: 0,
      canProcess: false,
      issues
    };
  }
}

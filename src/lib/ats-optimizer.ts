// ATS Optimization Engine following PRD Core Principles for High-Quality ATS Conversion
import type { ParsedDocument } from './parsers/pdf-parser';

export interface ATSOptimizedDocument {
  content: string;
  sections: DetectedSection[];
  optimizations: OptimizationResult[];
  statistics: {
    originalWordCount: number;
    optimizedWordCount: number;
    sectionsStandardized: number;
    issuesFixed: number;
  };
  warnings: string[];
}

export interface DetectedSection {
  title: string;
  standardTitle: string;
  content: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
}

export interface OptimizationResult {
  type: 'heading_standardized' | 'formatting_cleaned' | 'structure_improved' | 'content_enhanced';
  description: string;
  beforeSample?: string;
  afterSample?: string;
}

// Standard ATS-friendly section headings per PRD requirements
const STANDARD_SECTIONS = {
  'PERSONAL_INFO': 'Contact Information',
  'PROFESSIONAL_SUMMARY': 'Professional Summary',
  'WORK_EXPERIENCE': 'Work Experience',
  'EDUCATION': 'Education',
  'SKILLS': 'Skills',
  'CERTIFICATIONS': 'Certifications',
  'PROJECTS': 'Projects',
  'VOLUNTEER': 'Volunteer Experience',
  'AWARDS': 'Awards and Honors',
  'PUBLICATIONS': 'Publications',
  'LANGUAGES': 'Languages',
  'INTERESTS': 'Additional Information'
} as const;

// Section detection patterns - maps various headings to standard sections
const SECTION_PATTERNS = {
  // Personal/Contact Information variations
  'PERSONAL_INFO': [
    /^(contact\s+information|personal\s+information|contact|contact\s+details|personal\s+details)$/i
  ],
  
  // Professional Summary variations
  'PROFESSIONAL_SUMMARY': [
    /^(professional\s+summary|summary|profile|objective|career\s+objective|personal\s+statement|about\s+me|overview)$/i
  ],
  
  // Work Experience variations
  'WORK_EXPERIENCE': [
    /^(work\s+experience|professional\s+experience|employment|career\s+history|experience|work\s+history|professional\s+background|my\s+professional\s+journey)$/i
  ],
  
  // Education variations
  'EDUCATION': [
    /^(education|academic\s+background|qualifications|academic\s+qualifications|educational\s+background)$/i
  ],
  
  // Skills variations
  'SKILLS': [
    /^(skills|technical\s+skills|core\s+competencies|competencies|expertise|abilities|proficiencies|key\s+skills)$/i
  ],
  
  // Certifications variations
  'CERTIFICATIONS': [
    /^(certifications|certificates|professional\s+certifications|licenses|credentials)$/i
  ],
  
  // Projects variations
  'PROJECTS': [
    /^(projects|key\s+projects|notable\s+projects|project\s+experience|portfolio)$/i
  ],
  
  // Volunteer variations
  'VOLUNTEER': [
    /^(volunteer|volunteer\s+experience|community\s+service|volunteer\s+work|community\s+involvement)$/i
  ],
  
  // Awards variations
  'AWARDS': [
    /^(awards|honors|achievements|recognition|accomplishments|awards\s+and\s+honors)$/i
  ],
  
  // Publications variations
  'PUBLICATIONS': [
    /^(publications|research|papers|articles|published\s+work)$/i
  ],
  
  // Languages variations
  'LANGUAGES': [
    /^(languages|language\s+skills|linguistic\s+abilities)$/i
  ],
  
  // Additional Information variations
  'INTERESTS': [
    /^(interests|hobbies|additional\s+information|personal\s+interests|other|miscellaneous)$/i
  ]
};

/**
 * Main ATS optimization function following PRD Core Principles
 * @param parsedDocument - Document parsed from PDF or DOCX
 * @returns Optimized document ready for ATS systems
 */
export function optimizeForATS(parsedDocument: ParsedDocument): ATSOptimizedDocument {
  const optimizations: OptimizationResult[] = [];
  const warnings: string[] = [];
  
  // Step 1: Detect and standardize sections (PRD Principle 7.2.1)
  const sections = detectSections(parsedDocument.text);
  
  // Step 2: Apply structural optimizations (PRD Principle 7.1)
  let optimizedContent = applyStructuralOptimizations(parsedDocument.text, optimizations);
  
  // Step 3: Standardize section headings
  optimizedContent = standardizeSectionHeadings(optimizedContent, sections, optimizations);
  
  // Step 4: Clean formatting and remove ATS-unfriendly elements
  optimizedContent = cleanFormatting(optimizedContent, optimizations);
  
  // Step 5: Ensure single-column layout
  optimizedContent = ensureSingleColumnLayout(optimizedContent, optimizations);
  
  // Step 6: Validate and add warnings
  const validationWarnings = validateATSCompliance(optimizedContent, sections);
  warnings.push(...validationWarnings);
  
  // Calculate statistics
  const statistics = {
    originalWordCount: parsedDocument.metadata.wordCount,
    optimizedWordCount: countWords(optimizedContent),
    sectionsStandardized: optimizations.filter(o => o.type === 'heading_standardized').length,
    issuesFixed: optimizations.length
  };
  
  return {
    content: optimizedContent,
    sections,
    optimizations,
    statistics,
    warnings
  };
}

/**
 * Detects sections in the document text
 * @param text - Document text
 * @returns Array of detected sections
 */
function detectSections(text: string): DetectedSection[] {
  const sections: DetectedSection[] = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if line looks like a heading (short, often in caps, no periods)
    if (isLikelyHeading(line)) {
      const matchedSection = matchSectionPattern(line);
      
      if (matchedSection) {
        // Find the content for this section (until next heading or end)
        const contentLines: string[] = [];
        let j = i + 1;
        
        while (j < lines.length && !isLikelyHeading(lines[j].trim())) {
          contentLines.push(lines[j]);
          j++;
        }
        
        sections.push({
          title: line,
          standardTitle: STANDARD_SECTIONS[matchedSection],
          content: contentLines.join('\n').trim(),
          startIndex: i,
          endIndex: j - 1,
          confidence: calculateConfidence(line, matchedSection)
        });
      }
    }
  }
  
  return sections;
}

/**
 * Determines if a line is likely a section heading
 * @param line - Text line to analyze
 * @returns Boolean indicating if line is likely a heading
 */
function isLikelyHeading(line: string): boolean {
  if (!line || line.length === 0) return false;
  
  // Headings are typically:
  // - Short (less than 50 characters)
  // - Don't end with periods
  // - Often in caps or title case
  // - Don't contain too many common words
  
  if (line.length > 50) return false;
  if (line.endsWith('.') || line.endsWith(',')) return false;
  
  // Check if it's all caps or title case
  const isAllCaps = line === line.toUpperCase() && line !== line.toLowerCase();
  const isTitleCase = line.split(' ').every(word => 
    word.length === 0 || word[0] === word[0].toUpperCase()
  );
  
  if (isAllCaps || isTitleCase) return true;
  
  // Check for common heading patterns
  const headingPatterns = [
    /^(professional|work|career|education|skills|experience|projects|certifications)/i,
    /^(summary|objective|profile|background|history|qualifications)/i,
    /^(awards|honors|achievements|publications|languages|interests)/i
  ];
  
  return headingPatterns.some(pattern => pattern.test(line));
}

/**
 * Matches a heading against known section patterns
 * @param heading - Heading text to match
 * @returns Matched section key or null
 */
function matchSectionPattern(heading: string): keyof typeof STANDARD_SECTIONS | null {
  const cleanHeading = heading.toLowerCase().trim();
  
  for (const [sectionKey, patterns] of Object.entries(SECTION_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(cleanHeading)) {
        return sectionKey as keyof typeof STANDARD_SECTIONS;
      }
    }
  }
  
  return null;
}

/**
 * Calculates confidence score for section detection
 * @param originalHeading - Original heading text
 * @param matchedSection - Matched section key
 * @returns Confidence score between 0 and 1
 */
function calculateConfidence(originalHeading: string, matchedSection: keyof typeof STANDARD_SECTIONS): number {
  const patterns = SECTION_PATTERNS[matchedSection];
  const cleanHeading = originalHeading.toLowerCase().trim();
  
  // Find the best matching pattern
  let maxConfidence = 0;
  
  for (const pattern of patterns) {
    if (pattern.test(cleanHeading)) {
      // Exact matches get higher confidence
      const standardTitle = STANDARD_SECTIONS[matchedSection].toLowerCase();
      if (cleanHeading === standardTitle) {
        maxConfidence = Math.max(maxConfidence, 1.0);
      } else {
        maxConfidence = Math.max(maxConfidence, 0.8);
      }
    }
  }
  
  return maxConfidence;
}

/**
 * Applies structural optimizations per PRD Principle 7.1
 * @param text - Original text
 * @param optimizations - Array to track optimizations
 * @returns Optimized text
 */
function applyStructuralOptimizations(text: string, optimizations: OptimizationResult[]): string {
  let optimized = text;
  
  // Remove excessive whitespace and normalize line breaks
  const originalLength = optimized.length;
  optimized = optimized.replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive line breaks
  optimized = optimized.replace(/[ \t]{2,}/g, ' '); // Single spaces only
  
  if (optimized.length !== originalLength) {
    optimizations.push({
      type: 'formatting_cleaned',
      description: 'Removed excessive whitespace and normalized line breaks'
    });
  }
  
  // Standardize bullet points (PRD Principle 7.1.6)
  const bulletPattern = /^[\s]*[•·▪▫■□‣⁃○◦]\s*/gm;
  if (bulletPattern.test(optimized)) {
    optimized = optimized.replace(bulletPattern, '• ');
    optimizations.push({
      type: 'formatting_cleaned',
      description: 'Standardized bullet points to simple round bullets'
    });
  }
  
  return optimized;
}

/**
 * Standardizes section headings per PRD Principle 7.2.1
 * @param text - Text content
 * @param sections - Detected sections
 * @param optimizations - Array to track optimizations
 * @returns Text with standardized headings
 */
function standardizeSectionHeadings(
  text: string, 
  sections: DetectedSection[], 
  optimizations: OptimizationResult[]
): string {
  let result = text;
  
  // Replace headings from last to first to maintain indices
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i];
    
    if (section.title !== section.standardTitle) {
      result = result.replace(section.title, section.standardTitle);
      
      optimizations.push({
        type: 'heading_standardized',
        description: `Standardized section heading for better ATS recognition`,
        beforeSample: section.title,
        afterSample: section.standardTitle
      });
    }
  }
  
  return result;
}

/**
 * Cleans formatting for ATS compatibility
 * @param text - Text to clean
 * @param optimizations - Array to track optimizations
 * @returns Cleaned text
 */
function cleanFormatting(text: string, optimizations: OptimizationResult[]): string {
  let cleaned = text;
  
  // Remove special characters that can confuse ATS
  const specialChars = /[""''‚„…–—]/g;
  if (specialChars.test(cleaned)) {
    cleaned = cleaned.replace(/[""]/g, '"');
    cleaned = cleaned.replace(/[''‚]/g, "'");
    cleaned = cleaned.replace(/[…]/g, '...');
    cleaned = cleaned.replace(/[–—]/g, '-');
    
    optimizations.push({
      type: 'formatting_cleaned',
      description: 'Replaced special characters with ATS-friendly alternatives'
    });
  }
  
  return cleaned;
}

/**
 * Ensures single-column layout per PRD Principle 7.1.1
 * @param text - Text to optimize
 * @param optimizations - Array to track optimizations
 * @returns Single-column formatted text
 */
function ensureSingleColumnLayout(text: string, optimizations: OptimizationResult[]): string {
  // This is primarily about ensuring linear text flow
  // Most of the work is done in the parsing phase
  
  let optimized = text;
  
  // Remove any remaining table-like structures
  const tablePattern = /\t+/g;
  if (tablePattern.test(optimized)) {
    optimized = optimized.replace(tablePattern, ' ');
    
    optimizations.push({
      type: 'structure_improved',
      description: 'Converted table structures to linear text for ATS compatibility'
    });
  }
  
  return optimized;
}

/**
 * Validates ATS compliance and returns warnings
 * @param text - Optimized text
 * @param sections - Detected sections
 * @returns Array of warnings
 */
function validateATSCompliance(text: string, sections: DetectedSection[]): string[] {
  const warnings: string[] = [];
  
  // Check for minimum content
  const wordCount = countWords(text);
  if (wordCount < 100) {
    warnings.push('Resume appears very short. Consider adding more detail to improve ATS scoring.');
  }
  
  // Check for essential sections
  const essentialSections = ['WORK_EXPERIENCE', 'EDUCATION'];
  const detectedSectionTypes = sections.map(s => 
    Object.entries(STANDARD_SECTIONS).find(entry => entry[1] === s.standardTitle)?.[0]
  ).filter(Boolean);
  
  for (const essential of essentialSections) {
    if (!detectedSectionTypes.includes(essential)) {
      warnings.push(`Missing essential section: ${STANDARD_SECTIONS[essential as keyof typeof STANDARD_SECTIONS]}`);
    }
  }
  
  // Check for contact information
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  if (!emailPattern.test(text)) {
    warnings.push('No email address detected. Ensure contact information is included.');
  }
  
  return warnings;
}

/**
 * Counts words in text
 * @param text - Text to count
 * @returns Word count
 */
function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Generates a summary of optimizations performed
 * @param result - ATS optimization result
 * @returns Human-readable summary
 */
export function generateOptimizationSummary(result: ATSOptimizedDocument): string {
  const { statistics, optimizations, warnings } = result;
  
  let summary = `ATS Optimization Complete!\n\n`;
  summary += `📊 Statistics:\n`;
  summary += `• Word count: ${statistics.originalWordCount} → ${statistics.optimizedWordCount}\n`;
  summary += `• Sections standardized: ${statistics.sectionsStandardized}\n`;
  summary += `• Issues fixed: ${statistics.issuesFixed}\n\n`;
  
  if (optimizations.length > 0) {
    summary += `✅ Optimizations Applied:\n`;
    optimizations.forEach(opt => {
      summary += `• ${opt.description}\n`;
    });
    summary += `\n`;
  }
  
  if (warnings.length > 0) {
    summary += `⚠️ Recommendations:\n`;
    warnings.forEach(warning => {
      summary += `• ${warning}\n`;
    });
  }
  
  return summary;
}

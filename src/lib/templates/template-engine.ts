// Template application engine for ATS-optimized resume formatting
import type { ResumeTemplate, TemplateFormatting } from '@/types/template';
import type { ATSOptimizedDocument, DetectedSection } from '@/lib/ats-optimizer';

export interface TemplatedDocument {
  content: string;
  template: ResumeTemplate;
  sections: TemplatedSection[];
  formatting: TemplateFormatting;
  metadata: {
    wordCount: number;
    sectionCount: number;
    appliedAt: Date;
  };
}

export interface TemplatedSection {
  id: string;
  title: string;
  content: string;
  order: number;
  formatted: boolean;
}

/**
 * Apply a template to an ATS-optimized document
 */
export function applyTemplate(
  document: ATSOptimizedDocument,
  template: ResumeTemplate
): TemplatedDocument {
  // Reorder sections according to template
  const orderedSections = reorderSections(document.sections, template.sectionOrder);
  
  // Apply template formatting to each section
  const templatedSections = orderedSections.map((section, index) => 
    formatSection(section, template, index)
  );
  
  // Generate final content with template formatting
  const formattedContent = generateFormattedContent(templatedSections, template);
  
  return {
    content: formattedContent,
    template,
    sections: templatedSections,
    formatting: template.formatting,
    metadata: {
      wordCount: countWords(formattedContent),
      sectionCount: templatedSections.length,
      appliedAt: new Date()
    }
  };
}

/**
 * Reorder sections according to template requirements
 */
function reorderSections(
  sections: DetectedSection[], 
  templateOrder: string[]
): DetectedSection[] {
  const orderedSections: DetectedSection[] = [];
  const remainingSections = [...sections];
  
  // Add sections in template order
  for (const templateSection of templateOrder) {
    const matchingSection = remainingSections.find(section => 
      section.standardTitle === templateSection ||
      section.title.toLowerCase().includes(templateSection.toLowerCase())
    );
    
    if (matchingSection) {
      orderedSections.push(matchingSection);
      const index = remainingSections.indexOf(matchingSection);
      remainingSections.splice(index, 1);
    }
  }
  
  // Add any remaining sections at the end
  orderedSections.push(...remainingSections);
  
  return orderedSections;
}

/**
 * Format a section according to template styling
 */
function formatSection(
  section: DetectedSection,
  template: ResumeTemplate,
  order: number
): TemplatedSection {
  const formatting = template.formatting;
  let formattedContent = section.content;
  
  // Apply bullet point styling
  if (formatting.elements.bullets && formatting.elements.bullets !== '•') {
    formattedContent = formattedContent.replace(/^[•\-\*]\s/gm, `${formatting.elements.bullets} `);
  }
  
  // Apply line spacing (represented as extra line breaks in text)
  if (formatting.spacing.lineHeight > 1.2) {
    formattedContent = formattedContent.replace(/\n/g, '\n\n');
  }
  
  // Clean up extra whitespace
  formattedContent = formattedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return {
    id: `section-${order}`,
    title: section.standardTitle,
    content: formattedContent.trim(),
    order,
    formatted: true
  };
}

/**
 * Generate the final formatted content
 */
function generateFormattedContent(
  sections: TemplatedSection[],
  template: ResumeTemplate
): string {
  const formatting = template.formatting;
  let content = '';
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    
    // Add section title (uppercase for ATS compatibility)
    content += section.title.toUpperCase() + '\n';
    
    // Add section divider if enabled
    if (formatting.elements.dividers && i > 0) {
      content += '─'.repeat(section.title.length) + '\n';
    }
    
    // Add section content
    content += section.content;
    
    // Add section spacing
    if (i < sections.length - 1) {
      const spacingLines = Math.max(1, Math.floor(formatting.spacing.sectionSpacing / 6));
      content += '\n'.repeat(spacingLines + 1);
    }
  }
  
  return content.trim();
}

/**
 * Generate template-specific DOCX styling options
 */
export function getDocxStyling(template: ResumeTemplate) {
  const formatting = template.formatting;
  
  return {
    fonts: {
      primary: formatting.fonts.primary,
      secondary: formatting.fonts.secondary || formatting.fonts.primary
    },
    sizes: {
      heading: formatting.fonts.size.heading * 2, // Convert to half-points
      subheading: formatting.fonts.size.subheading * 2,
      body: formatting.fonts.size.body * 2
    },
    colors: {
      primary: formatting.colors.primary,
      secondary: formatting.colors.secondary,
      accent: formatting.colors.accent || formatting.colors.primary
    },
    spacing: {
      lineSpacing: Math.round(formatting.spacing.lineHeight * 240), // Convert to DOCX units
      paragraphSpacing: formatting.spacing.paragraphSpacing * 20,
      sectionSpacing: formatting.spacing.sectionSpacing * 20
    },
    margins: parseMargin(formatting.layout.margin),
    bullets: formatting.elements.bullets
  };
}

/**
 * Parse margin string to DOCX units (twentieths of a point)
 */
function parseMargin(margin: string): number {
  const inchValue = parseFloat(margin.replace('in', ''));
  return inchValue * 1440; // 1 inch = 1440 twentieths of a point
}

/**
 * Generate template preview content
 */
export function generateTemplatePreview(): string {
  const sampleSections = [
    {
      title: 'CONTACT INFORMATION',
      content: 'John Smith\nSoftware Engineer\nPhone: (555) 123-4567\nEmail: john.smith@email.com'
    },
    {
      title: 'PROFESSIONAL SUMMARY',
      content: 'Experienced software engineer with 5+ years developing scalable web applications. Proven track record of delivering high-quality solutions using modern technologies.'
    },
    {
      title: 'WORK EXPERIENCE',
      content: 'Senior Software Engineer | TechCorp | 2020-Present\n• Developed 15+ web applications using React and Node.js\n• Led team of 4 developers on critical projects\n• Improved application performance by 40%'
    }
  ];
  
  return sampleSections
    .map(section => `${section.title}\n${section.content}`)
    .join('\n\n');
}

/**
 * Validate template compatibility with content
 */
export function validateTemplateCompatibility(
  document: ATSOptimizedDocument,
  _template: ResumeTemplate
): { compatible: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  // Check if all required sections exist
  for (const requiredSection of _template.sectionOrder) {
    const hasSection = document.sections.some(section => 
      section.standardTitle === requiredSection
    );
    
    if (!hasSection) {
      warnings.push(`Missing recommended section: ${requiredSection}`);
    }
  }
  
  // Check content length compatibility
  const totalLength = document.content.length;
  if (totalLength > 4000 && _template.formatting.fonts.size.body < 11) {
    warnings.push('Content may be too long for this template\'s font size');
  }
  
  // Check ATS compatibility
  if (!_template.isATS) {
    warnings.push('This template may have reduced ATS compatibility');
  }
  
  return {
    compatible: warnings.length === 0,
    warnings
  };
}

/**
 * Helper function to count words
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

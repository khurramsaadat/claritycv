// Template definitions for ATS-optimized resume formats
export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'professional' | 'modern' | 'clean' | 'executive';
  preview: string;
  isATS: boolean;
  features: string[];
  sectionOrder: string[];
  formatting: TemplateFormatting;
}

export interface TemplateFormatting {
  fonts: {
    primary: string;
    secondary?: string;
    size: {
      heading: number;
      subheading: number;
      body: number;
    };
  };
  spacing: {
    lineHeight: number;
    paragraphSpacing: number;
    sectionSpacing: number;
  };
  colors: {
    primary: string;
    secondary: string;
    text: string;
    accent?: string;
  };
  layout: {
    margin: string;
    maxWidth?: string;
    columns: 1 | 2; // ATS templates should always be 1
  };
  elements: {
    bullets: string;
    dividers: boolean;
    borders: boolean;
    background: boolean;
  };
}

export interface TemplateSection {
  id: string;
  title: string;
  order: number;
  required: boolean;
  atsStandard: string; // Standard ATS section name
}

// Standard ATS-approved section mappings
export const ATS_SECTIONS = {
  CONTACT: 'Contact Information',
  SUMMARY: 'Professional Summary',
  EXPERIENCE: 'Work Experience',
  EDUCATION: 'Education',
  SKILLS: 'Technical Skills',
  CERTIFICATIONS: 'Certifications',
  PROJECTS: 'Projects',
  ACHIEVEMENTS: 'Achievements',
  LANGUAGES: 'Languages',
  VOLUNTEER: 'Volunteer Experience',
  PUBLICATIONS: 'Publications',
  AWARDS: 'Awards and Recognition'
} as const;

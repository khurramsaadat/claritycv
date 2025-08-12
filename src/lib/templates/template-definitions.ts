// Pre-defined ATS-optimized resume templates
import type { ResumeTemplate } from '@/types/template';
import { ATS_SECTIONS } from '@/types/template';

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: 'classic-professional',
    name: 'Classic Professional',
    description: 'Traditional single-column format trusted by 95% of ATS systems. Perfect for corporate roles.',
    category: 'professional',
    preview: '/templates/classic-professional.svg',
    isATS: true,
    features: [
      'Single-column layout',
      'Standard section headers',
      'Bullet-point format',
      'Minimal styling',
      'High ATS compatibility'
    ],
    sectionOrder: [
      ATS_SECTIONS.CONTACT,
      ATS_SECTIONS.SUMMARY,
      ATS_SECTIONS.EXPERIENCE,
      ATS_SECTIONS.EDUCATION,
      ATS_SECTIONS.SKILLS,
      ATS_SECTIONS.CERTIFICATIONS
    ],
    formatting: {
      fonts: {
        primary: 'Calibri',
        size: {
          heading: 14,
          subheading: 12,
          body: 11
        }
      },
      spacing: {
        lineHeight: 1.15,
        paragraphSpacing: 6,
        sectionSpacing: 12
      },
      colors: {
        primary: '#000000',
        secondary: '#333333',
        text: '#000000'
      },
      layout: {
        margin: '0.5in',
        columns: 1
      },
      elements: {
        bullets: '•',
        dividers: false,
        borders: false,
        background: false
      }
    }
  },
  {
    id: 'modern-clean',
    name: 'Modern Clean',
    description: 'Contemporary design with ATS-safe formatting. Ideal for tech and creative industries.',
    category: 'modern',
    preview: '/templates/modern-clean.svg',
    isATS: true,
    features: [
      'Clean typography',
      'Subtle section dividers',
      'Optimized spacing',
      'Professional appearance',
      'ATS-compliant structure'
    ],
    sectionOrder: [
      ATS_SECTIONS.CONTACT,
      ATS_SECTIONS.SUMMARY,
      ATS_SECTIONS.SKILLS,
      ATS_SECTIONS.EXPERIENCE,
      ATS_SECTIONS.PROJECTS,
      ATS_SECTIONS.EDUCATION
    ],
    formatting: {
      fonts: {
        primary: 'Arial',
        size: {
          heading: 14,
          subheading: 12,
          body: 11
        }
      },
      spacing: {
        lineHeight: 1.2,
        paragraphSpacing: 8,
        sectionSpacing: 14
      },
      colors: {
        primary: '#1a1a1a',
        secondary: '#666666',
        text: '#333333',
        accent: '#2563eb'
      },
      layout: {
        margin: '0.75in',
        columns: 1
      },
      elements: {
        bullets: '▪',
        dividers: true,
        borders: false,
        background: false
      }
    }
  },
  {
    id: 'executive-formal',
    name: 'Executive Formal',
    description: 'Premium format for senior-level positions. Emphasizes leadership and achievements.',
    category: 'executive',
    preview: '/templates/executive-formal.svg',
    isATS: true,
    features: [
      'Executive-focused sections',
      'Achievement emphasis',
      'Formal typography',
      'Leadership structure',
      'C-suite compatible'
    ],
    sectionOrder: [
      ATS_SECTIONS.CONTACT,
      ATS_SECTIONS.SUMMARY,
      ATS_SECTIONS.ACHIEVEMENTS,
      ATS_SECTIONS.EXPERIENCE,
      ATS_SECTIONS.EDUCATION,
      ATS_SECTIONS.AWARDS
    ],
    formatting: {
      fonts: {
        primary: 'Times New Roman',
        size: {
          heading: 14,
          subheading: 12,
          body: 11
        }
      },
      spacing: {
        lineHeight: 1.1,
        paragraphSpacing: 6,
        sectionSpacing: 16
      },
      colors: {
        primary: '#000000',
        secondary: '#444444',
        text: '#000000'
      },
      layout: {
        margin: '0.5in',
        columns: 1
      },
      elements: {
        bullets: '•',
        dividers: false,
        borders: false,
        background: false
      }
    }
  },
  {
    id: 'tech-focused',
    name: 'Tech Focused',
    description: 'Optimized for technical roles with emphasis on skills and projects. Developer-friendly.',
    category: 'modern',
    preview: '/templates/tech-focused.svg',
    isATS: true,
    features: [
      'Skills-first layout',
      'Project showcase',
      'Technical keywords',
      'GitHub integration ready',
      'Developer optimized'
    ],
    sectionOrder: [
      ATS_SECTIONS.CONTACT,
      ATS_SECTIONS.SUMMARY,
      ATS_SECTIONS.SKILLS,
      ATS_SECTIONS.PROJECTS,
      ATS_SECTIONS.EXPERIENCE,
      ATS_SECTIONS.EDUCATION,
      ATS_SECTIONS.CERTIFICATIONS
    ],
    formatting: {
      fonts: {
        primary: 'Segoe UI',
        secondary: 'Consolas',
        size: {
          heading: 14,
          subheading: 12,
          body: 11
        }
      },
      spacing: {
        lineHeight: 1.25,
        paragraphSpacing: 8,
        sectionSpacing: 12
      },
      colors: {
        primary: '#0d1117',
        secondary: '#586069',
        text: '#24292e',
        accent: '#0366d6'
      },
      layout: {
        margin: '0.6in',
        columns: 1
      },
      elements: {
        bullets: '→',
        dividers: true,
        borders: false,
        background: false
      }
    }
  },
  {
    id: 'minimalist-ats',
    name: 'Minimalist ATS',
    description: 'Ultra-clean format prioritizing content over design. Maximum compatibility guaranteed.',
    category: 'clean',
    preview: '/templates/minimalist-ats.svg',
    isATS: true,
    features: [
      'Zero graphics',
      'Text-only format',
      'Maximum parsing',
      'Universal compatibility',
      'Content focused'
    ],
    sectionOrder: [
      ATS_SECTIONS.CONTACT,
      ATS_SECTIONS.SUMMARY,
      ATS_SECTIONS.EXPERIENCE,
      ATS_SECTIONS.EDUCATION,
      ATS_SECTIONS.SKILLS
    ],
    formatting: {
      fonts: {
        primary: 'Arial',
        size: {
          heading: 12,
          subheading: 11,
          body: 10
        }
      },
      spacing: {
        lineHeight: 1.0,
        paragraphSpacing: 4,
        sectionSpacing: 8
      },
      colors: {
        primary: '#000000',
        secondary: '#000000',
        text: '#000000'
      },
      layout: {
        margin: '0.5in',
        columns: 1
      },
      elements: {
        bullets: '-',
        dividers: false,
        borders: false,
        background: false
      }
    }
  }
];

// Helper function to get template by ID
export function getTemplateById(id: string): ResumeTemplate | undefined {
  return RESUME_TEMPLATES.find(template => template.id === id);
}

// Helper function to get templates by category
export function getTemplatesByCategory(category: ResumeTemplate['category']): ResumeTemplate[] {
  return RESUME_TEMPLATES.filter(template => template.category === category);
}

// Helper function to get default template
export function getDefaultTemplate(): ResumeTemplate {
  return RESUME_TEMPLATES[0]; // Classic Professional
}

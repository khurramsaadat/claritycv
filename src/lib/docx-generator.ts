// DOCX file generation using docx library for real Microsoft Word documents
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import type { ATSOptimizedDocument } from './ats-optimizer';

/**
 * Generates a real DOCX file from optimized resume content
 * @param optimizedDocument - ATS optimized document
 * @param originalFileName - Original filename for naming
 * @returns Promise resolving to Uint8Array containing DOCX data
 */
export async function generateDOCX(
  optimizedDocument: ATSOptimizedDocument,
  originalFileName: string
): Promise<{ buffer: Uint8Array; filename: string }> {
  const baseName = originalFileName.replace(/\.[^/.]+$/, '');
  const filename = `${baseName}_ATS_optimized.docx`;

  // Create document sections
  const children: (Paragraph)[] = [];

  // Split content by sections for better formatting
  const sections = optimizedDocument.sections;

  // Process each section
  for (const section of sections) {
    // Add section heading
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: section.standardTitle,
            bold: true,
            size: 24, // 12pt font
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: {
          before: 240, // 12pt before
          after: 120,  // 6pt after
        },
      })
    );

    // Add section content
    const sectionContent = section.content;
    const sectionLines = sectionContent.split('\n').filter(line => line.trim().length > 0);

    for (const line of sectionLines) {
      const trimmedLine = line.trim();
      if (trimmedLine.length === 0) continue;

      // Check if line is a bullet point
      const isBulletPoint = trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*');
      
      if (isBulletPoint) {
        // Format as bullet point
        const bulletText = trimmedLine.replace(/^[•\-*]\s*/, '');
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: bulletText,
                size: 22, // 11pt font
              }),
            ],
            bullet: {
              level: 0,
            },
            spacing: {
              after: 60, // 3pt after
            },
          })
        );
      } else {
        // Format as regular paragraph
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: trimmedLine,
                size: 22, // 11pt font
              }),
            ],
            spacing: {
              after: 120, // 6pt after
            },
          })
        );
      }
    }

    // Add spacing after section
    children.push(
      new Paragraph({
        children: [new TextRun("")],
        spacing: {
          after: 240, // 12pt after section
        },
      })
    );
  }

  // If no sections detected, format the entire content
  if (sections.length === 0) {
    const lines = optimizedDocument.content.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.length === 0) {
        // Empty line - add spacing
        children.push(new Paragraph({ children: [new TextRun("")] }));
        continue;
      }

      // Check if it looks like a heading (all caps, short line)
      const isHeading = /^[A-Z\s]{3,30}$/.test(trimmedLine) && trimmedLine.length < 50;
      
      if (isHeading) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: trimmedLine,
                bold: true,
                size: 24, // 12pt font
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 240,
              after: 120,
            },
          })
        );
      } else {
        // Check if line is a bullet point
        const isBulletPoint = trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*');
        
        if (isBulletPoint) {
          const bulletText = trimmedLine.replace(/^[•\-*]\s*/, '');
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: bulletText,
                  size: 22,
                }),
              ],
              bullet: {
                level: 0,
              },
              spacing: {
                after: 60,
              },
            })
          );
        } else {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmedLine,
                  size: 22,
                }),
              ],
              spacing: {
                after: 120,
              },
            })
          );
        }
      }
    }
  }

  // Create the document
  const doc = new Document({
    creator: "ClarityCV",
    title: `${baseName} - ATS Optimized Resume`,
    description: "ATS-optimized resume generated by ClarityCV",
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22, // 11pt
          },
          paragraph: {
            spacing: {
              line: 276, // 1.15 line spacing (276 = 1.15 * 240)
            },
          },
        },
      },
      paragraphStyles: [
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          run: {
            size: 24,
            bold: true,
            color: "000000",
          },
          paragraph: {
            spacing: {
              before: 240,
              after: 120,
            },
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,    // 0.5 inch
              right: 720,  // 0.5 inch
              bottom: 720, // 0.5 inch
              left: 720,   // 0.5 inch
            },
          },
        },
        children,
      },
    ],
  });

  // Generate the buffer
  const buffer = await Packer.toBuffer(doc);
  
  // Convert to Uint8Array with proper ArrayBuffer
  const uint8Array = buffer instanceof Uint8Array 
    ? new Uint8Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength))
    : new Uint8Array(buffer);
  
  return {
    buffer: uint8Array,
    filename,
  };
}

/**
 * Checks if DOCX generation is supported in the current environment
 * @returns boolean indicating support
 */
export function isDOCXGenerationSupported(): boolean {
  // DOCX generation works in browser environments
  return typeof window !== 'undefined';
}

"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import {
  GripVertical,
  Plus,
  X,
  Edit2,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DetectedSection } from '@/lib/ats-optimizer';

interface SectionManagerProps {
  sections: DetectedSection[];
  onSectionsChange: (sections: DetectedSection[]) => void;
  className?: string;
}

interface SectionTemplate {
  id: string;
  title: string;
  standardTitle: string;
  description: string;
  placeholder: string;
  isRequired: boolean;
}

const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: 'contact',
    title: 'Contact Information',
    standardTitle: 'CONTACT INFORMATION',
    description: 'Your basic contact details',
    placeholder: 'Full Name\nPhone Number\nEmail Address\nLinkedIn Profile\nLocation',
    isRequired: true
  },
  {
    id: 'summary',
    title: 'Professional Summary',
    standardTitle: 'PROFESSIONAL SUMMARY',
    description: 'Brief overview of your experience and skills',
    placeholder: 'Experienced professional with expertise in...',
    isRequired: true
  },
  {
    id: 'experience',
    title: 'Work Experience',
    standardTitle: 'WORK EXPERIENCE',
    description: 'Your employment history and achievements',
    placeholder: 'Job Title | Company Name | Dates\n• Achievement with quantified results\n• Key responsibility or accomplishment',
    isRequired: true
  },
  {
    id: 'education',
    title: 'Education',
    standardTitle: 'EDUCATION',
    description: 'Your educational background',
    placeholder: 'Degree | Institution | Year\nRelevant coursework, honors, or certifications',
    isRequired: true
  },
  {
    id: 'skills',
    title: 'Skills',
    standardTitle: 'SKILLS',
    description: 'Technical and professional skills',
    placeholder: 'Technical Skills: Software, programming languages, tools\nSoft Skills: Leadership, communication, project management',
    isRequired: false
  },
  {
    id: 'certifications',
    title: 'Certifications',
    standardTitle: 'CERTIFICATIONS',
    description: 'Professional certifications and licenses',
    placeholder: 'Certification Name | Issuing Organization | Date\nCertification Name | Issuing Organization | Date',
    isRequired: false
  },
  {
    id: 'projects',
    title: 'Projects',
    standardTitle: 'PROJECTS',
    description: 'Relevant projects and accomplishments',
    placeholder: 'Project Name | Date\n• Description of project and your role\n• Technologies used and results achieved',
    isRequired: false
  }
];

export function SectionManager({ sections, onSectionsChange, className }: SectionManagerProps) {
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [isAddingSection, setIsAddingSection] = useState(false);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newSections = Array.from(sections);
    const [reorderedSection] = newSections.splice(result.source.index, 1);
    newSections.splice(result.destination.index, 0, reorderedSection);

    onSectionsChange(newSections);
  };

  const handleEditSection = (index: number) => {
    setEditingSectionId(index);
    setEditingContent(sections[index].content);
  };

  const handleSaveEdit = () => {
    if (editingSectionId !== null) {
      const newSections = [...sections];
      newSections[editingSectionId] = {
        ...newSections[editingSectionId],
        content: editingContent
      };
      onSectionsChange(newSections);
      setEditingSectionId(null);
      setEditingContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingSectionId(null);
    setEditingContent('');
  };

  const handleDeleteSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    onSectionsChange(newSections);
  };

  const handleAddSection = (template: SectionTemplate) => {
    const newSection: DetectedSection = {
      title: template.title,
      standardTitle: template.standardTitle,
      content: template.placeholder,
      startIndex: sections.length > 0 ? sections[sections.length - 1].startIndex + 1 : 0,
      endIndex: sections.length > 0 ? sections[sections.length - 1].endIndex + 1 : 0,
      confidence: 1.0
    };
    
    onSectionsChange([...sections, newSection]);
    setIsAddingSection(false);
  };

  const getSectionStatus = (section: DetectedSection) => {
    const wordCount = section.content.trim().split(/\s+/).length;
    const template = SECTION_TEMPLATES.find(t => t.standardTitle === section.standardTitle);
    
    if (template?.isRequired && wordCount < 5) {
      return { type: 'warning', message: 'Too short for required section' };
    }
    if (wordCount > 150) {
      return { type: 'info', message: 'Consider condensing for ATS readability' };
    }
    if (wordCount < 10) {
      return { type: 'warning', message: 'Could be more detailed' };
    }
    return { type: 'success', message: 'Good length' };
  };

  const getExistingSectionIds = () => {
    return sections.map(section => 
      SECTION_TEMPLATES.find(t => t.standardTitle === section.standardTitle)?.id
    ).filter(Boolean);
  };

  const getAvailableTemplates = () => {
    const existingIds = getExistingSectionIds();
    return SECTION_TEMPLATES.filter(template => !existingIds.includes(template.id));
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Section Manager</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingSection(true)}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {sections.map((section, index) => {
                    const status = getSectionStatus(section);
                    const isEditing = editingSectionId === index;
                    
                    return (
                      <Draggable
                        key={`section-${index}`}
                        draggableId={`section-${index}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "transition-shadow",
                              snapshot.isDragging && "shadow-lg ring-2 ring-primary/50"
                            )}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                {/* Drag Handle */}
                                <div
                                  {...provided.dragHandleProps}
                                  className="mt-2 cursor-grab active:cursor-grabbing"
                                >
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>

                                {/* Section Content */}
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium">{section.standardTitle}</h3>
                                      <Badge variant="outline" className="text-xs">
                                        {section.content.trim().split(/\s+/).length} words
                                      </Badge>
                                      {status.type === 'warning' && (
                                        <Badge variant="secondary" className="text-xs text-yellow-600">
                                          <AlertTriangle className="h-3 w-3 mr-1" />
                                          {status.message}
                                        </Badge>
                                      )}
                                      {status.type === 'info' && (
                                        <Badge variant="outline" className="text-xs text-blue-600">
                                          <Info className="h-3 w-3 mr-1" />
                                          {status.message}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-1">
                                      {isEditing ? (
                                        <>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleSaveEdit}
                                            className="h-7 w-7 p-0"
                                          >
                                            <Check className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCancelEdit}
                                            className="h-7 w-7 p-0"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </>
                                      ) : (
                                        <>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditSection(index)}
                                            className="h-7 w-7 p-0"
                                          >
                                            <Edit2 className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteSection(index)}
                                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {isEditing ? (
                                    <textarea
                                      value={editingContent}
                                      onChange={(e) => setEditingContent(e.target.value)}
                                      className="w-full h-32 p-3 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                      placeholder="Enter section content..."
                                    />
                                  ) : (
                                    <div className="bg-muted/30 p-3 rounded-lg">
                                      <pre className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">
                                        {section.content.length > 200 
                                          ? `${section.content.substring(0, 200)}...` 
                                          : section.content
                                        }
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Add Section Modal */}
          {isAddingSection && (
            <Card className="border-dashed border-2 border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Add New Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  {getAvailableTemplates().map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleAddSection(template)}
                    >
                      <div>
                        <div className="font-medium text-sm">{template.title}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                      {template.isRequired && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingSection(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

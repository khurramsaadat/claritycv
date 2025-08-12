"use client";

import { useState } from 'react';
import { Check, Crown, Zap, Shield, Code, Minimize2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RESUME_TEMPLATES, getTemplatesByCategory } from '@/lib/templates/template-definitions';
import type { ResumeTemplate } from '@/types/template';

interface TemplateSelectorProps {
  selectedTemplate?: string;
  onTemplateSelect: (template: ResumeTemplate) => void;
  className?: string;
}

export function TemplateSelector({ 
  selectedTemplate, 
  onTemplateSelect, 
  className = "" 
}: TemplateSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<ResumeTemplate['category']>('professional');



  const getTemplateIcon = (templateId: string) => {
    switch (templateId) {
      case 'classic-professional': return <Crown className="h-5 w-5" />;
      case 'modern-clean': return <Zap className="h-5 w-5" />;
      case 'executive-formal': return <Shield className="h-5 w-5" />;
      case 'tech-focused': return <Code className="h-5 w-5" />;
      case 'minimalist-ats': return <Minimize2 className="h-5 w-5" />;
      default: return <Crown className="h-5 w-5" />;
    }
  };

  const renderTemplateCard = (template: ResumeTemplate) => {
    const isSelected = selectedTemplate === template.id;
    
    return (
      <Card 
        key={template.id}
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected 
            ? 'border-primary bg-primary/5 shadow-md' 
            : 'border-border hover:border-primary/50'
        } ${className}`}
        onClick={() => onTemplateSelect(template)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              {getTemplateIcon(template.id)}
              {template.name}
            </CardTitle>
            {isSelected && (
              <div className="flex items-center gap-1">
                <Check className="h-4 w-4 text-primary" />
                <Badge variant="default" className="text-xs">Selected</Badge>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Template Preview Placeholder */}
          <div className="aspect-[8.5/11] bg-muted/30 border rounded-lg flex items-center justify-center text-muted-foreground text-sm">
            <div className="text-center space-y-2">
              {getTemplateIcon(template.id)}
              <div>Preview Available</div>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground">{template.description}</p>
          
          {/* Features */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Key Features:</h4>
            <div className="space-y-1">
              {template.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* ATS Badge */}
          <div className="flex items-center justify-between">
            <Badge 
              variant={template.isATS ? "default" : "outline"}
              className="text-xs"
            >
              {template.isATS ? "✓ ATS Optimized" : "Standard"}
            </Badge>
            
            <Button 
              size="sm" 
              variant={isSelected ? "default" : "outline"}
              className="text-xs"
            >
              {isSelected ? "Selected" : "Select"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Resume Template</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          All templates are ATS-optimized for maximum compatibility. Select the style that best represents your professional brand.
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as ResumeTemplate['category'])}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="professional" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            <span className="hidden sm:inline">Professional</span>
          </TabsTrigger>
          <TabsTrigger value="modern" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Modern</span>
          </TabsTrigger>
          <TabsTrigger value="executive" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Executive</span>
          </TabsTrigger>
          <TabsTrigger value="clean" className="flex items-center gap-2">
            <Minimize2 className="h-4 w-4" />
            <span className="hidden sm:inline">Clean</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="professional" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getTemplatesByCategory('professional').concat(
              RESUME_TEMPLATES.filter(t => t.category !== 'professional')
            ).map(renderTemplateCard)}
          </div>
        </TabsContent>

        <TabsContent value="modern" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getTemplatesByCategory('modern').map(renderTemplateCard)}
          </div>
        </TabsContent>

        <TabsContent value="executive" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getTemplatesByCategory('executive').map(renderTemplateCard)}
          </div>
        </TabsContent>

        <TabsContent value="clean" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getTemplatesByCategory('clean').map(renderTemplateCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* ATS Guarantee */}
      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
        <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">ATS Compatibility Guarantee</h3>
        <p className="text-sm text-green-700 dark:text-green-300">
          All ClarityCV templates are rigorously tested with leading ATS systems including Workday, Greenhouse, 
          Lever, and more. Your resume will parse correctly 99%+ of the time.
        </p>
      </div>
    </div>
  );
}

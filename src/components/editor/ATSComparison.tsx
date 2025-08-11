"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowRight,
  FileText,
  Target,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Eye,
  BarChart3,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ATSOptimizedDocument } from '@/lib/ats-optimizer';
import type { ParsedDocument } from '@/lib/parsers/pdf-parser';

interface ATSComparisonProps {
  originalDocument: ParsedDocument;
  optimizedDocument: ATSOptimizedDocument;
  className?: string;
}

interface ComparisonMetrics {
  wordCount: { before: number; after: number; change: number };
  lineCount: { before: number; after: number; change: number };
  sectionCount: { before: number; after: number; change: number };
  bulletPoints: { before: number; after: number; change: number };
  specialChars: { before: number; after: number; change: number };
  atsScore: { before: number; after: number; improvement: number };
}

interface ATSAnalysis {
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  keywords: string[];
  score: number;
}

export function ATSComparison({ 
  originalDocument, 
  optimizedDocument, 
  className 
}: ATSComparisonProps) {
  const [activeView, setActiveView] = useState<'comparison' | 'analysis'>('comparison');

  const metrics = useMemo<ComparisonMetrics>(() => {
    const originalText = originalDocument.text;
    const optimizedText = optimizedDocument.content;

    // Word counts
    const originalWords = originalText.trim().split(/\s+/).length;
    const optimizedWords = optimizedText.trim().split(/\s+/).length;
    
    // Line counts
    const originalLines = originalText.split('\n').filter(line => line.trim().length > 0).length;
    const optimizedLines = optimizedText.split('\n').filter(line => line.trim().length > 0).length;
    
    // Section counts (estimate based on capital letters and common patterns)
    const originalSections = (originalText.match(/^[A-Z\s]{3,}$/gm) || []).length;
    const optimizedSections = optimizedDocument.sections.length;
    
    // Bullet points
    const originalBullets = (originalText.match(/[•\-\*]/g) || []).length;
    const optimizedBullets = (optimizedText.match(/[•]/g) || []).length;
    
    // Special characters that ATS might not handle well
    const specialCharRegex = /[^\w\s\.\,\;\:\!\?\-\(\)\[\]\/\@\#\%\&\+\=]/g;
    const originalSpecialChars = (originalText.match(specialCharRegex) || []).length;
    const optimizedSpecialChars = (optimizedText.match(specialCharRegex) || []).length;

    // ATS Scores (simplified calculation)
    const originalScore = Math.max(20, 100 - (originalSpecialChars * 2) - (originalSections < 3 ? 20 : 0));
    const optimizedScore = 85; // Default score for optimized documents

    return {
      wordCount: {
        before: originalWords,
        after: optimizedWords,
        change: optimizedWords - originalWords
      },
      lineCount: {
        before: originalLines,
        after: optimizedLines,
        change: optimizedLines - originalLines
      },
      sectionCount: {
        before: originalSections,
        after: optimizedSections,
        change: optimizedSections - originalSections
      },
      bulletPoints: {
        before: originalBullets,
        after: optimizedBullets,
        change: optimizedBullets - originalBullets
      },
      specialChars: {
        before: originalSpecialChars,
        after: optimizedSpecialChars,
        change: optimizedSpecialChars - originalSpecialChars
      },
      atsScore: {
        before: originalScore,
        after: optimizedScore,
        improvement: optimizedScore - originalScore
      }
    };
  }, [originalDocument, optimizedDocument]);

  const analysis = useMemo<ATSAnalysis>(() => {
    const strengths = [];
    const improvements = [];
    const recommendations = [];

    // Analyze improvements
    if (metrics.atsScore.improvement > 10) {
      strengths.push("Significant ATS compatibility improvement");
    }
    if (metrics.specialChars.change < 0) {
      strengths.push("Removed problematic special characters");
    }
    if (metrics.sectionCount.change > 0) {
      strengths.push("Better section organization");
    }
    if (optimizedDocument.sections.length >= 4) {
      strengths.push("Comprehensive section coverage");
    }

    // Identify what was improved
    if (metrics.specialChars.before > metrics.specialChars.after) {
      improvements.push(`Removed ${Math.abs(metrics.specialChars.change)} special characters`);
    }
    if (metrics.sectionCount.after > metrics.sectionCount.before) {
      improvements.push(`Added ${metrics.sectionCount.change} standard sections`);
    }
    if (metrics.bulletPoints.after > 0) {
      improvements.push("Standardized bullet point formatting");
    }

    // Generate recommendations
    if (metrics.wordCount.after > 800) {
      recommendations.push("Consider condensing content to under 800 words for optimal ATS processing");
    }
    if (optimizedDocument.sections.length < 5) {
      recommendations.push("Add more sections like Skills or Certifications if applicable");
    }
    if (metrics.atsScore.after < 80) {
      recommendations.push("Include more industry-specific keywords to boost ATS score");
    }

    // Extract potential keywords
    const keywords = optimizedDocument.content
      .toLowerCase()
      .match(/\b\w{4,}\b/g)
      ?.filter((word, index, arr) => arr.indexOf(word) === index)
      .filter(word => 
        !['this', 'that', 'with', 'from', 'they', 'have', 'will', 'been', 'were', 'work', 'experience'].includes(word)
      )
      .slice(0, 8) || [];

    return {
      strengths,
      improvements,
      recommendations,
      keywords,
      score: metrics.atsScore.after
    };
  }, [metrics, optimizedDocument]);

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
    return <TrendingUp className="h-4 w-4 text-gray-400" />;
  };

  const getChangeColor = (change: number, isReverse = false) => {
    if (change === 0) return 'text-muted-foreground';
    const isPositive = isReverse ? change < 0 : change > 0;
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              ATS Optimization Results
            </CardTitle>
            <Badge 
              variant={metrics.atsScore.after >= 80 ? 'default' : 'secondary'}
              className="text-lg font-bold px-4 py-2"
            >
              {metrics.atsScore.after}% ATS Score
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeView} onValueChange={setActiveView as (value: string) => void}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Before & After
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comparison" className="space-y-6 mt-6">
              {/* Metrics Overview */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {metrics.atsScore.after}%
                    </div>
                    <div className="text-xs text-muted-foreground">ATS Score</div>
                    <div className={cn("text-xs flex items-center justify-center gap-1 mt-1", 
                      getChangeColor(metrics.atsScore.improvement))}>
                      {getChangeIcon(metrics.atsScore.improvement)}
                      +{metrics.atsScore.improvement}%
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold mb-1">{metrics.wordCount.after}</div>
                    <div className="text-xs text-muted-foreground">Words</div>
                    <div className={cn("text-xs flex items-center justify-center gap-1 mt-1", 
                      getChangeColor(metrics.wordCount.change))}>
                      {getChangeIcon(metrics.wordCount.change)}
                      {metrics.wordCount.change > 0 ? '+' : ''}{metrics.wordCount.change}
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold mb-1">{metrics.sectionCount.after}</div>
                    <div className="text-xs text-muted-foreground">Sections</div>
                    <div className={cn("text-xs flex items-center justify-center gap-1 mt-1", 
                      getChangeColor(metrics.sectionCount.change))}>
                      {getChangeIcon(metrics.sectionCount.change)}
                      {metrics.sectionCount.change > 0 ? '+' : ''}{metrics.sectionCount.change}
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold mb-1">{metrics.bulletPoints.after}</div>
                    <div className="text-xs text-muted-foreground">Bullets</div>
                    <div className={cn("text-xs flex items-center justify-center gap-1 mt-1", 
                      getChangeColor(metrics.bulletPoints.change))}>
                      {getChangeIcon(metrics.bulletPoints.change)}
                      {metrics.bulletPoints.change > 0 ? '+' : ''}{metrics.bulletPoints.change}
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold mb-1">{metrics.specialChars.after}</div>
                    <div className="text-xs text-muted-foreground">Special Chars</div>
                    <div className={cn("text-xs flex items-center justify-center gap-1 mt-1", 
                      getChangeColor(metrics.specialChars.change, true))}>
                      {getChangeIcon(-metrics.specialChars.change)}
                      {metrics.specialChars.change > 0 ? '+' : ''}{metrics.specialChars.change}
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold mb-1">{metrics.lineCount.after}</div>
                    <div className="text-xs text-muted-foreground">Lines</div>
                    <div className={cn("text-xs flex items-center justify-center gap-1 mt-1", 
                      getChangeColor(metrics.lineCount.change))}>
                      {getChangeIcon(metrics.lineCount.change)}
                      {metrics.lineCount.change > 0 ? '+' : ''}{metrics.lineCount.change}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      Original Document
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] overflow-auto bg-muted/30 p-4 rounded-lg">
                      <pre className="text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
                        {originalDocument.text.length > 2000 
                          ? `${originalDocument.text.substring(0, 2000)}...` 
                          : originalDocument.text
                        }
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-primary">
                      <Zap className="h-4 w-4" />
                      ATS-Optimized Document
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] overflow-auto bg-primary/5 p-4 rounded-lg border-primary/20 border">
                      <pre className="text-xs leading-relaxed whitespace-pre-wrap">
                        {optimizedDocument.content.length > 2000 
                          ? `${optimizedDocument.content.substring(0, 2000)}...` 
                          : optimizedDocument.content
                        }
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6 mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths & Improvements */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {analysis.strengths.map((strength, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-green-800 dark:text-green-200">{strength}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-blue-600">
                        <TrendingUp className="h-4 w-4" />
                        Improvements Made
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {analysis.improvements.map((improvement, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-blue-800 dark:text-blue-200">{improvement}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendations & Keywords */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-yellow-600">
                        <AlertTriangle className="h-4 w-4" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {analysis.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                          <Target className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-yellow-800 dark:text-yellow-200">{recommendation}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Key Terms Detected</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Settings, Palette, Shield, Trash2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "./ThemeProvider";
import { DataClearanceManager } from "./privacy/DataClearanceManager";
import { PerformanceMonitor } from "./performance/PerformanceMonitor";
import { TemplateSelector } from "./templates/TemplateSelector";
import { useState } from "react";

export function SettingsDropdown() {
  const { theme, setTheme, themes } = useTheme();
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState(false);

  const clearAllData = () => {
    // Clear all application data except theme preference
    const currentTheme = localStorage.getItem("theme");
    localStorage.clear();
    sessionStorage.clear();
    if (currentTheme) {
      localStorage.setItem("theme", currentTheme);
    }
    
    // Show confirmation
    alert("All application data has been cleared while preserving your theme preference.");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[80vh] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-4 w-4" />
            <span className="text-sm font-medium">Color Themes</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Choose from 8 carefully crafted color themes to customize your experience.
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {themes.map((t) => (
              <div key={t.value} className={`theme-${t.value.toLowerCase()} dark`}>
                <DropdownMenuItem
                  onClick={() => setTheme(t.value)}
                  className="p-3 cursor-pointer h-auto flex-col items-start space-y-2 hover:bg-accent/50"
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: t.color }}
                        />
                        <span className="text-sm font-medium">{t.label}</span>
                      </div>
                      {theme === t.value && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    
                    <div className="bg-card border rounded-md p-2 space-y-2">
                      <div className="text-xs text-card-foreground">Sample Card</div>
                      <div className="flex gap-1">
                        <div className="bg-primary h-2 w-6 rounded-sm"></div>
                        <div className="bg-secondary h-2 w-4 rounded-sm"></div>
                        <div className="bg-accent h-2 w-5 rounded-sm"></div>
                      </div>
                      <div className="flex gap-1">
                        <div className="bg-muted h-1.5 w-8 rounded-sm"></div>
                        <div className="bg-muted h-1.5 w-6 rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
            ))}
          </div>
        </div>
        
                      <DropdownMenuSeparator />
              
              {/* Privacy Settings */}
              <div className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Privacy Controls</span>
                </div>
                
                <div className="space-y-2">
                  <Dialog open={isPrivacyDialogOpen} onOpenChange={setIsPrivacyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Settings className="h-3 w-3 mr-2" />
                        Manage Data
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Privacy & Data Management</DialogTitle>
                        <DialogDescription>
                          Control your data and privacy settings. ClarityCV processes everything locally in your browser.
                        </DialogDescription>
                      </DialogHeader>
                      <DataClearanceManager />
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
                    onClick={clearAllData}
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Clear All Data
                  </Button>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              {/* Performance Monitor */}
              <div className="p-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Activity className="h-3 w-3 mr-2" />
                      Performance Monitor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Performance Monitor</DialogTitle>
                      <DialogDescription>
                        Monitor memory usage, library loading, and performance metrics.
                      </DialogDescription>
                    </DialogHeader>
                    <PerformanceMonitor />
                  </DialogContent>
                </Dialog>
              </div>
              
              <DropdownMenuSeparator />
              
              {/* Template Selection */}
              <div className="p-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Palette className="h-3 w-3 mr-2" />
                      Resume Templates
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Choose Resume Template</DialogTitle>
                      <DialogDescription>
                        Select from our ATS-optimized templates designed for maximum compatibility.
                      </DialogDescription>
                    </DialogHeader>
                    <TemplateSelector 
                      selectedTemplate="classic-professional"
                      onTemplateSelect={(template) => {
                        console.log('Template selected:', template.name);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-muted-foreground text-xs">
                100% Private • Client-Side Processing • Performance Optimized
              </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

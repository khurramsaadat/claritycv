"use client";

import { Settings, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./ThemeProvider";

export function SettingsDropdown() {
  const { theme, setTheme, themes } = useTheme();

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
        <DropdownMenuItem className="text-muted-foreground text-xs">
          More settings coming soon...
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

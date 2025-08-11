"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Theme, themes } from "@/lib/themes";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { value: Theme; label: string; color: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("stone");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated and load theme from localStorage
    setIsHydrated(true);
    
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme && themes.some(t => t.value === savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Only apply theme changes after hydration
    if (!isHydrated) return;
    
    // Apply theme to document
    const root = document.documentElement;
    
    // Remove all theme classes
    themes.forEach(t => {
      root.classList.remove(`theme-${t.value}`);
    });
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);
    
    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme, isHydrated]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

// localStorage key where the user's theme choice is saved
const THEME_KEY = "equipora-theme";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  // Avoid hydration mismatch: only show the real state after mounting
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);

    // The ".dark" class on <html> is what activates dark styles in globals.css
    document.documentElement.classList.toggle("dark", nextIsDark);
    localStorage.setItem(THEME_KEY, nextIsDark ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative flex h-8 w-14 items-center rounded-full border bg-muted px-1 transition-colors hover:border-ring"
    >
      {/* Sliding knob */}
      <span
        className={`absolute h-6 w-6 rounded-full bg-primary transition-transform ${
          mounted && isDark ? "translate-x-6" : "translate-x-0"
        }`}
      />
      <Sun className="relative z-10 ml-auto h-4 w-4 text-muted-foreground" />
      <Moon className="relative z-10 mr-auto h-4 w-4 text-muted-foreground" />
    </button>
  );
}

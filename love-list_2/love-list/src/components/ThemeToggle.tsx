"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "love-list-theme";

function readStoredTheme(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "dark";
  } catch {
    return false;
  }
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(readStoredTheme);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute(
      "data-theme",
      next ? "dark" : "light"
    );
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // localStorage unavailable — theme just won't persist across visits.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle cozy night mode"
      className="w-9 h-9 rounded-full bg-white border border-blush-deep flex items-center justify-center text-ink-soft"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

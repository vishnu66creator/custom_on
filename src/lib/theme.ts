import { useState, useEffect } from "react";
import { updateCustomerTheme } from "./db/app-service";

export function getTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function toggleTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const isDark = document.documentElement.classList.toggle("dark");
  void updateCustomerTheme({ data: { theme: isDark ? "dark" : "light" } }).catch(() => {
    // Anonymous visitors can still use the theme for the current session.
  });
  window.dispatchEvent(new Event("customon:theme-change"));
  return isDark ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTheme(getTheme());

    const handleThemeChange = () => {
      setTheme(getTheme());
    };
    window.addEventListener("customon:theme-change", handleThemeChange);
    return () => {
      window.removeEventListener("customon:theme-change", handleThemeChange);
    };
  }, []);

  return {
    theme,
    isDark: theme === "dark",
    toggle: toggleTheme,
  };
}

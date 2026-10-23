import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0D1B2A",     // Deep Navy
        secondary: "#293241",   // Slate
        success: "#2A9D8F",     // Teal Success
        alert: "#F4A261",       // Warning Ochre
        critical: "#E63946",    // Emergency Crimson
        surface: "#F8FAFC",     // Light surface
        background: "#0B1220",  // Dark background
        card: {
          light: "#FFFFFF",
          dark: "#111B2E"
        },
        border: {
          light: "#E2E8F0",
          dark: "#1E293B"
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      boxShadow: {
        'spatial-sm': "0 2px 8px -2px rgba(13, 27, 42, 0.08), 0 1px 4px -1px rgba(13, 27, 42, 0.04)",
        'spatial-md': "0 8px 24px -4px rgba(13, 27, 42, 0.12), 0 4px 12px -2px rgba(13, 27, 42, 0.06)",
        'spatial-lg': "0 16px 36px -6px rgba(13, 27, 42, 0.18), 0 6px 16px -3px rgba(13, 27, 42, 0.08)",
        'glass': "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
      }
    },
  },
  plugins: [],
};

export default config;

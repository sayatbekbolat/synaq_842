import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",        // Pure white - maximum readability
        surface: "#f8f9fa",           // Very light gray for cards
        "surface-elevated": "#e9ecef", // Light gray for elevation
        foreground: "#212529",        // Dark gray text (high contrast)
        "foreground-muted": "#6c757d", // Medium gray for secondary text
        lime: {
          DEFAULT: "#4CAF50",         // Material Green (readable, friendly)
          glow: "#66BB6A",           // Lighter green
          dark: "#388E3C",           // Darker green
        },
        accent: "#2196F3",           // Material Blue (clear, readable)
        danger: "#f44336",           // Material Red (clear warning)
        success: "#4CAF50",          // Same as lime for consistency
        warning: "#FF9800",          // Material Orange (visible warning)
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "fade-in": "fade-in 0.3s ease-in",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 20px rgba(76, 175, 80, 0.3)",
          },
          "50%": {
            opacity: "0.8",
            boxShadow: "0 0 40px rgba(76, 175, 80, 0.5)",
          },
        },
        "slide-up": {
          "0%": {
            transform: "translateY(20px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;

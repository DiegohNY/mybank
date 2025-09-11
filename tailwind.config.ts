import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Professional Banking Color Palette
        primary: {
          navy: "#1e3a8a",
          teal: "#0f766e",
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#1e3a8a",
          700: "#0f766e",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        secondary: {
          emerald: "#059669",
          gold: "#f59e0b",
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#059669",
          600: "#f59e0b",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        neutral: {
          charcoal: "#374151",
          light: "#f8fafc",
          white: "#ffffff",
        },
        accent: {
          blue: "#3b82f6",
          amber: "#fbbf24",
        },
        // Extended color system for banking UI
        banking: {
          success: "#059669",
          warning: "#f59e0b",
          error: "#dc2626",
          info: "#3b82f6",
          deposit: "#059669",
          withdrawal: "#dc2626",
          transfer: "#3b82f6",
          premium: "#f59e0b",
        },
        // Dark mode colors
        dark: {
          primary: "#1e293b",
          secondary: "#0f172a",
          text: "#e2e8f0",
          muted: "#64748b",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      fontSize: {
        "2xs": "0.625rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
        "6xl": "3.75rem",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        banking: "0 10px 25px rgba(30, 58, 138, 0.08)",
        "banking-lg": "0 20px 40px rgba(30, 58, 138, 0.12)",
        "banking-xl": "0 25px 50px rgba(30, 58, 138, 0.16)",
        premium: "0 10px 25px rgba(245, 158, 11, 0.2)",
        success: "0 4px 14px rgba(5, 150, 105, 0.15)",
        error: "0 4px 14px rgba(220, 38, 38, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;

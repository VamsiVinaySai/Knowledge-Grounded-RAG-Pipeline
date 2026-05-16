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
        // Base palette — deep charcoal editorial
        canvas: {
          DEFAULT: "#0B0D10",
          50: "#12151A",
          100: "#1A1E26",
          200: "#242933",
          300: "#2E3441",
        },
        ink: {
          DEFAULT: "#E8E3DA",
          muted: "#9A9690",
          faint: "#4A4845",
        },
        // Warm amber accent
        amber: {
          DEFAULT: "#D4A853",
          light: "#E8C07A",
          dark: "#A8823E",
          glow: "rgba(212,168,83,0.15)",
        },
        // Semantic
        success: "#4ADE80",
        warning: "#FCD34D",
        danger: "#F87171",
        info: "#60A5FA",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Menlo", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
      },
      spacing: {
        sidebar: "260px",
        "sidebar-collapsed": "64px",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(232,227,218,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(232,227,218,0.03) 1px, transparent 1px)",
        "amber-glow":
          "radial-gradient(ellipse at center, rgba(212,168,83,0.12) 0%, transparent 70%)",
        "canvas-gradient":
          "linear-gradient(135deg, #0B0D10 0%, #12151A 50%, #0D0F13 100%)",
      },
      backgroundSize: {
        "grid-size": "40px 40px",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "slide-in-left": "slideInLeft 0.3s ease-out forwards",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 1.5s infinite",
        typing: "typing 1.2s steps(3) infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        typing: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "1" },
        },
      },
      boxShadow: {
        amber: "0 0 40px rgba(212,168,83,0.15)",
        "amber-sm": "0 0 16px rgba(212,168,83,0.1)",
        panel: "0 0 0 1px rgba(232,227,218,0.06), 0 8px 32px rgba(0,0,0,0.4)",
        "panel-hover":
          "0 0 0 1px rgba(232,227,218,0.1), 0 12px 40px rgba(0,0,0,0.5)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;

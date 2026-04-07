import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "aurora-1": "aurora1 20s ease-in-out infinite",
        "aurora-2": "aurora2 25s ease-in-out infinite",
        "aurora-3": "aurora3 30s ease-in-out infinite",
        "float-1": "float1 8s ease-in-out infinite",
        "float-2": "float2 12s ease-in-out infinite",
        "float-3": "float3 10s ease-in-out infinite",
      },
      keyframes: {
        aurora1: {
          "0%, 100%": { transform: "translateX(-50%) translateY(0px) scale(1)" },
          "33%": { transform: "translateX(-45%) translateY(30px) scale(1.05)" },
          "66%": { transform: "translateX(-55%) translateY(-20px) scale(0.95)" },
        },
        aurora2: {
          "0%, 100%": { transform: "translateY(0px) scale(1)", opacity: "1" },
          "50%": { transform: "translateY(40px) scale(1.1)", opacity: "0.7" },
        },
        aurora3: {
          "0%, 100%": { transform: "translateY(0px) scale(1)", opacity: "0.8" },
          "50%": { transform: "translateY(-30px) scale(1.08)", opacity: "1" },
        },
        float1: {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "25%": { transform: "translateY(-20px) translateX(10px)" },
          "50%": { transform: "translateY(-5px) translateX(-8px)" },
          "75%": { transform: "translateY(-25px) translateX(5px)" },
        },
        float2: {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "33%": { transform: "translateY(-15px) translateX(-12px)" },
          "66%": { transform: "translateY(10px) translateX(8px)" },
        },
        float3: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-18px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

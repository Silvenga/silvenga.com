import type { Config } from "tailwindcss";
import DaisyUI from "daisyui"
import Typography from "@tailwindcss/typography";

export default {
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#e0783e",
          "secondary": "#ad5c2f",
          "accent": "#633429",
          "neutral": "#f8f8f8",
          "base-100": "#ffff",
          "info": "#82b1ff",
          "success": "#4ade80",
          "warning": "#ffeb3b",
          "error": "#ef4444",
        }
      },
      "dark"
    ]
  },
  content: [
    // TODO, maybe not the src directory. Not sure if matters.
    // "./src/**/*.{html,js,ts,jsx,tsx}",
    "./.cache/eleventy/**/*.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter Variable", "sans-serif"],
      },
    },
  },
  plugins: [
    DaisyUI,
    Typography
  ],
} satisfies Config

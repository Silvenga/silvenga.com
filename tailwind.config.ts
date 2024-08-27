import type { Config } from "tailwindcss";
import Typography from "@tailwindcss/typography";
import HighlightJs from "tailwind-highlightjs";

export default {
  content: [
    // TODO, maybe not the src directory. Not sure if matters.
    // "./src/**/*.{html,js,ts,jsx,tsx}",
    "./.cache/eleventy/**/*.html",
  ],
  darkMode: ["variant", [
    "@media (prefers-color-scheme: dark) { &:not(.light, .light *) }",
    "&:is(.dark, .dark *)",
  ]],
  theme: {
    hljs: {
      theme: "github-dark-dimmed",
    },
    extend: {
      fontFamily: {
        sans: [
          // Loaded
          "Inter Variable",
          // Fallback
          "Inter", "Roboto", "Helvetica Neue", "Arial Nova", "Nimbus Sans", "Arial", "sans-serif",
          // Emotes
          "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"
        ],
      },
    },
  },
  plugins: [
    Typography,
    HighlightJs
  ],
} satisfies Config

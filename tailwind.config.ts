import type { Config } from "tailwindcss";
import Typography from "@tailwindcss/typography";

export default {
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
    Typography
  ],
} satisfies Config

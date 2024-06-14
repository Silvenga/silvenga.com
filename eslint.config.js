// @ts-check

import "eslint-plugin-only-warn";

import eslint from "@eslint/js";
import reactJsxRuntime from "eslint-plugin-react/configs/jsx-runtime.js"
import reactRecommended from "eslint-plugin-react/configs/recommended.js"
import typeScriptEslint from "typescript-eslint";

export default typeScriptEslint.config(
  eslint.configs.recommended,
  ...typeScriptEslint.configs.recommendedTypeChecked,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    ...reactRecommended,
    ...reactJsxRuntime, // Ignore react-in-jsx-scope warnings.
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "quotes": "warn",
      "default-case": "warn",
      "require-await": "warn",
    }
  },
  {
    ignores: ["src/.obsidian/plugins/**/*.js"],
  },
);

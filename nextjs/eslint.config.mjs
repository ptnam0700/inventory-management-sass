import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow unused vars in API route parameters (common pattern)
      "@typescript-eslint/no-unused-vars": [
        "error",
        { 
          "args": "after-used",
          "varsIgnorePattern": "^_",
          "argsIgnorePattern": "^_|request|context"
        }
      ],
      // Allow @ts-ignore and @ts-nocheck for Supabase type issues
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": "allow-with-description",
          "ts-nocheck": "allow-with-description"
        }
      ]
    }
  }
];

export default eslintConfig;

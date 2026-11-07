import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vrais dossiers derrière les liens .next / node_modules (astuce iCloud)
    "*.nosync/**",
    // Doublons créés par iCloud (« node_modules 2 »...)
    "node_modules */**",
  ]),
]);

export default eslintConfig;

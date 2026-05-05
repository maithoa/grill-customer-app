import { defineConfig, globalIgnores } from 'eslint/config';
import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import nextVitals from 'eslint-config-next/core-web-vitals.js';
import nextTypeScript from 'eslint-config-next/typescript.js';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

export default defineConfig([
  ...compat.config(nextVitals),
  ...compat.config(nextTypeScript),
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'coverage/**',
    'node_modules/**',
    '.serverless/**',
    '**/.serverless/**',
    'next-env.d.ts',
  ]),
]);
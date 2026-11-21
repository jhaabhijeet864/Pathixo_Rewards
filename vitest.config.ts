import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts', 'apps/**/*.test.ts', 'packages/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/.wxt/**',
        '**/.output/**',
        '**/.next/**',
        '**/dist/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@pathixo/shared': path.resolve(__dirname, 'packages/shared/src/index.ts'),
      '~': path.resolve(__dirname, 'apps/extension'),
      '@': path.resolve(__dirname, 'apps/web'),
    },
  },
});

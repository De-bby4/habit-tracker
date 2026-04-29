import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    tsconfig: './tests/tsconfig.json',
    include: [
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.tsx',
    ],
    exclude: [
      'tests/e2e/**',
      'node_modules/**',
      '.next/**',
    ],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**'],
      exclude: ['src/lib/**/*.d.ts'],
      thresholds: { lines: 80 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.js'],
    include: ['src/**/*.test.js'],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});

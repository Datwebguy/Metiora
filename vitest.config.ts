import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: [
      { find: /^@core\/(.*)\.js$/, replacement: path.resolve(__dirname, './src/core/$1.ts') },
      { find: /^@core\/(.*)$/, replacement: path.resolve(__dirname, './src/core/$1') },
      { find: /^@memory\/(.*)\.js$/, replacement: path.resolve(__dirname, './src/memory/$1.ts') },
      { find: /^@memory\/(.*)$/, replacement: path.resolve(__dirname, './src/memory/$1') },
      { find: /^@shared\/(.*)\.js$/, replacement: path.resolve(__dirname, './src/shared/$1.ts') },
      { find: /^@shared\/(.*)$/, replacement: path.resolve(__dirname, './src/shared/$1') },
      { find: /^@config\/(.*)\.js$/, replacement: path.resolve(__dirname, './src/config/$1.ts') },
      { find: /^@config\/(.*)$/, replacement: path.resolve(__dirname, './src/config/$1') },
      { find: /^@storage\/(.*)\.js$/, replacement: path.resolve(__dirname, './src/storage/$1.ts') },
      { find: /^@storage\/(.*)$/, replacement: path.resolve(__dirname, './src/storage/$1') },
    ],
  },
});

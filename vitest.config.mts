import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    // WHY: jsdom環境を使用
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'dist', 'build', 'e2e/**'],
    // WHY: テストタイムアウトを5秒に設定（DOM操作やasync処理が多いため）
    testTimeout: 5000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.{ts,js}',
        '**/*.d.ts',
        '**/types/',
        '.next/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // WHY: Next.jsのImageコンポーネントをテスト用モックに置き換え
      'next/image': resolve(__dirname, './tests/__mocks__/next-image.tsx'),
    },
  },
});

import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E テスト設定
 *
 * WHY: Next.js アプリケーションのE2Eテストを実行するための設定
 * 開発サーバー（localhost:3000）に対してテストを実行する
 */
export default defineConfig({
  // テストディレクトリ
  testDir: './e2e',

  // タイムアウト設定
  timeout: 30000,
  expect: {
    timeout: 5000,
  },

  // WHY: テストは並列実行せず、順番に実行
  // localStorageの状態が干渉しないようにするため
  fullyParallel: false,
  workers: 1,

  // テスト失敗時のリトライ回数
  retries: process.env.CI ? 2 : 0,

  // レポーター設定
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
  ],

  use: {
    // ベースURL
    baseURL: 'http://localhost:3000',

    // トレース設定（デバッグ用）
    trace: 'on-first-retry',

    // スクリーンショット設定
    screenshot: 'only-on-failure',
  },

  // テストするブラウザ設定
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // WHY: 必要に応じて他のブラウザも追加可能
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // WHY: テスト実行前に開発サーバーを起動
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});

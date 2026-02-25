import { test, expect } from '@playwright/test';

/**
 * 基本的なE2Eテスト
 *
 * WHY: アプリケーションの主要な機能が動作することを確認
 */
test.describe('SubsCheck Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // WHY: 各テスト前にlocalStorageをクリアして初期状態にする
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display page title', async ({ page }) => {
    await page.goto('/');

    // WHY: ページタイトルが表示されているか確認
    await expect(page).toHaveTitle(/SubsCheck/i);
  });

  test('should display main heading', async ({ page }) => {
    await page.goto('/');

    // WHY: メインの見出しが表示されているか確認
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('should display subscription categories', async ({ page }) => {
    await page.goto('/');

    // WHY: カテゴリヘッダーが表示されているか確認
    // アコーディオンのヘッダーを探す
    await expect(page.locator('text=動画配信').first()).toBeVisible();
  });

  test('should display initial total as zero', async ({ page }) => {
    await page.goto('/');

    // WHY: 初期状態では合計が0円（最初の¥0を取得）
    await expect(page.locator('text=¥0').first()).toBeVisible();
  });

  test('should have share buttons', async ({ page }) => {
    await page.goto('/');

    // WHY: シェアボタンが存在する（初期状態では無効）
    const shareButtons = page.getByRole('button', { name: /シェア|ダウンロード|コピー/i });
    await expect(shareButtons.first()).toBeVisible();
  });

  test('should display custom subscription add button', async ({ page }) => {
    await page.goto('/');

    // WHY: カスタムサブスク追加ボタンが表示される
    await expect(page.getByText(/カスタムサブスクを追加/i)).toBeVisible();
  });
});

test.describe('Subscription Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should select subscription when tag is clicked', async ({ page }) => {
    await page.goto('/');

    // WHY: サブスクタグをクリック
    const tags = page.getByRole('button').filter({ hasText: /Netflix|Spotify|Amazon/i });
    const firstTag = tags.first();

    await firstTag.click();

    // WHY: RECEIPTエリアに選択したサブスクが表示される
    const receiptArea = page.locator('.font-receipt, [class*="receipt"]');
    await expect(receiptArea.first()).toBeVisible();
  });

  test('should persist selection after page reload', async ({ page }) => {
    await page.goto('/');

    // WHY: サブスクを選択
    const tags = page.getByRole('button').filter({ hasText: /Netflix|Spotify|Amazon/i });
    await tags.first().click();

    // WHY: 合計金額を記録
    const totalText = await page.getByText(/¥[1-9]/).first().textContent();

    // WHY: ページをリロード
    await page.reload();

    // WHY: 選択状態が保持されている
    await expect(page.getByText(totalText || '')).toBeVisible();
  });
});

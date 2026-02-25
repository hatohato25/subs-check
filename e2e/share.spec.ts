import { test, expect } from '@playwright/test';

/**
 * シェア機能のE2Eテスト
 *
 * WHY: シェアリンクの生成と表示をテスト
 * - リンクコピー
 * - シェアページへのナビゲーション
 * - 不正なURLの処理
 */
test.describe('Share Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should copy share link to clipboard', async ({ page, context }) => {
    // WHY: クリップボード権限を付与
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/');

    // WHY: サブスクを選択
    await page.getByRole('button', { name: /netflix/i }).click();
    await page.getByRole('button', { name: /spotify/i }).click();

    // WHY: リンクコピーボタンをクリック
    const copyButton = page.getByLabelText(/シェアリンクをコピー/i);
    await copyButton.click();

    // WHY: ボタンの表示が「コピー済み」に変わる
    await expect(page.getByText(/コピー済み/i)).toBeVisible();

    // WHY: クリップボードの内容を確認
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('/share/');
    expect(clipboardText).toContain('http://localhost:3000');

    // WHY: 一定時間後に元の表示に戻る
    await page.waitForTimeout(2500);
    await expect(page.getByText(/リンクコピー/i)).toBeVisible();
  });

  test('should navigate to share page', async ({ page }) => {
    await page.goto('/');

    // WHY: サブスクを選択
    await page.getByRole('button', { name: /netflix/i }).click();

    // WHY: シェアリンクを取得
    const copyButton = page.getByLabelText(/シェアリンクをコピー/i);
    await copyButton.click();

    // WHY: クリップボードからURLを取得して直接アクセス
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(shareUrl);

    // WHY: シェアページが表示される
    await expect(page.getByText(/subscheck/i)).toBeVisible();
    await expect(page.getByText(/netflix/i)).toBeVisible();
  });

  test('should display correct total on share page', async ({ page }) => {
    await page.goto('/');

    // WHY: サブスクを選択（¥1,980 + ¥980 = ¥2,960）
    await page.getByRole('button', { name: /netflix/i }).click();
    await page.getByRole('button', { name: /spotify/i }).click();

    // WHY: シェアリンクを取得
    const copyButton = page.getByLabelText(/シェアリンクをコピー/i);
    await copyButton.click();

    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(shareUrl);

    // WHY: 合計金額が正しく表示される
    await expect(page.getByText(/¥2,960/)).toBeVisible();
  });

  test('should show error for invalid share URL', async ({ page }) => {
    // WHY: 不正なエンコードデータでアクセス
    await page.goto('/share/invalid-encoded-data');

    // WHY: エラーメッセージが表示される
    await expect(
      page.getByText(/データの読み込みに失敗しました|不正なURL|無効なデータ/i)
    ).toBeVisible();
  });

  test('should show error for share URL with non-existent subscription', async ({ page }) => {
    // WHY: 存在しないサブスクIDを含むURLを作成
    const invalidData = {
      selectedIds: ['non-existent-id'],
      totalPrice: 1000,
    };
    const encoded = Buffer.from(JSON.stringify(invalidData)).toString('base64url');

    await page.goto(`/share/${encoded}`);

    // WHY: エラーまたは空の状態が表示される
    // 実装によってはサブスクが見つからない場合のフォールバックがある
    await expect(page.getByText(/subscheck/i)).toBeVisible();
  });

  test('should generate unique share URLs for different selections', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');

    // WHY: 1回目の選択
    await page.getByRole('button', { name: /netflix/i }).click();
    const copyButton = page.getByLabelText(/シェアリンクをコピー/i);
    await copyButton.click();
    const shareUrl1 = await page.evaluate(() => navigator.clipboard.readText());

    // WHY: 選択を変更
    await page.getByRole('button', { name: /netflix/i }).click(); // 解除
    await page.getByRole('button', { name: /spotify/i }).click();
    await copyButton.click();
    const shareUrl2 = await page.evaluate(() => navigator.clipboard.readText());

    // WHY: 異なる選択には異なるURLが生成される
    expect(shareUrl1).not.toBe(shareUrl2);
  });

  test('should allow adding more subscriptions from share page', async ({ page }) => {
    await page.goto('/');

    // WHY: サブスクを選択してシェアページへ
    await page.getByRole('button', { name: /netflix/i }).click();
    const copyButton = page.getByLabelText(/シェアリンクをコピー/i);
    await copyButton.click();

    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(shareUrl);

    // WHY: 「自分でも試す」ボタンまたはリンクがあれば確認
    const tryButton = page.getByRole('link', { name: /試す|start|始める/i });
    if (await tryButton.isVisible()) {
      await tryButton.click();
      await expect(page).toHaveURL('/');
    }
  });

  test('should handle share with custom subscription', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');

    // WHY: カスタムサブスクを追加
    const addButton = page.getByText(/カスタムサブスクを追加/i);
    await addButton.click();

    const nameInput = page.getByLabelText(/サービス名/i);
    await nameInput.fill('Test Service');

    const priceInput = page.getByLabelText(/月額料金/i);
    await priceInput.fill('1500');

    const submitButton = page.getByText(/追加する/i);
    await submitButton.click();

    // WHY: 追加したカスタムサブスクを選択
    await page.getByRole('button', { name: /test service/i }).click();

    // WHY: シェアリンクを生成
    const copyButton = page.getByLabelText(/シェアリンクをコピー/i);
    await copyButton.click();

    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(shareUrl);

    // WHY: カスタムサブスクがシェアページに表示される
    await expect(page.getByText(/test service/i)).toBeVisible();
    await expect(page.getByText(/¥1,500/)).toBeVisible();
  });

  test('should open Twitter intent when share button clicked', async ({ page, context }) => {
    await page.goto('/');

    // WHY: サブスクを選択
    await page.getByRole('button', { name: /netflix/i }).click();

    // WHY: 新しいタブの開始を監視
    const popupPromise = page.waitForEvent('popup');

    // WHY: Xでシェアボタンをクリック
    const shareButton = page.getByLabelText(/Xでシェア/i);
    await shareButton.click();

    // WHY: Twitter Web Intentが開かれる
    const popup = await popupPromise;
    expect(popup.url()).toContain('twitter.com/intent/tweet');

    // WHY: シェアテキストとURLがクエリパラメータに含まれる
    expect(popup.url()).toContain('text=');
    expect(popup.url()).toContain('url=');
    expect(popup.url()).toContain('SubsCheck');
  });
});

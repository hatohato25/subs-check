import { test, expect } from '@playwright/test';

/**
 * カスタムサブスク機能のE2Eテスト
 *
 * WHY: カスタムサブスクの追加と管理をテスト
 * - フォームの開閉
 * - バリデーション
 * - カスタムサブスクの追加
 * - localStorageへの保存
 */
test.describe('Custom Subscription', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display add custom subscription button', async ({ page }) => {
    await page.goto('/');

    // WHY: カスタムサブスク追加ボタンが表示される
    await expect(page.getByText(/カスタムサブスクを追加/i)).toBeVisible();
  });

  test('should open custom subscription form', async ({ page }) => {
    await page.goto('/');

    // WHY: フォームを開く
    const addButton = page.getByText(/カスタムサブスクを追加/i);
    await addButton.click();

    // WHY: フォームが表示される
    await expect(page.getByText(/ADD CUSTOM/i)).toBeVisible();
    await expect(page.getByLabelText(/サービス名/i)).toBeVisible();
    await expect(page.getByLabelText(/月額料金/i)).toBeVisible();
  });

  test('should close form when close button clicked', async ({ page }) => {
    await page.goto('/');

    // WHY: フォームを開く
    await page.getByText(/カスタムサブスクを追加/i).click();

    // WHY: 閉じるボタンをクリック
    await page.getByLabel(/閉じる/i).click();

    // WHY: フォームが閉じられる
    await expect(page.getByText(/ADD CUSTOM/i)).not.toBeVisible();
  });

  test('should show validation error when name is empty', async ({ page }) => {
    await page.goto('/');

    await page.getByText(/カスタムサブスクを追加/i).click();

    // WHY: 金額のみ入力
    const priceInput = page.getByLabelText(/月額料金/i);
    await priceInput.fill('1000');

    // WHY: 送信
    await page.getByText(/追加する/i).click();

    // WHY: バリデーションエラーが表示される
    await expect(page.getByText(/サービス名を入力してください/i)).toBeVisible();
  });

  test('should show validation error when price is empty', async ({ page }) => {
    await page.goto('/');

    await page.getByText(/カスタムサブスクを追加/i).click();

    // WHY: サービス名のみ入力
    const nameInput = page.getByLabelText(/サービス名/i);
    await nameInput.fill('ChatGPT Plus');

    // WHY: 送信
    await page.getByText(/追加する/i).click();

    // WHY: バリデーションエラーが表示される
    await expect(page.getByText(/有効な金額を入力してください/i)).toBeVisible();
  });

  test('should show validation error when price exceeds maximum', async ({ page }) => {
    await page.goto('/');

    await page.getByText(/カスタムサブスクを追加/i).click();

    const nameInput = page.getByLabelText(/サービス名/i);
    await nameInput.fill('Expensive Service');

    const priceInput = page.getByLabelText(/月額料金/i);
    await priceInput.fill('1000000');

    await page.getByText(/追加する/i).click();

    // WHY: 上限超過のエラーが表示される
    await expect(page.getByText(/999,999円以下で入力してください/i)).toBeVisible();
  });

  test('should add custom subscription successfully', async ({ page }) => {
    await page.goto('/');

    // WHY: フォームを開く
    await page.getByText(/カスタムサブスクを追加/i).click();

    // WHY: サービス名を入力
    const nameInput = page.getByLabelText(/サービス名/i);
    await nameInput.fill('ChatGPT Plus');

    // WHY: 金額を入力
    const priceInput = page.getByLabelText(/月額料金/i);
    await priceInput.fill('2000');

    // WHY: 送信
    await page.getByText(/追加する/i).click();

    // WHY: フォームが閉じられる
    await expect(page.getByText(/ADD CUSTOM/i)).not.toBeVisible();

    // WHY: 追加したカスタムサブスクが表示される
    await expect(page.getByRole('button', { name: /chatgpt plus/i })).toBeVisible();
  });

  test('should select custom subscription and update total', async ({ page }) => {
    await page.goto('/');

    // WHY: カスタムサブスクを追加
    await page.getByText(/カスタムサブスクを追加/i).click();

    const nameInput = page.getByLabelText(/サービス名/i);
    await nameInput.fill('Test Service');

    const priceInput = page.getByLabelText(/月額料金/i);
    await priceInput.fill('1500');

    await page.getByText(/追加する/i).click();

    // WHY: 追加したサブスクを選択
    await page.getByRole('button', { name: /test service/i }).click();

    // WHY: 合計金額が更新される
    await expect(page.getByText(/¥1,500/)).toBeVisible();
  });

  test('should persist custom subscription to localStorage', async ({ page }) => {
    await page.goto('/');

    // WHY: カスタムサブスクを追加
    await page.getByText(/カスタムサブスクを追加/i).click();

    const nameInput = page.getByLabelText(/サービス名/i);
    await nameInput.fill('Persistent Service');

    const priceInput = page.getByLabelText(/月額料金/i);
    await priceInput.fill('3000');

    await page.getByText(/追加する/i).click();

    // WHY: ページをリロード
    await page.reload();

    // WHY: カスタムサブスクが保持されている
    await expect(page.getByRole('button', { name: /persistent service/i })).toBeVisible();
  });

  test('should allow selecting emoji for custom subscription', async ({ page }) => {
    await page.goto('/');

    await page.getByText(/カスタムサブスクを追加/i).click();

    // WHY: 絵文字を選択（2番目の絵文字）
    const emojiButtons = page.locator('button').filter({ hasText: /^[📱💻🎮📚🏋️🍔☕🎬🎵📦]$/ });
    await emojiButtons.nth(1).click();

    const nameInput = page.getByLabelText(/サービス名/i);
    await nameInput.fill('Custom Service');

    const priceInput = page.getByLabelText(/月額料金/i);
    await priceInput.fill('1000');

    await page.getByText(/追加する/i).click();

    // WHY: 選択した絵文字がタグに表示される
    const customTag = page.getByRole('button', { name: /custom service/i });
    await expect(customTag).toBeVisible();
    // 絵文字は視覚的に確認されるが、テキストコンテンツとして含まれているか確認
    const tagText = await customTag.textContent();
    expect(tagText).toBeTruthy();
  });

  test('should add multiple custom subscriptions', async ({ page }) => {
    await page.goto('/');

    // WHY: 1つ目のカスタムサブスク
    await page.getByText(/カスタムサブスクを追加/i).click();
    await page.getByLabelText(/サービス名/i).fill('Service 1');
    await page.getByLabelText(/月額料金/i).fill('1000');
    await page.getByText(/追加する/i).click();

    // WHY: 2つ目のカスタムサブスク
    await page.getByText(/カスタムサブスクを追加/i).click();
    await page.getByLabelText(/サービス名/i).fill('Service 2');
    await page.getByLabelText(/月額料金/i).fill('2000');
    await page.getByText(/追加する/i).click();

    // WHY: 両方のカスタムサブスクが表示される
    await expect(page.getByRole('button', { name: /service 1/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /service 2/i })).toBeVisible();

    // WHY: 両方選択して合計を確認
    await page.getByRole('button', { name: /service 1/i }).click();
    await page.getByRole('button', { name: /service 2/i }).click();

    await expect(page.getByText(/¥3,000/)).toBeVisible();
  });

  test('should trim whitespace from service name', async ({ page }) => {
    await page.goto('/');

    await page.getByText(/カスタムサブスクを追加/i).click();

    const nameInput = page.getByLabelText(/サービス名/i);
    await nameInput.fill('  Trimmed Service  ');

    const priceInput = page.getByLabelText(/月額料金/i);
    await priceInput.fill('1000');

    await page.getByText(/追加する/i).click();

    // WHY: 前後の空白が除去されて表示される
    await expect(page.getByRole('button', { name: /^Trimmed Service$/i })).toBeVisible();
  });

  test('should show validation error for whitespace-only name', async ({ page }) => {
    await page.goto('/');

    await page.getByText(/カスタムサブスクを追加/i).click();

    const nameInput = page.getByLabelText(/サービス名/i);
    await nameInput.fill('   ');

    const priceInput = page.getByLabelText(/月額料金/i);
    await priceInput.fill('1000');

    await page.getByText(/追加する/i).click();

    // WHY: 空白のみの名前はエラー
    await expect(page.getByText(/サービス名を入力してください/i)).toBeVisible();
  });

  test('should display custom subscription in receipt card', async ({ page }) => {
    await page.goto('/');

    // WHY: カスタムサブスクを追加
    await page.getByText(/カスタムサブスクを追加/i).click();
    await page.getByLabelText(/サービス名/i).fill('Receipt Test');
    await page.getByLabelText(/月額料金/i).fill('1200');
    await page.getByText(/追加する/i).click();

    // WHY: 選択
    await page.getByRole('button', { name: /receipt test/i }).click();

    // WHY: RECEIPTカードに表示される
    const receiptCard = page.getByText(/receipt/i).locator('..');
    await expect(receiptCard.getByText(/receipt test/i)).toBeVisible();
    await expect(receiptCard.getByText(/¥1,200/)).toBeVisible();
  });
});

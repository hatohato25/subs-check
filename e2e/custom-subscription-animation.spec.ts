import { test, expect } from '@playwright/test';

/**
 * カスタムサブスクのアニメーションに関するリグレッションテスト
 *
 * WHY: カスタムタグが1つ以上ある状態で、次のカスタムタグを作成しようとすると、
 * 既存のカスタムタグのサイズが一時的に大きくなる問題の防止
 */
test.describe('Custom Subscription Animation Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('existing custom tag should not change size when opening custom form', async ({
    page,
  }) => {
    // WHY: ページが完全に読み込まれるのを待つ
    await page.waitForLoadState('networkidle');

    // WHY: ハイドレーションが完了してコンテンツが表示されるのを待つ
    await expect(page.getByRole('heading', { name: /SUBSCHECK/i })).toBeVisible({ timeout: 10000 });

    // WHY: カスタムカテゴリが閉じている可能性があるため、開く
    const customCategory = page.locator('button[aria-controls="category-custom"]');
    const isExpanded = await customCategory.getAttribute('aria-expanded');
    if (isExpanded === 'false') {
      await customCategory.click();
    }

    // WHY: まず1つ目のカスタムサブスクを追加
    await page.getByText(/カスタムサブスクを追加/i).click();
    await page.locator('input[id="custom-name"]').fill('First Service');
    await page.locator('input[id="custom-price"]').fill('1000');
    await page.getByText(/追加する/i).click();

    // WHY: 追加されたカスタムタグが表示されるまで待機
    const firstTag = page.getByRole('button', { name: /first service/i });
    await expect(firstTag).toBeVisible();

    // WHY: アニメーションが完全に終了するまで待機（300ms + バッファ）
    await page.waitForTimeout(500);

    // WHY: 既存カスタムタグの初期サイズを記録
    const initialBoundingBox = await firstTag.boundingBox();
    expect(initialBoundingBox).not.toBeNull();

    if (!initialBoundingBox) {
      throw new Error('初期サイズの取得に失敗しました');
    }

    // WHY: 「カスタムサブスクを追加」ボタンをクリックしてフォームを開く
    await page.getByText(/カスタムサブスクを追加/i).click();

    // WHY: フォームが表示されることを確認
    await expect(page.getByText(/ADD CUSTOM/i)).toBeVisible();

    // WHY: フォームが開いた直後のサイズを確認
    const sizeAfterFormOpen = await firstTag.boundingBox();
    expect(sizeAfterFormOpen).not.toBeNull();

    if (!sizeAfterFormOpen) {
      throw new Error('フォーム開封後のサイズ取得に失敗しました');
    }

    // WHY: サイズが変わっていないことを確認（誤差1px以内を許容）
    expect(Math.abs(sizeAfterFormOpen.width - initialBoundingBox.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(sizeAfterFormOpen.height - initialBoundingBox.height)).toBeLessThanOrEqual(1);

    // WHY: アニメーション期間中もサイズが変わらないことを確認（300ms後）
    await page.waitForTimeout(300);

    const sizeAfterAnimation = await firstTag.boundingBox();
    expect(sizeAfterAnimation).not.toBeNull();

    if (!sizeAfterAnimation) {
      throw new Error('アニメーション後のサイズ取得に失敗しました');
    }

    expect(Math.abs(sizeAfterAnimation.width - initialBoundingBox.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(sizeAfterAnimation.height - initialBoundingBox.height)).toBeLessThanOrEqual(1);
  });

  test('multiple existing custom tags should not change size when opening custom form', async ({
    page,
  }) => {
    // WHY: ページが完全に読み込まれるのを待つ
    await page.waitForLoadState('networkidle');

    // WHY: ハイドレーションが完了してコンテンツが表示されるのを待つ
    await expect(page.getByRole('heading', { name: /SUBSCHECK/i })).toBeVisible({ timeout: 10000 });

    // WHY: カスタムカテゴリが閉じている可能性があるため、開く
    const customCategory = page.locator('button[aria-controls="category-custom"]');
    const isExpanded = await customCategory.getAttribute('aria-expanded');
    if (isExpanded === 'false') {
      await customCategory.click();
    }

    // WHY: 複数のカスタムサブスクを追加
    await page.getByText(/カスタムサブスクを追加/i).click();
    await page.locator('input[id="custom-name"]').fill('Service 1');
    await page.locator('input[id="custom-price"]').fill('1000');
    await page.getByText(/追加する/i).click();

    await page.getByText(/カスタムサブスクを追加/i).click();
    await page.locator('input[id="custom-name"]').fill('Service 2');
    await page.locator('input[id="custom-price"]').fill('2000');
    await page.getByText(/追加する/i).click();

    // WHY: タグが表示されるまで待機
    const tag1 = page.getByRole('button', { name: /service 1/i });
    const tag2 = page.getByRole('button', { name: /service 2/i });
    await expect(tag1).toBeVisible();
    await expect(tag2).toBeVisible();

    // WHY: アニメーションが完全に終了するまで待機
    await page.waitForTimeout(500);

    // WHY: 両方のタグの初期サイズを記録
    const tag1InitialBox = await tag1.boundingBox();
    const tag2InitialBox = await tag2.boundingBox();
    expect(tag1InitialBox).not.toBeNull();
    expect(tag2InitialBox).not.toBeNull();

    if (!tag1InitialBox || !tag2InitialBox) {
      throw new Error('初期サイズの取得に失敗しました');
    }

    // WHY: 3つ目のカスタムサブスクを追加するためにフォームを開く
    await page.getByText(/カスタムサブスクを追加/i).click();
    await expect(page.getByText(/ADD CUSTOM/i)).toBeVisible();

    // WHY: フォームが開いた後のサイズを確認
    const tag1AfterBox = await tag1.boundingBox();
    const tag2AfterBox = await tag2.boundingBox();
    expect(tag1AfterBox).not.toBeNull();
    expect(tag2AfterBox).not.toBeNull();

    if (!tag1AfterBox || !tag2AfterBox) {
      throw new Error('フォーム開封後のサイズ取得に失敗しました');
    }

    // WHY: 両方のタグのサイズが変わっていないことを確認
    expect(Math.abs(tag1AfterBox.width - tag1InitialBox.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(tag1AfterBox.height - tag1InitialBox.height)).toBeLessThanOrEqual(1);
    expect(Math.abs(tag2AfterBox.width - tag2InitialBox.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(tag2AfterBox.height - tag2InitialBox.height)).toBeLessThanOrEqual(1);
  });
});

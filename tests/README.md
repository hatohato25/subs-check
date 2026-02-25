# SubsCheck テストガイド

このドキュメントは SubsCheck プロジェクトのテストについて説明します。

## テストの種類

### 1. ユニットテスト (Vitest)

個々のコンポーネントと関数をテストします。

**テストファイル:**
- `tests/lib/` - ユーティリティ関数のテスト
  - `storage.test.ts` - localStorage操作
  - `format.test.ts` - フォーマット関数
  - `share.test.ts` - シェア機能
  - `subscription-utils.test.ts` - サブスク関連ユーティリティ
  - `utils.test.ts` - cn関数（classNames ユーティリティ）

- `tests/hooks/` - カスタムフックのテスト
  - `useSubscriptions.test.ts` - サブスク管理フック

- `tests/components/` - Reactコンポーネントのテスト
  - `TotalDisplay.test.tsx` - 合計表示コンポーネント
  - `SubscriptionTag.test.tsx` - サブスクタグ
  - `SubscriptionIcon.test.tsx` - アイコン表示
  - `SubscriptionIconNext.test.tsx` - Next.js Image対応アイコン
  - `ShareButton.test.tsx` - シェアボタン
  - `CustomSubscriptionForm.test.tsx` - カスタムサブスク追加フォーム

- `tests/app/` - ページのテスト
  - `share/share-page.test.ts` - シェアページ

**実行方法:**
```bash
# テストを実行（watch モード）
bun test

# テストを1回実行
bun test:run

# カバレッジ付きで実行
bun test:run --coverage
```

### 2. E2Eテスト (Playwright)

ブラウザを使用して実際のユーザー操作をシミュレートします。

**テストファイル:**
- `e2e/home.spec.ts` - トップページのテスト
  - サブスク選択
  - 合計金額計算
  - カテゴリアコーディオン
  - localStorage への保存

- `e2e/share.spec.ts` - シェア機能のテスト
  - リンクコピー
  - シェアページへのナビゲーション
  - Twitter Web Intent
  - 不正なURLの処理

- `e2e/custom-subscription.spec.ts` - カスタムサブスクのテスト
  - フォームの開閉
  - バリデーション
  - カスタムサブスクの追加
  - 絵文字選択

**実行方法:**
```bash
# E2Eテストを実行
bun test:e2e

# UIモードで実行（デバッグに便利）
bun test:e2e:ui

# ブラウザを表示して実行
bun test:e2e:headed
```

## セットアップ

### 初回セットアップ

1. **依存関係のインストール:**
   ```bash
   bun install
   ```

2. **Playwright ブラウザのインストール:**
   ```bash
   bunx playwright install
   ```

### テスト環境の確認

```bash
# Vitestのバージョン確認
bun vitest --version

# Playwrightのバージョン確認
bunx playwright --version
```

## テストの書き方

### ユニットテストの例

```typescript
import { describe, expect, it } from 'vitest';
import { formatPrice } from '@/lib/format';

describe('formatPrice', () => {
  it('should format price with comma separator', () => {
    expect(formatPrice(1000)).toBe('¥1,000');
    expect(formatPrice(10000)).toBe('¥10,000');
  });
});
```

### E2Eテストの例

```typescript
import { test, expect } from '@playwright/test';

test('should select subscription and update total', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /netflix/i }).click();

  await expect(page.getByText(/¥1,980/)).toBeVisible();
});
```

## モック

### Next.js Image のモック

`tests/__mocks__/next-image.tsx` で Next.js の Image コンポーネントをモックしています。
テスト環境では通常の `<img>` タグとして扱われます。

### modern-screenshot のモック

ShareButton のテストでは `modern-screenshot` をモックしています。
テスト環境では実際の画像生成は行わず、Blobを直接返します。

```typescript
vi.mock('modern-screenshot', () => ({
  domToBlob: vi.fn().mockResolvedValue(new Blob(['fake-image'], { type: 'image/png' })),
}));
```

## トラブルシューティング

### Vitest

**エラー: `Cannot find module '@/...'`**
- `vitest.config.mts` のパスエイリアス設定を確認してください

**エラー: `ReferenceError: localStorage is not defined`**
- テスト環境が `jsdom` になっているか確認してください

### Playwright

**エラー: `Timeout exceeded`**
- 要素が表示されるまでの待機時間が足りない可能性があります
- `await expect(element).toBeVisible()` を使用してください

**エラー: `Browser not found`**
- Playwrightのブラウザをインストールしてください: `bunx playwright install`

**E2Eテストがローカルでは成功するが、CIで失敗する**
- `playwright.config.ts` の `retries` 設定を確認してください
- スクリーンショットを確認してください: `playwright-report/index.html`

## 継続的インテグレーション (CI)

GitHub Actions などの CI 環境でテストを実行する場合:

```yaml
- name: Install dependencies
  run: bun install

- name: Install Playwright browsers
  run: bunx playwright install --with-deps

- name: Run unit tests
  run: bun test:run

- name: Run E2E tests
  run: bun test:e2e
```

## ベストプラクティス

### ユニットテスト

1. **1つのテストケースで1つの動作をテスト**
2. **テスト名は動作を明確に記述**（`should ...`）
3. **モックは最小限に**
4. **WHYコメントで意図を説明**

### E2Eテスト

1. **実際のユーザー操作をシミュレート**
2. **テスト間の独立性を保つ**（beforeEach でlocalStorageをクリア）
3. **エッジケースもカバー**
4. **適切な待機時間を設定**（`waitFor`, `toBeVisible`）

## カバレッジ目標

- **ライン カバレッジ**: 80% 以上
- **ブランチ カバレッジ**: 75% 以上
- **関数 カバレッジ**: 80% 以上

現在のカバレッジを確認:
```bash
bun test:run --coverage
```

## 参考リンク

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)

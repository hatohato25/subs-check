# SUBSCHECK

サブスクリプション管理・可視化ツール

## 概要

SUBSCHECKは、あなたが契約しているサブスクリプションサービスを一覧から選択し、月額合計金額を自動計算してSNSシェア用の画像を生成できるWebアプリケーションです。

### 主な機能

- **サブスク選択**: 動画配信、音楽配信、ソフトウェア、その他のサブスクを一覧から選択
- **合計金額計算**: 選択したサブスクの月額合計を自動計算
- **カテゴリフィルター**: 動画・音楽・ソフトウェア・その他でフィルタリング可能
- **カスタムサブスク追加**: 一覧にないサブスクを手動で追加・削除可能
- **画像生成**: 選択したサブスクをまとめた画像を生成（PNG形式でダウンロード）
- **SNSシェア**: X（旧Twitter）への投稿連携（URL共有機能付き）
- **ダークモード**: システム設定に応じた自動切り替え
- **レスポンシブ対応**: モバイル・タブレット・デスクトップで快適に動作
- **データ永続化**: 選択状態とカスタムサブスクをlocalStorageに自動保存

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS 4
- **UIコンポーネント**: Radix UI, class-variance-authority, lucide-react
- **画像生成**: Satori + Resvg, modern-screenshot
- **データ保存**: localStorage（ブラウザ内完結）
- **パッケージマネージャー**: Bun
- **リンター/フォーマッター**: Biome
- **テスト**: Vitest（ユニット・統合）、Playwright（E2E）

## セットアップ

### 前提条件

- [Bun](https://bun.sh/) v1.0.0 以上

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/subs-check.git
cd subs-check

# 依存関係をインストール
bun install
```

### 開発サーバーの起動

```bash
bun dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### ビルド

```bash
bun run build
```

### 本番環境での実行

```bash
bun start
```

## 開発コマンド

| コマンド | 説明 |
|---------|------|
| `bun dev` | 開発サーバーを起動 |
| `bun run build` | 本番用にビルド |
| `bun start` | 本番サーバーを起動 |
| `bun test` | ユニットテストを実行（watch mode） |
| `bun run test:run` | ユニットテストを1回実行 |
| `bun run test:e2e` | E2Eテストを実行（Playwright） |
| `bun run test:e2e:ui` | E2EテストをUI付きで実行 |
| `bun run test:e2e:headed` | E2Eテストをブラウザで確認しながら実行 |
| `bun run lint` | Biomeでリント実行 |
| `bun run format` | Biomeでフォーマット実行 |
| `bun run check` | Biomeでリント+フォーマットを実行 |

## 使い方

1. **サブスクを選択**: 契約中のサブスクをクリック/タップで選択（再クリックで解除）
2. **カテゴリでフィルター**（オプション）: 動画・音楽・ソフトウェア・その他で絞り込み
3. **カスタムサブスクを追加**（オプション）: 一覧にないサブスクを「カスタムサブスクを追加」から登録
   - サービス名、月額料金、絵文字アイコン、カラーを設定可能
   - 追加後も削除可能（カスタムサブスクのみ）
4. **合計金額を確認**: 画面下部に月額合計が表示されます
5. **画像を生成**: 「画像をダウンロード」ボタンで選択したサブスクの画像（PNG）をダウンロード
6. **Xでシェア**: 「Xでシェア」ボタンで投稿画面に遷移
   - 専用URLが生成され、シェア先で同じ選択状態を確認可能

## データの保存について

選択したサブスクとカスタムサブスクは、ブラウザのlocalStorageに保存されます。

- サーバーにデータは送信されません（完全にクライアントサイド完結）
- ブラウザのデータを削除すると選択状態もリセットされます
- プライベートブラウジングモードでは永続化されません
- シェアURL経由でアクセスした場合、URL内のデータが優先され、自動的にlocalStorageに保存されます

### localStorageキー

- `subscheck-selected-subscriptions`: 選択中のサブスクID一覧
- `subscheck-custom-subscriptions`: カスタムサブスク一覧

## Vercelへのデプロイ

### デプロイ手順

1. [Vercel](https://vercel.com/)にログイン
2. 「Add New Project」をクリック
3. GitHubリポジトリを選択
4. プロジェクト設定:
   - **Framework Preset**: Next.js
   - **Build Command**: `bun run build`（デフォルトのまま）
   - **Output Directory**: `.next`（デフォルトのまま）
   - **Install Command**: `bun install`
5. 「Deploy」をクリック

### 環境変数

このプロジェクトは環境変数を使用しません。すべてクライアントサイドで完結します。

### 注意事項

- Vercelは自動的にBunを検出してビルドを実行します
- カスタムドメインの設定はVercelのプロジェクト設定から行えます

## プロジェクト構成

```
subs-check/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # メインページ
│   │   ├── layout.tsx            # ルートレイアウト
│   │   ├── globals.css           # グローバルスタイル
│   │   ├── api/og/route.ts       # OG画像生成API
│   │   └── share/[encoded]/page.tsx  # シェアページ
│   ├── components/
│   │   ├── ui/                   # 汎用UIコンポーネント
│   │   │   ├── SubscriptionIcon.tsx      # サブスクアイコン（クライアント）
│   │   │   └── SubscriptionIconNext.tsx  # サブスクアイコン（サーバー）
│   │   └── features/             # 機能コンポーネント
│   │       ├── SubscriptionTag.tsx           # サブスク選択タグ
│   │       ├── TotalDisplay.tsx              # 合計金額表示
│   │       ├── ShareButton.tsx               # シェアボタン
│   │       └── CustomSubscriptionForm.tsx    # カスタムサブスク追加フォーム
│   ├── hooks/
│   │   └── useSubscriptions.ts   # サブスク管理フック
│   ├── lib/
│   │   ├── storage.ts            # localStorage操作
│   │   ├── utils.ts              # ユーティリティ関数
│   │   ├── format.ts             # フォーマット関数
│   │   ├── share.ts              # シェア機能
│   │   └── subscription-utils.ts # サブスク操作ヘルパー
│   ├── types/
│   │   └── subscription.ts       # サブスク型定義
│   └── data/
│       └── subscriptions.ts      # プリセットサブスク一覧（100種類以上）
├── tests/                        # テストコード
│   ├── lib/                      # ユニットテスト
│   ├── hooks/                    # フックテスト
│   ├── components/               # コンポーネントテスト
│   ├── app/                      # E2Eテスト（Playwright）
│   └── setup.ts                  # テスト設定
├── public/
│   └── icon/                     # サブスクアイコン画像
└── .claude/                      # Claude設定（開発用）
```

## ライセンス

このプロジェクトは[MITライセンス](LICENSE)の下で公開されています。

## 謝辞

- アイコン: 各サービスのfavicon
- フォント: [Google Fonts](https://fonts.google.com/) (Noto Sans JP, Inter)
- 画像生成: [Satori](https://github.com/vercel/satori), [Resvg](https://github.com/yisibl/resvg-js)

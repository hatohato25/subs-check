/**
 * サブスクリプションのカテゴリ（Pencilデザイン版）
 *
 * WHY: Pencilデザインに合わせて `software` カテゴリを追加
 */
export type SubscriptionCategory = 'video' | 'music' | 'software' | 'other' | 'custom';

/**
 * サブスクリプション基本型
 */
export type Subscription = {
  /** 一意識別子 */
  id: string;
  /** サービス名（日本語） */
  name: string;
  /** サービス名（英語、画像生成用） */
  nameEn: string;
  /** 月額料金（税込、円） */
  price: number;
  /** カテゴリ */
  category: SubscriptionCategory;
  /** アイコンパス（例: '/icon/netflix.png'）。カスタムサブスクでは未設定 */
  icon?: string;
  /** フォールバック絵文字アイコン */
  fallbackIcon: string;
  /** ブランドカラー（HEX形式） */
  color: string;
  /** 備考・主な特徴（日本語） */
  description?: string;
  /** プラン名（日本語） */
  planJa?: string;
  /** プラン名（英語） */
  planEn?: string;
  /** 月額料金（USD）。Japan-exclusiveの場合はnull */
  priceUsd?: number | null;
  /** 備考・主な特徴（英語） */
  descriptionEn?: string;
};

/**
 * カスタムサブスクリプション型
 * ユーザーが手動で追加したサブスク
 */
export type CustomSubscription = Subscription & {
  category: 'custom';
  isCustom: true;
};

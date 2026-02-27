/**
 * 多言語化翻訳辞書
 *
 * WHY: Client ComponentsとServer Componentsの両方で翻訳を使用できるよう、
 *      純粋な辞書オブジェクトとして実装
 */

export type Locale = 'ja' | 'en';

/**
 * 翻訳辞書の型定義
 */
type Translations = {
  // ShareButton
  shareButton: {
    downloadImage: string;
    downloaded: string;
    shareOnX: string;
    copyLink: string;
    copied: string;
    ariaDownload: string;
    ariaShare: string;
    ariaCopyLink: string;
  };
  // CustomSubscriptionForm
  customForm: {
    addCustom: string;
    addCustomTitle: string;
    close: string;
    iconLabel: string;
    nameLabel: string;
    namePlaceholder: string;
    priceLabel: string;
    submitButton: string;
    errorNameRequired: string;
    errorPriceInvalid: string;
    errorPriceMax: string;
  };
  // SharePage
  sharePage: {
    title: string;
    subtitle: string;
    itemsCount: string;
    selectedSubscriptions: string;
    monthlyTotal: string;
    perMonth: string;
    annualTotal: string;
    details: string;
    tryYourself: string;
    cautionPrefix: string;
    cautionSuffix: string;
    errorTitle: string;
    errorDescription: string;
    backToHome: string;
  };
  // Share text template
  shareText: {
    template: (total: string, subscriptions: string, more: string) => string;
  };
};

/**
 * 日本語翻訳
 */
const ja: Translations = {
  shareButton: {
    downloadImage: '画像をダウンロード',
    downloaded: 'ダウンロード済み',
    shareOnX: 'Xでシェア',
    copyLink: 'リンクコピー',
    copied: 'コピー済み',
    ariaDownload: 'レシート画像をダウンロード',
    ariaShare: 'Xでシェア（画像付き）',
    ariaCopyLink: 'シェアリンクをコピー',
  },
  customForm: {
    addCustom: 'カスタムサブスクを追加',
    addCustomTitle: 'ADD CUSTOM',
    close: '閉じる',
    iconLabel: 'アイコン',
    nameLabel: 'サービス名',
    namePlaceholder: '例: ChatGPT Plus',
    priceLabel: '月額料金（円）',
    submitButton: '追加する',
    errorNameRequired: 'サービス名を入力してください',
    errorPriceInvalid: '有効な金額を入力してください',
    errorPriceMax: '金額は999,999円以下で入力してください',
  },
  sharePage: {
    title: 'シェアされたサブスク',
    subtitle: 'SHARED RECEIPT',
    itemsCount: '件',
    selectedSubscriptions: '選択中のサブスク',
    monthlyTotal: '月額合計',
    perMonth: '/月（税込）',
    annualTotal: '年額換算',
    details: '内訳',
    tryYourself: '自分も試す →',
    cautionPrefix: '⚠ CAUTION: 年間',
    cautionSuffix: 'の出費です',
    errorTitle: 'ERROR',
    errorDescription: '無効なシェアURLです。\nURLが正しいか確認してください。',
    backToHome: 'トップページへ',
  },
  shareText: {
    template: (total, subscriptions, more) =>
      `私の月額サブスク合計は${total}でした！\n\n${subscriptions}${more}\n\n#SubsCheck`,
  },
};

/**
 * 英語翻訳
 */
const en: Translations = {
  shareButton: {
    downloadImage: 'Download',
    downloaded: 'Downloaded',
    shareOnX: 'Share on X',
    copyLink: 'Copy Link',
    copied: 'Copied',
    ariaDownload: 'Download receipt image',
    ariaShare: 'Share on X with image',
    ariaCopyLink: 'Copy share link',
  },
  customForm: {
    addCustom: 'Add custom subscription',
    addCustomTitle: 'ADD CUSTOM',
    close: 'Close',
    iconLabel: 'Icon',
    nameLabel: 'Service name',
    namePlaceholder: 'e.g. ChatGPT Plus',
    priceLabel: 'Monthly price (USD)',
    submitButton: 'Add',
    errorNameRequired: 'Please enter service name',
    errorPriceInvalid: 'Please enter valid amount',
    errorPriceMax: 'Amount must be less than 999,999',
  },
  sharePage: {
    title: 'Shared subscriptions',
    subtitle: 'SHARED RECEIPT',
    itemsCount: 'items',
    selectedSubscriptions: 'Selected subscriptions',
    monthlyTotal: 'Monthly Total',
    perMonth: '/month',
    annualTotal: 'Annual Total',
    details: 'Details',
    tryYourself: 'Try it yourself →',
    cautionPrefix: '⚠ CAUTION: You spend',
    cautionSuffix: 'per year',
    errorTitle: 'ERROR',
    errorDescription: 'Invalid share URL.\nPlease check the URL.',
    backToHome: 'Back to Home',
  },
  shareText: {
    template: (total, subscriptions, more) =>
      `My monthly subscriptions total ${total}!\n\n${subscriptions}${more}\n\n#SubsCheck`,
  },
};

/**
 * 翻訳辞書
 */
export const translations = {
  ja,
  en,
} as const;

/**
 * 翻訳関数
 *
 * WHY: locale に応じた翻訳を取得するヘルパー関数
 */
export function t(locale: Locale): Translations {
  return translations[locale];
}

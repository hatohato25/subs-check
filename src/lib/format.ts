import type { Locale } from '@/contexts/LocaleContext';

/**
 * 金額を指定された言語の形式にフォーマット
 *
 * @param price - 金額（円 or USD）
 * @param locale - 言語（'ja' または 'en'）
 * @returns フォーマットされた金額文字列
 *
 * @example
 * formatPrice(1234, 'ja')   // '¥1,234'
 * formatPrice(12.99, 'en')  // '$12.99'
 */
export function formatPrice(price: number, locale: Locale = 'ja'): string {
  if (locale === 'en') {
    // WHY: 英語モードでは USD 形式で表示（小数点2桁まで）
    // タグ表示時の幅を抑えるため /mo は付けない
    const formatted = price.toFixed(2);
    return `$${formatted}`;
  }

  // WHY: 日本語モードでは整数の円形式で表示
  const sanitized = Math.floor(Math.abs(price));
  return `¥${sanitized.toLocaleString('ja-JP')}`;
}

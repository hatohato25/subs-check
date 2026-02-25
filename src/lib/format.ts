/**
 * 金額を日本円形式にフォーマット
 *
 * @param price - 金額（円）
 * @returns フォーマットされた金額文字列（例: ¥1,234）
 *
 * @example
 * formatPrice(1234) // '¥1,234'
 * formatPrice(0)    // '¥0'
 * formatPrice(9999999) // '¥9,999,999'
 */
export function formatPrice(price: number): string {
  // 負の値や小数は想定しないが、安全のため整数化
  const sanitized = Math.floor(Math.abs(price));

  return `¥${sanitized.toLocaleString('ja-JP')}`;
}

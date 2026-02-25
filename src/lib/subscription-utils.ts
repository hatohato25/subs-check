import type { Subscription } from '@/types/subscription';

/**
 * 選択されたサブスクリプションから一意のアイコンを取得
 *
 * WHY: 同一アイコンのサービスが複数選択されている場合は1つにまとめる
 *
 * @param subscriptions - 選択されたサブスクリプション一覧
 * @returns 重複排除されたアイコンの配列
 */
export function getUniqueIcons(subscriptions: Subscription[]): string[] {
  return Array.from(
    new Set(
      subscriptions
        .map((sub) => sub.icon || sub.fallbackIcon)
        .filter((icon): icon is string => icon !== undefined)
    )
  );
}

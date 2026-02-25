import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * classNames ユーティリティ
 *
 * WHY: clsx と tailwind-merge を組み合わせて、条件付きクラス名と
 * Tailwind CSSのクラス名の衝突を解決する
 *
 * @param inputs - クラス名の配列または条件オブジェクト
 * @returns マージされたクラス名文字列
 *
 * @example
 * cn('p-4', 'bg-white', isActive && 'bg-blue-500')
 * // isActiveがtrueの場合: 'p-4 bg-blue-500'（bg-whiteは上書きされる）
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

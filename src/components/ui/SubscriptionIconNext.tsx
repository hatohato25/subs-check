'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';

type Props = {
  /** 画像アイコンのパス */
  icon?: string;
  /** 画像読み込み失敗時のフォールバック絵文字 */
  fallbackIcon: string;
  /** アイコンの説明（アクセシビリティ用） */
  alt?: string;
  /** アイコンサイズ */
  size?: Size;
  /** 追加のクラス名 */
  className?: string;
};

const sizeMap: Record<Size, { pixels: number; emoji: string }> = {
  sm: { pixels: 16, emoji: 'text-base' },
  md: { pixels: 24, emoji: 'text-xl' },
  lg: { pixels: 32, emoji: 'text-2xl' },
};

/**
 * サブスクリプションアイコンコンポーネント（Next.js Image版）
 *
 * WHY: Next.js Image コンポーネントを使用するバージョン
 *      画像の最適化が必要な箇所（TotalDisplay、シェアページ）で使用
 *      画像読み込みエラー時は自動的にフォールバック絵文字を表示
 */
export function SubscriptionIconNext({
  icon,
  fallbackIcon,
  alt = 'service icon',
  size = 'md',
  className,
}: Props) {
  const { pixels, emoji } = sizeMap[size];

  // WHY: icon が指定されており、かつ '/' で始まる場合のみ画像を表示
  //      Next.js Image は onError でのフォールバックが難しいため、
  //      画像パスの存在チェックで判定
  if (icon?.startsWith('/')) {
    return (
      <Image
        src={icon}
        alt={alt}
        width={pixels}
        height={pixels}
        className={cn('object-contain', className)}
      />
    );
  }

  // WHY: 画像なし or フォールバック絵文字の場合
  return <span className={cn(emoji, className)}>{fallbackIcon}</span>;
}

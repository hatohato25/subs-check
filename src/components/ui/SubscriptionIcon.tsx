'use client';

import { useState } from 'react';
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

const sizeClasses: Record<Size, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const emojiFontSizes: Record<Size, string> = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
};

/**
 * サブスクリプションアイコンコンポーネント
 *
 * WHY: 画像読み込みエラー時にfallbackIconを自動表示する共通コンポーネント
 *      SubscriptionTag、TotalDisplay、シェアページなど複数箇所で使用
 */
export function SubscriptionIcon({ icon, fallbackIcon, alt = '', size = 'md', className }: Props) {
  // WHY: 画像読み込みエラー時にフォールバック絵文字を表示
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  // WHY: icon が指定されており、かつエラーが発生していない場合のみ画像を表示
  if (icon && !imageError) {
    return (
      <img
        src={icon}
        alt={alt}
        className={cn(sizeClasses[size], 'object-contain', className)}
        onError={handleImageError}
      />
    );
  }

  // WHY: 画像なし or エラー時はフォールバック絵文字を表示
  return <span className={cn(emojiFontSizes[size], className)}>{fallbackIcon}</span>;
}

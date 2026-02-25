'use client';

import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { SubscriptionIcon } from '@/components/ui/SubscriptionIcon';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Subscription } from '@/types/subscription';

type Props = {
  subscription: Subscription;
  isSelected: boolean;
  onToggle: (id: string) => void;
  index: number;
};

/**
 * サブスクリプションタグコンポーネント
 *
 * Neo-Brutalistスタイルのタグ。選択状態で視覚的に変化する。
 * hover時にサービス名と説明を表示するtooltipを実装。
 */
export function SubscriptionTag({ subscription, isSelected, onToggle, index }: Props) {
  // tooltip表示状態
  const [showTooltip, setShowTooltip] = useState(false);
  // delayタイマー管理
  const tooltipTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    onToggle(subscription.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle(subscription.id);
    }
  };

  // tooltip表示のハンドリング（300ms delay）
  const handleMouseEnter = () => {
    tooltipTimerRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
    setShowTooltip(false);
  };

  // クリーンアップ: コンポーネントアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }
    };
  }, []);

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        // ベーススタイル
        'group relative flex items-center gap-2 px-3 py-2',
        'font-receipt text-sm',
        'border-brutal rounded-sm',
        'transition-all duration-150',
        'cursor-pointer select-none',
        'animate-tag-pop',
        // 非選択時
        !isSelected && [
          'bg-paper text-ink-light',
          'hover:bg-paper-aged hover:text-ink',
          'hover-lift',
        ],
        // 選択時
        isSelected && ['bg-ink text-paper', 'shadow-brutal-sm', 'translate-x-0.5 translate-y-0.5']
      )}
      style={{
        animationDelay: `${index * 30}ms`,
        // ブランドカラーをアクセントとして使用
        borderLeftColor: isSelected ? subscription.color : undefined,
        borderLeftWidth: isSelected ? '4px' : undefined,
      }}
      aria-pressed={isSelected}
      aria-label={`${subscription.name} ${formatPrice(subscription.price)}/月 ${isSelected ? '選択中' : '未選択'}`}
    >
      {/* アイコン */}
      <span
        className={cn(
          'flex-shrink-0',
          'transition-transform duration-150',
          isSelected && 'scale-110'
        )}
        aria-hidden="true"
      >
        <SubscriptionIcon
          icon={subscription.icon}
          fallbackIcon={subscription.fallbackIcon}
          alt=""
          size="sm"
        />
      </span>

      {/* サービス名 */}
      <span className="truncate max-w-[120px] sm:max-w-[160px]">{subscription.name}</span>

      {/* 価格 */}
      <span
        className={cn('ml-auto font-bold tabular-nums', isSelected ? 'text-highlight' : 'text-ink')}
      >
        {formatPrice(subscription.price)}
      </span>

      {/* 選択チェックマーク */}
      {isSelected && (
        <span
          className={cn(
            'absolute -top-1 -right-1',
            'w-5 h-5 rounded-full',
            'bg-highlight-strong',
            'flex items-center justify-center',
            'border-2 border-ink',
            'animate-tag-pop'
          )}
        >
          <Check className="w-3 h-3 text-ink" strokeWidth={3} />
        </span>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <span
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
            'px-3 py-2 min-w-max max-w-xs',
            'bg-ink text-paper',
            'border-brutal rounded-sm shadow-brutal',
            'font-receipt text-xs',
            'pointer-events-none',
            'z-50',
            'animate-tooltip-pop'
          )}
          role="tooltip"
        >
          {/* Tooltip矢印 */}
          <span
            className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-4 border-transparent border-t-ink"
            aria-hidden="true"
          />
          <div className="font-bold mb-1">{subscription.name}</div>
          {subscription.description && (
            <div className="text-paper/80 text-xs">{subscription.description}</div>
          )}
        </span>
      )}
    </button>
  );
}

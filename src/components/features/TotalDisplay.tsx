'use client';

import { forwardRef, useEffect, useRef, useState } from 'react';
import { SubscriptionIconNext } from '@/components/ui/SubscriptionIconNext';
import { formatPrice } from '@/lib/format';
import { getUniqueIcons } from '@/lib/subscription-utils';
import { cn } from '@/lib/utils';
import type { Subscription } from '@/types/subscription';

type Props = {
  total: number;
  selectedCount: number;
  selectedSubscriptions: Subscription[];
};

/**
 * 合計金額表示コンポーネント
 *
 * レシート風のデザインで月額合計を表示
 * WHY: forwardRefでrefを受け取れるようにし、スクリーンショット撮影に対応
 */
export const TotalDisplay = forwardRef<HTMLDivElement, Props>(
  ({ total, selectedCount, selectedSubscriptions }, ref) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [displayTotal, setDisplayTotal] = useState(total);
    const prevTotalRef = useRef(total);

    // 選択されたサブスクのアイコンを重複排除して取得
    const uniqueIcons = getUniqueIcons(selectedSubscriptions);

    // 金額変更時のアニメーション
    // WHY: displayTotalを依存配列から除外し、prevTotalRefで前回値を追跡することで
    //      useEffectの不要な再実行を防ぎ、メモリリークを回避する
    useEffect(() => {
      if (total !== prevTotalRef.current) {
        prevTotalRef.current = total;
        setIsAnimating(true);
        const timer = setTimeout(() => {
          setDisplayTotal(total);
          setIsAnimating(false);
        }, 150);
        return () => clearTimeout(timer);
      }
    }, [total]);

    // 年額計算
    const yearlyTotal = total * 12;

    return (
      <div
        ref={ref}
        className={cn(
          'bg-paper border-brutal rounded-sm',
          'shadow-brutal-lg',
          'p-6',
          'paper-texture'
        )}
      >
        {/* ヘッダー */}
        <div className="text-center mb-4">
          <h2 className="font-display text-3xl tracking-wider text-ink">RECEIPT</h2>
          <p className="font-receipt text-xs text-ink-faded mt-1">
            {new Date().toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </p>
        </div>

        <hr className="receipt-divider" />

        {/* サブスク数とアイコン */}
        <div className="mb-4">
          <div className="flex justify-between items-center font-receipt text-sm mb-2">
            <span className="text-ink-light">選択中のサブスク</span>
            <span className="font-bold text-ink">{selectedCount} 件</span>
          </div>

          {/* アイコン一覧 */}
          {uniqueIcons.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {uniqueIcons.map((icon, index) => (
                <div
                  key={icon}
                  className={cn(
                    'flex items-center justify-center',
                    'w-8 h-8',
                    'bg-paper-aged border border-ink-faded/20 rounded',
                    'transition-transform hover:scale-110',
                    'animate-tag-pop'
                  )}
                  style={{
                    animationDelay: `${index * 30}ms`,
                  }}
                >
                  <SubscriptionIconNext
                    icon={icon.startsWith('/') ? icon : undefined}
                    fallbackIcon={icon.startsWith('/') ? '📦' : icon}
                    alt="service icon"
                    size="md"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="receipt-dots" />

        {/* 月額合計 */}
        <div className="mb-2">
          <div className="flex justify-between items-baseline">
            <span className="font-receipt text-sm text-ink-light">月額合計</span>
            <span
              className={cn(
                'font-display text-5xl tracking-tight text-ink',
                'transition-all duration-150',
                isAnimating && 'opacity-0 translate-y-2',
                !isAnimating && 'animate-price-update'
              )}
            >
              {formatPrice(displayTotal)}
            </span>
          </div>
          <p className="text-right font-receipt text-xs text-ink-faded mt-1">/月（税込）</p>
        </div>

        <hr className="receipt-divider" />

        {/* 年額換算 */}
        <div className="flex justify-between items-center font-receipt text-sm">
          <span className="text-ink-light">年額換算</span>
          <span
            className={cn(
              'font-bold tabular-nums',
              yearlyTotal > 100000 ? 'text-accent-red' : 'text-ink'
            )}
          >
            {formatPrice(yearlyTotal)}
          </span>
        </div>

        {/* 警告メッセージ（高額時） */}
        {yearlyTotal > 50000 && (
          <div
            className={cn(
              'mt-4 p-3 rounded-sm',
              'bg-highlight border-2 border-ink',
              'font-receipt text-xs text-ink',
              'animate-stamp'
            )}
            style={{ transformOrigin: 'center center' }}
          >
            <span className="font-bold">⚠ CAUTION:</span> 年間 {formatPrice(yearlyTotal)} の出費です
          </div>
        )}

        {/* 空の状態 */}
        {selectedCount === 0 && (
          <div className="mt-4 text-center">
            <p className="font-receipt text-sm text-ink-faded">サブスクを選択してください</p>
            <p className="font-receipt text-xs text-ink-faded mt-1">↓ 下のタグをタップ ↓</p>
          </div>
        )}
      </div>
    );
  }
);

TotalDisplay.displayName = 'TotalDisplay';

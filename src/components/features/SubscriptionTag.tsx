'use client';

import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SubscriptionIcon } from '@/components/ui/SubscriptionIcon';
import { useLocale } from '@/contexts/LocaleContext';
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
  const { locale } = useLocale();

  // tooltip表示状態
  const [showTooltip, setShowTooltip] = useState(false);
  // delayタイマー管理
  const tooltipTimerRef = useRef<NodeJS.Timeout | null>(null);
  // WHY: ツールチップの位置計算のために、ボタン要素への参照を保持
  const buttonRef = useRef<HTMLButtonElement>(null);
  // WHY: ツールチップの位置情報
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // WHY: 言語に応じた表示名を取得
  const displayName =
    locale === 'en'
      ? subscription.planEn
        ? `${subscription.nameEn} (${subscription.planEn})`
        : subscription.nameEn
      : subscription.name;

  // WHY: 言語に応じた価格を取得
  const displayPrice =
    locale === 'en' ? (subscription.priceUsd ?? subscription.price) : subscription.price;

  // WHY: 言語に応じた説明を取得
  const displayDescription =
    locale === 'en'
      ? (subscription.descriptionEn ?? subscription.description)
      : subscription.description;

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
      // WHY: ツールチップを表示する前に、ボタンの位置を計算
      // position: fixedを使用するため、ビューポート座標をそのまま使用（scrollYは不要）
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setTooltipPosition({
          // WHY: タグの上端のビューポート座標（fixedなのでscrollY不要）
          top: rect.top,
          // WHY: タグの左端を基準に配置
          left: rect.left,
        });
      }
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
    <>
      <button
        ref={buttonRef}
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
        aria-label={`${displayName} ${formatPrice(displayPrice, locale)}${locale === 'ja' ? '/月' : ''} ${isSelected ? (locale === 'ja' ? '選択中' : 'Selected') : locale === 'ja' ? '未選択' : 'Not selected'}`}
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
        <span className="truncate max-w-[120px] sm:max-w-[160px]">{displayName}</span>

        {/* 価格 */}
        <span
          className={cn(
            'ml-auto font-bold tabular-nums',
            isSelected ? 'text-highlight' : 'text-ink'
          )}
        >
          {formatPrice(displayPrice, locale)}
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
      </button>

      {/* Tooltip - Portal化して確実に表示 */}
      {showTooltip &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            className={cn(
              'fixed px-3 py-2 min-w-max max-w-xs',
              'bg-ink text-paper',
              'border-brutal rounded-sm shadow-brutal',
              'font-receipt text-xs',
              'pointer-events-none',
              'z-[9999]',
              'animate-tooltip-pop'
            )}
            style={{
              // WHY: bottomを使用してビューポートの下からの位置を指定
              // ビューポート高さ - タグ上端位置 + 8pxマージン = タグの上に配置
              bottom: `calc(100vh - ${tooltipPosition.top}px + 8px)`,
              left: `${tooltipPosition.left}px`,
            }}
            role="tooltip"
          >
            {/* Tooltip矢印 - タグの左側を指す */}
            <span
              className="absolute top-full left-4 -mt-px w-0 h-0 border-4 border-transparent border-t-ink"
              aria-hidden="true"
            />
            <div className="font-bold mb-1">{displayName}</div>
            {displayDescription && (
              <div className="text-paper/80 text-xs">{displayDescription}</div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

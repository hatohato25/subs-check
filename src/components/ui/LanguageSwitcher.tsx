'use client';

import { Check, Globe } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocale, type Locale } from '@/contexts/LocaleContext';
import { cn } from '@/lib/utils';

/**
 * 言語オプション
 */
const LANGUAGE_OPTIONS: { locale: Locale; label: string }[] = [
  { locale: 'ja', label: '日本語' },
  { locale: 'en', label: 'English' },
];

/**
 * LanguageSwitcher
 *
 * 地球儀アイコンをクリックすると、ドロップダウンメニューが開く
 * Neo-Brutalistスタイルに合わせたデザイン
 */
export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // メニューの外側をクリックしたら閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelectLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* 地球儀アイコンボタン */}
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'flex items-center justify-center',
          'w-10 h-10',
          'border-2 rounded-sm',
          'transition-colors duration-150',
          'cursor-pointer select-none',
          // 開いていない状態: 通常のボタン
          !isOpen && 'bg-paper border-ink text-ink hover:bg-paper-aged',
          // 開いている状態: 強調表示（hover効果を無効化）
          isOpen && 'bg-ink border-ink text-paper'
        )}
        aria-label="言語を切り替える"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-5 h-5" />
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full right-0 mt-2',
            'min-w-[140px]',
            'bg-paper border-brutal rounded-sm shadow-brutal',
            'overflow-hidden',
            'z-50',
            'animate-tooltip-pop'
          )}
          role="menu"
        >
          {LANGUAGE_OPTIONS.map((option) => {
            const isSelected = locale === option.locale;

            return (
              <button
                key={option.locale}
                type="button"
                onClick={() => handleSelectLocale(option.locale)}
                className={cn(
                  'w-full flex items-center justify-between',
                  'px-4 py-2',
                  'font-receipt text-sm',
                  'transition-colors duration-150',
                  'cursor-pointer select-none',
                  isSelected
                    ? 'bg-ink text-paper font-bold'
                    : 'bg-paper text-ink hover:bg-paper-aged'
                )}
                role="menuitem"
                aria-current={isSelected ? 'true' : 'false'}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="w-4 h-4 ml-2" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

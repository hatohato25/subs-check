'use client';

import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CustomSubscriptionForm } from '@/components/features/CustomSubscriptionForm';
import { ShareButton } from '@/components/features/ShareButton';
import { SubscriptionTag } from '@/components/features/SubscriptionTag';
import { TotalDisplay } from '@/components/features/TotalDisplay';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { cn } from '@/lib/utils';

/**
 * カテゴリの表示名とスタイル
 */
const CATEGORY_CONFIG = {
  video: {
    label: '動画配信',
    icon: '📺',
    className: 'category-video',
  },
  music: {
    label: '音楽配信',
    icon: '🎵',
    className: 'category-music',
  },
  software: {
    label: 'ソフトウェア',
    icon: '💻',
    className: 'category-software',
  },
  other: {
    label: 'その他',
    icon: '📦',
    className: 'category-other',
  },
  custom: {
    label: 'カスタム',
    icon: '✨',
    className: 'category-custom',
  },
} as const;

export default function HomePage() {
  const {
    isHydrated,
    subscriptionsByCategory,
    toggleSubscription,
    addCustomSubscription,
    isSelected,
    selectedSubscriptions,
    totalPrice,
    selectedCount,
  } = useSubscriptions();

  // WHY: TotalDisplayのスクリーンショット撮影用ref
  const receiptRef = useRef<HTMLDivElement>(null);

  // WHY: 各カテゴリーの開閉状態を管理（初期値はすべて開いている）
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    video: true,
    music: true,
    software: true,
    other: true,
    custom: true,
  });

  // カテゴリーの開閉を切り替える
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // ハイドレーション前はローディング表示
  if (!isHydrated) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-4xl tracking-wider text-ink animate-pulse">
            LOADING...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-32">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-paper-aged border-b-4 border-ink">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl tracking-wider text-ink">
                SUBSCHECK
              </h1>
              <p className="font-receipt text-xs text-ink-faded mt-1">あなたのサブスク、いくら？</p>
            </div>
            {/* 選択数バッジ */}
            {selectedCount > 0 && (
              <div
                className={cn(
                  'px-3 py-1',
                  'bg-highlight border-2 border-ink rounded-full',
                  'font-receipt text-sm font-bold',
                  'animate-tag-pop'
                )}
              >
                {selectedCount} 件選択中
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 合計金額表示 */}
        <section className="mb-8">
          <TotalDisplay
            ref={receiptRef}
            total={totalPrice}
            selectedCount={selectedCount}
            selectedSubscriptions={selectedSubscriptions}
          />
        </section>

        {/* サブスク一覧 */}
        <section className="space-y-8">
          {(Object.keys(CATEGORY_CONFIG) as (keyof typeof CATEGORY_CONFIG)[]).map((category) => {
            const config = CATEGORY_CONFIG[category];
            const subs = subscriptionsByCategory[category];
            const isExpanded = expandedCategories[category] ?? true;

            // WHY: このカテゴリーで選択中のサブスク数を計算
            const selectedInCategory = subs.filter((sub) => isSelected(sub.id)).length;

            if (subs.length === 0 && category !== 'custom') {
              return null;
            }

            return (
              <div key={category} className={config.className}>
                {/* カテゴリヘッダー（クリック可能） */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={cn(
                    'w-full flex items-center gap-2 mb-4',
                    'cursor-pointer select-none',
                    'transition-all duration-150',
                    'hover-lift',
                    'group'
                  )}
                  aria-expanded={isExpanded}
                  aria-controls={`category-${category}`}
                >
                  {/* アイコン */}
                  <span className="text-2xl" aria-hidden="true">
                    {config.icon}
                  </span>

                  {/* カテゴリ名 */}
                  <h2 className="font-display text-2xl tracking-wide text-ink">{config.label}</h2>

                  {/* 選択中の件数バッジ */}
                  {selectedInCategory > 0 && (
                    <span
                      className={cn(
                        'px-2 py-0.5',
                        'bg-highlight border-2 border-ink rounded-full',
                        'font-receipt text-xs font-bold',
                        'transition-all duration-150'
                      )}
                    >
                      {selectedInCategory}
                    </span>
                  )}

                  {/* 区切り線 */}
                  <div className="flex-1 h-0.5 bg-ink-faded/30 ml-2" />

                  {/* 開閉アイコン */}
                  <ChevronDown
                    className={cn(
                      'w-6 h-6 text-ink-faded',
                      'transition-transform duration-200',
                      'group-hover:text-ink',
                      isExpanded ? 'rotate-180' : 'rotate-0'
                    )}
                    aria-hidden="true"
                  />
                </button>

                {/* タグ一覧（アコーディオンコンテンツ） */}
                <div
                  id={`category-${category}`}
                  className={cn(
                    'transition-all duration-300',
                    isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                  )}
                >
                  <div className="flex flex-wrap gap-2">
                    {subs.map((sub, index) => (
                      <SubscriptionTag
                        key={sub.id}
                        subscription={sub}
                        isSelected={isSelected(sub.id)}
                        onToggle={toggleSubscription}
                        index={index}
                      />
                    ))}

                    {/* カスタムカテゴリの場合は追加フォームを表示 */}
                    {category === 'custom' && (
                      <CustomSubscriptionForm onAdd={addCustomSubscription} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {/* シェアボタン（固定フッター） */}
      <footer
        className={cn(
          'fixed bottom-0 left-0 right-0',
          'bg-paper border-t-4 border-ink',
          'shadow-[0_-4px_20px_rgba(0,0,0,0.1)]',
          'transition-transform duration-300',
          selectedCount === 0 && 'translate-y-full'
        )}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <ShareButton
            selectedSubscriptions={selectedSubscriptions}
            total={totalPrice}
            receiptRef={receiptRef}
          />
        </div>
      </footer>
    </main>
  );
}

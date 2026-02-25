'use client';

import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { CustomSubscription } from '@/types/subscription';

type Props = {
  onAdd: (subscription: CustomSubscription) => void;
};

// カスタムサブスク用の絵文字候補
const EMOJI_OPTIONS = ['📱', '💻', '🎮', '📚', '🏋️', '🍔', '☕', '🎬', '🎵', '📦'];

/**
 * カスタムサブスク追加フォーム
 *
 * 一覧にないサブスクを手動で追加できる
 */
export function CustomSubscriptionForm({ onAdd }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // バリデーション
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('サービス名を入力してください');
      return;
    }

    const parsedPrice = Number.parseInt(price, 10);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('有効な金額を入力してください');
      return;
    }

    if (parsedPrice > 999999) {
      setError('金額は999,999円以下で入力してください');
      return;
    }

    // カスタムサブスクを作成
    const customSub: CustomSubscription = {
      id: `custom-${Date.now()}`,
      name: trimmedName,
      nameEn: trimmedName,
      price: parsedPrice,
      category: 'custom',
      isCustom: true,
      fallbackIcon: emoji,
      color: '#FF6F00',
    };

    onAdd(customSub);

    // フォームをリセット
    setName('');
    setPrice('');
    setEmoji(EMOJI_OPTIONS[0]);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-2 px-4 py-2',
          'font-receipt text-sm',
          'border-2 border-dashed border-ink-faded rounded-sm',
          'text-ink-faded',
          'hover:border-ink hover:text-ink',
          'transition-colors duration-150',
          'cursor-pointer'
        )}
      >
        <Plus className="w-4 h-4" />
        カスタムサブスクを追加
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('bg-paper border-brutal rounded-sm', 'shadow-brutal p-4', 'animate-tag-pop')}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display text-xl tracking-wide text-ink">ADD CUSTOM</h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-paper-aged rounded-sm transition-colors cursor-pointer"
          aria-label="閉じる"
        >
          <X className="w-5 h-5 text-ink" />
        </button>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 p-2 bg-accent-red/10 border-2 border-accent-red rounded-sm">
          <p className="font-receipt text-xs text-accent-red">{error}</p>
        </div>
      )}

      {/* アイコン選択 */}
      <fieldset className="mb-4">
        <legend className="block font-receipt text-xs text-ink-faded mb-2">アイコン</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="アイコン選択">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={cn(
                'w-10 h-10 text-xl',
                'border-2 rounded-sm',
                'transition-all duration-150',
                'cursor-pointer',
                emoji === e
                  ? 'border-ink bg-highlight scale-110'
                  : 'border-ink-faded hover:border-ink'
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </fieldset>

      {/* サービス名 */}
      <div className="mb-4">
        <label htmlFor="custom-name" className="block font-receipt text-xs text-ink-faded mb-2">
          サービス名
        </label>
        <input
          id="custom-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: ChatGPT Plus"
          className={cn(
            'w-full px-3 py-2',
            'font-receipt text-sm',
            'bg-paper-aged border-brutal rounded-sm',
            'placeholder:text-ink-faded',
            'focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2'
          )}
          maxLength={30}
        />
      </div>

      {/* 月額料金 */}
      <div className="mb-4">
        <label htmlFor="custom-price" className="block font-receipt text-xs text-ink-faded mb-2">
          月額料金（円）
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-receipt text-ink-faded">
            ¥
          </span>
          <input
            id="custom-price"
            type="number"
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            className={cn(
              'w-full pl-8 pr-3 py-2',
              'font-receipt text-sm',
              'bg-paper-aged border-brutal rounded-sm',
              'placeholder:text-ink-faded',
              'focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2',
              '[appearance:textfield]',
              '[&::-webkit-outer-spin-button]:appearance-none',
              '[&::-webkit-inner-spin-button]:appearance-none'
            )}
            min={1}
            max={999999}
          />
        </div>
      </div>

      {/* 追加ボタン */}
      <button
        type="submit"
        className={cn(
          'w-full py-3',
          'font-display text-lg tracking-wide',
          'bg-ink text-paper',
          'border-brutal rounded-sm',
          'shadow-brutal-sm',
          'hover-lift',
          'transition-all duration-150',
          'cursor-pointer'
        )}
      >
        追加する
      </button>
    </form>
  );
}

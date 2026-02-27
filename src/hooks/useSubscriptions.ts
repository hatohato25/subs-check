'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import { subscriptions as presetSubscriptions } from '@/data/subscriptions';
import {
  getCustomSubscriptions,
  getSelectedIds,
  setCustomSubscriptions,
  setSelectedIds,
} from '@/lib/storage';
import type { CustomSubscription } from '@/types/subscription';

/**
 * サブスクリプション管理フック
 *
 * - プリセットサブスクとカスタムサブスクを統合管理
 * - localStorageと同期
 * - 選択状態の管理
 * - 英語モード時は priceUsd が null のサービスを除外
 */
export function useSubscriptions() {
  const { locale } = useLocale();
  // SSR対策: クライアントサイドでのみlocalStorageを読み込む
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedIds, setSelectedIdsState] = useState<Set<string>>(new Set());
  const [customSubs, setCustomSubsState] = useState<CustomSubscription[]>([]);

  // 初期化（クライアントサイドでのみ実行）
  useEffect(() => {
    const storedIds = getSelectedIds();
    const storedCustom = getCustomSubscriptions();
    setSelectedIdsState(new Set(storedIds));
    setCustomSubsState(storedCustom);
    setIsHydrated(true);
  }, []);

  // WHY: 全サブスクリプション一覧をuseMemoで最適化
  //      英語モードでは priceUsd が null のサービスを除外（ただしカスタムサブスクは常に表示）
  const allSubscriptions = useMemo(() => {
    const combined = [...presetSubscriptions, ...customSubs];

    if (locale === 'en') {
      // WHY: カスタムサブスクは言語に関係なく常に表示、プリセットは priceUsd != null のみ表示
      return combined.filter((sub) => sub.category === 'custom' || sub.priceUsd != null);
    }

    return combined;
  }, [customSubs, locale]);

  // WHY: 言語切り替え時に、除外されたサービスを選択状態から削除
  //      例: 英語モードに切り替えると、Japan-exclusive サービス（priceUsd: null）が非表示になる
  useEffect(() => {
    if (!isHydrated) return;

    const validIds = new Set(allSubscriptions.map((sub) => sub.id));

    setSelectedIdsState((prev) => {
      const filtered = new Set(Array.from(prev).filter((id) => validIds.has(id)));

      // WHY: 選択状態が変更された場合のみlocalStorageを更新
      if (filtered.size !== prev.size) {
        setSelectedIds(Array.from(filtered));
      }

      return filtered;
    });
  }, [allSubscriptions, isHydrated]);

  // 選択状態をトグル
  const toggleSubscription = useCallback((id: string) => {
    setSelectedIdsState((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      // localStorageに保存
      setSelectedIds(Array.from(next));
      return next;
    });
  }, []);

  // カスタムサブスクを追加
  const addCustomSubscription = useCallback((sub: CustomSubscription) => {
    setCustomSubsState((prev) => {
      const next = [...prev, sub];
      // localStorageに保存
      setCustomSubscriptions(next);
      return next;
    });

    // 追加と同時に選択状態にする
    setSelectedIdsState((prev) => {
      const next = new Set(prev);
      next.add(sub.id);
      setSelectedIds(Array.from(next));
      return next;
    });
  }, []);

  // カスタムサブスクを削除
  const removeCustomSubscription = useCallback((id: string) => {
    setCustomSubsState((prev) => {
      const next = prev.filter((s) => s.id !== id);
      setCustomSubscriptions(next);
      return next;
    });

    // 選択状態からも削除
    setSelectedIdsState((prev) => {
      const next = new Set(prev);
      next.delete(id);
      setSelectedIds(Array.from(next));
      return next;
    });
  }, []);

  // 選択されたサブスクリプション一覧
  const selectedSubscriptions = allSubscriptions.filter((sub) => selectedIds.has(sub.id));

  // 合計金額
  // WHY: 英語モードでは priceUsd を使用して合計金額を計算
  const totalPrice = selectedSubscriptions.reduce((sum, sub) => {
    const price = locale === 'en' ? sub.priceUsd ?? sub.price : sub.price;
    return sum + price;
  }, 0);

  // WHY: カテゴリ別分類は計算コストがかかるため、useMemoで最適化
  //      allSubscriptionsが変更された時のみ再計算
  const subscriptionsByCategory = useMemo(
    () => ({
      video: allSubscriptions.filter((s) => s.category === 'video'),
      music: allSubscriptions.filter((s) => s.category === 'music'),
      software: allSubscriptions.filter((s) => s.category === 'software'),
      other: allSubscriptions.filter((s) => s.category === 'other'),
      custom: allSubscriptions.filter((s) => s.category === 'custom'),
    }),
    [allSubscriptions]
  );

  return {
    // 状態
    isHydrated,
    allSubscriptions,
    selectedIds,
    selectedSubscriptions,
    totalPrice,
    customSubscriptions: customSubs,
    subscriptionsByCategory,

    // アクション
    toggleSubscription,
    addCustomSubscription,
    removeCustomSubscription,

    // ヘルパー
    isSelected: (id: string) => selectedIds.has(id),
    selectedCount: selectedSubscriptions.length,
  };
}

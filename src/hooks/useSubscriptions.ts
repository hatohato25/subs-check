'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
 */
export function useSubscriptions() {
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
  //      customSubsが変更された時のみ再計算（presetSubscriptionsは固定値）
  const allSubscriptions = useMemo(() => [...presetSubscriptions, ...customSubs], [customSubs]);

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
  const totalPrice = selectedSubscriptions.reduce((sum, sub) => sum + sub.price, 0);

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

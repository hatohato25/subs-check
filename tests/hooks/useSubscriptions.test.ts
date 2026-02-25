import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { clearAllData } from '@/lib/storage';

describe('useSubscriptions', () => {
  beforeEach(() => {
    // 各テスト前にlocalStorageをクリア
    clearAllData();
  });

  it('should initialize with empty selection', async () => {
    const { result } = renderHook(() => useSubscriptions());

    // WHY: クライアントサイドのハイドレーション完了を待つ
    await waitFor(() => {
      expect(result.current.isHydrated).toBe(true);
    });

    // WHY: selectedIds は Set<string> なので、Array.from で配列に変換してから比較
    expect(Array.from(result.current.selectedIds)).toEqual([]);
    expect(result.current.totalPrice).toBe(0);
    expect(result.current.customSubscriptions).toEqual([]);
  });

  it('should load preset subscriptions', async () => {
    const { result } = renderHook(() => useSubscriptions());

    await waitFor(() => {
      expect(result.current.isHydrated).toBe(true);
    });

    expect(result.current.allSubscriptions.length).toBeGreaterThan(0);

    // プリセットサブスクが含まれていることを確認
    const hasNetflix = result.current.allSubscriptions.some((sub) => sub.name.includes('Netflix'));
    const hasSpotify = result.current.allSubscriptions.some((sub) => sub.name.includes('Spotify'));
    expect(hasNetflix).toBe(true);
    expect(hasSpotify).toBe(true);
  });

  it('should toggle subscription selection', async () => {
    const { result } = renderHook(() => useSubscriptions());

    await waitFor(() => {
      expect(result.current.isHydrated).toBe(true);
    });

    const spotifyId = result.current.allSubscriptions.find((sub) => sub.name.includes('Spotify'))?.id;
    expect(spotifyId).toBeDefined();

    if (!spotifyId) return;

    // 初期状態は未選択
    expect(result.current.isSelected(spotifyId)).toBe(false);

    // 選択
    act(() => {
      result.current.toggleSubscription(spotifyId);
    });

    await waitFor(() => {
      expect(result.current.isSelected(spotifyId)).toBe(true);
    });

    // 解除
    act(() => {
      result.current.toggleSubscription(spotifyId);
    });

    await waitFor(() => {
      expect(result.current.isSelected(spotifyId)).toBe(false);
    });
  });

  it('should calculate total price correctly', async () => {
    const { result } = renderHook(() => useSubscriptions());

    await waitFor(() => {
      expect(result.current.isHydrated).toBe(true);
    });

    const spotify = result.current.allSubscriptions.find((sub) => sub.name.includes('Spotify'));
    const netflixBasic = result.current.allSubscriptions.find(
      (sub) => sub.name === 'Netflix (広告つき)',
    );

    if (!spotify || !netflixBasic) return;

    // Spotify選択
    act(() => {
      result.current.toggleSubscription(spotify.id);
    });

    await waitFor(() => {
      expect(result.current.totalPrice).toBe(spotify.price);
    });

    // Netflix追加
    act(() => {
      result.current.toggleSubscription(netflixBasic.id);
    });

    await waitFor(() => {
      expect(result.current.totalPrice).toBe(spotify.price + netflixBasic.price);
    });

    // Spotify解除
    act(() => {
      result.current.toggleSubscription(spotify.id);
    });

    await waitFor(() => {
      expect(result.current.totalPrice).toBe(netflixBasic.price);
    });
  });

  it('should add custom subscription', async () => {
    const { result } = renderHook(() => useSubscriptions());

    await waitFor(() => {
      expect(result.current.isHydrated).toBe(true);
    });

    const initialCount = result.current.allSubscriptions.length;

    const customSub = {
      id: 'custom-test',
      name: 'My Service',
      nameEn: 'My Service',
      price: 500,
      category: 'custom' as const,
      isCustom: true as const,
      fallbackIcon: '📦',
      color: '#FF6F00',
    };

    // カスタムサブスク追加
    act(() => {
      result.current.addCustomSubscription(customSub);
    });

    await waitFor(() => {
      expect(result.current.allSubscriptions.length).toBe(initialCount + 1);
    });

    // 追加されたカスタムサブスクを確認
    const addedSub = result.current.allSubscriptions.find((sub) => sub.name === 'My Service');
    expect(addedSub).toBeDefined();
    expect(addedSub?.price).toBe(500);
    expect(addedSub?.category).toBe('custom');
    expect(addedSub?.fallbackIcon).toBe('📦');

    // 自動選択されていることを確認
    await waitFor(() => {
      expect(result.current.isSelected(customSub.id)).toBe(true);
    });

    // 合計金額に反映されていることを確認
    expect(result.current.totalPrice).toBe(500);
  });

  it('should remove custom subscription', async () => {
    const { result } = renderHook(() => useSubscriptions());

    await waitFor(() => {
      expect(result.current.isHydrated).toBe(true);
    });

    const customSub = {
      id: 'custom-test-remove',
      name: 'Test Service',
      nameEn: 'Test Service',
      price: 300,
      category: 'custom' as const,
      isCustom: true as const,
      fallbackIcon: '📦',
      color: '#FF6F00',
    };

    // カスタムサブスク追加
    act(() => {
      result.current.addCustomSubscription(customSub);
    });

    await waitFor(() => {
      const added = result.current.allSubscriptions.find((sub) => sub.name === 'Test Service');
      expect(added).toBeDefined();
    });

    const initialCount = result.current.allSubscriptions.length;

    // カスタムサブスク削除
    act(() => {
      result.current.removeCustomSubscription(customSub.id);
    });

    await waitFor(() => {
      expect(result.current.allSubscriptions.length).toBe(initialCount - 1);
    });

    // 削除されたことを確認
    const deletedSub = result.current.allSubscriptions.find((sub) => sub.id === customSub.id);
    expect(deletedSub).toBeUndefined();

    // 選択状態からも削除されていることを確認
    expect(result.current.isSelected(customSub.id)).toBe(false);
  });

  it('should persist selections across hook re-renders', async () => {
    const { result, unmount } = renderHook(() => useSubscriptions());

    await waitFor(() => {
      expect(result.current.isHydrated).toBe(true);
    });

    const spotifyId = result.current.allSubscriptions.find((sub) => sub.name.includes('Spotify'))?.id;
    if (!spotifyId) return;

    // 選択
    act(() => {
      result.current.toggleSubscription(spotifyId);
    });

    await waitFor(() => {
      expect(result.current.isSelected(spotifyId)).toBe(true);
    });

    // フックをアンマウント
    unmount();

    // 再度フックをマウント
    const { result: result2 } = renderHook(() => useSubscriptions());

    // 選択状態が保持されていることを確認
    await waitFor(() => {
      expect(result2.current.isHydrated).toBe(true);
    });

    await waitFor(() => {
      expect(result2.current.isSelected(spotifyId)).toBe(true);
    });
  });
});

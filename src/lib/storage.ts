import type { CustomSubscription } from '@/types/subscription';

// localStorage キー名
const SELECTED_IDS_KEY = 'subscheck-selected-subscriptions';
const CUSTOM_SUBSCRIPTIONS_KEY = 'subscheck-custom-subscriptions';

/**
 * localStorageが利用可能かチェック
 * SSR環境やプライベートブラウジングでは利用不可
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const testKey = '__subscheck_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// localStorage が利用不可の場合のフォールバック用メモリストレージ
const memoryStorage: {
  selectedIds: string[];
  customSubscriptions: CustomSubscription[];
} = {
  selectedIds: [],
  customSubscriptions: [],
};

/**
 * 選択されたサブスクIDの配列を取得
 *
 * @returns 選択されたサブスクIDの配列
 */
export function getSelectedIds(): string[] {
  if (!isLocalStorageAvailable()) {
    return memoryStorage.selectedIds;
  }

  try {
    const stored = localStorage.getItem(SELECTED_IDS_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      // データ形式が不正な場合は空配列を返す
      console.warn('Invalid data format in localStorage:', SELECTED_IDS_KEY);
      return [];
    }

    return parsed.filter((id) => typeof id === 'string');
  } catch (error) {
    console.error('Failed to read selected IDs from localStorage:', error);
    return [];
  }
}

/**
 * 選択されたサブスクIDの配列を保存
 *
 * @param ids - 保存するサブスクIDの配列
 */
export function setSelectedIds(ids: string[]): void {
  if (!isLocalStorageAvailable()) {
    memoryStorage.selectedIds = ids;
    return;
  }

  try {
    localStorage.setItem(SELECTED_IDS_KEY, JSON.stringify(ids));
  } catch (error) {
    // localStorage容量超過などのエラー時はメモリに保存
    console.error('Failed to save selected IDs to localStorage:', error);
    memoryStorage.selectedIds = ids;
  }
}

/**
 * カスタムサブスクリプション一覧を取得
 *
 * @returns カスタムサブスクの配列
 */
export function getCustomSubscriptions(): CustomSubscription[] {
  if (!isLocalStorageAvailable()) {
    return memoryStorage.customSubscriptions;
  }

  try {
    const stored = localStorage.getItem(CUSTOM_SUBSCRIPTIONS_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      console.warn('Invalid data format in localStorage:', CUSTOM_SUBSCRIPTIONS_KEY);
      return [];
    }

    // 型ガード: CustomSubscription の必須フィールドを持つかチェック
    return parsed.filter((item): item is CustomSubscription => {
      return (
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.nameEn === 'string' &&
        typeof item.price === 'number' &&
        item.category === 'custom' &&
        item.isCustom === true &&
        typeof item.fallbackIcon === 'string' &&
        typeof item.color === 'string'
      );
    });
  } catch (error) {
    console.error('Failed to read custom subscriptions from localStorage:', error);
    return [];
  }
}

/**
 * カスタムサブスクリプション一覧を保存
 *
 * @param subscriptions - 保存するカスタムサブスクの配列
 */
export function setCustomSubscriptions(subscriptions: CustomSubscription[]): void {
  if (!isLocalStorageAvailable()) {
    memoryStorage.customSubscriptions = subscriptions;
    return;
  }

  try {
    localStorage.setItem(CUSTOM_SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
  } catch (error) {
    console.error('Failed to save custom subscriptions to localStorage:', error);
    memoryStorage.customSubscriptions = subscriptions;
  }
}

/**
 * 全てのSubsCheckデータをクリア
 * テスト用またはリセット機能で使用
 */
export function clearAllData(): void {
  if (!isLocalStorageAvailable()) {
    memoryStorage.selectedIds = [];
    memoryStorage.customSubscriptions = [];
    return;
  }

  try {
    localStorage.removeItem(SELECTED_IDS_KEY);
    localStorage.removeItem(CUSTOM_SUBSCRIPTIONS_KEY);
  } catch (error) {
    console.error('Failed to clear data from localStorage:', error);
  }
}

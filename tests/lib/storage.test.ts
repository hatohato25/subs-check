import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearAllData,
  getCustomSubscriptions,
  getSelectedIds,
  setCustomSubscriptions,
  setSelectedIds,
} from '@/lib/storage';
import type { CustomSubscription } from '@/types/subscription';

describe('storage', () => {
  beforeEach(() => {
    // 各テスト前にlocalStorageをクリア
    localStorage.clear();
  });

  describe('getSelectedIds / setSelectedIds', () => {
    it('should return empty array when no data stored', () => {
      expect(getSelectedIds()).toEqual([]);
    });

    it('should store and retrieve subscription IDs', () => {
      const ids = ['netflix', 'spotify', 'youtube-premium'];
      setSelectedIds(ids);
      expect(getSelectedIds()).toEqual(ids);
    });

    it('should overwrite existing data', () => {
      setSelectedIds(['netflix', 'spotify']);
      setSelectedIds(['hulu']);
      expect(getSelectedIds()).toEqual(['hulu']);
    });

    it('should handle empty array', () => {
      setSelectedIds(['netflix']);
      setSelectedIds([]);
      expect(getSelectedIds()).toEqual([]);
    });

    it('should filter out non-string values', () => {
      // 直接localStorageに不正データを挿入
      localStorage.setItem(
        'subscheck-selected-subscriptions',
        JSON.stringify(['netflix', 123, null, 'spotify']),
      );
      expect(getSelectedIds()).toEqual(['netflix', 'spotify']);
    });

    it('should return empty array for invalid JSON', () => {
      localStorage.setItem('subscheck-selected-subscriptions', 'invalid-json');
      expect(getSelectedIds()).toEqual([]);
    });

    it('should return empty array for non-array data', () => {
      localStorage.setItem('subscheck-selected-subscriptions', JSON.stringify({ foo: 'bar' }));
      expect(getSelectedIds()).toEqual([]);
    });
  });

  describe('getCustomSubscriptions / setCustomSubscriptions', () => {
    it('should return empty array when no data stored', () => {
      expect(getCustomSubscriptions()).toEqual([]);
    });

    it('should store and retrieve custom subscriptions', () => {
      const customSubs: CustomSubscription[] = [
        {
          id: 'custom-1',
          name: 'My Service',
          nameEn: 'My Service',
          price: 500,
          category: 'custom',
          fallbackIcon: '📦',
          color: '#6B7280',
          isCustom: true,
        },
        {
          id: 'custom-2',
          name: '自作サービス',
          nameEn: 'Custom Service',
          price: 1000,
          category: 'custom',
          fallbackIcon: '🔧',
          color: '#FF0000',
          isCustom: true,
        },
      ];

      setCustomSubscriptions(customSubs);
      expect(getCustomSubscriptions()).toEqual(customSubs);
    });

    it('should overwrite existing data', () => {
      const firstSubs: CustomSubscription[] = [
        {
          id: 'custom-1',
          name: 'Service 1',
          nameEn: 'Service 1',
          price: 100,
          category: 'custom',
          fallbackIcon: '📦',
          color: '#000000',
          isCustom: true,
        },
      ];

      const secondSubs: CustomSubscription[] = [
        {
          id: 'custom-2',
          name: 'Service 2',
          nameEn: 'Service 2',
          price: 200,
          category: 'custom',
          fallbackIcon: '🎁',
          color: '#FFFFFF',
          isCustom: true,
        },
      ];

      setCustomSubscriptions(firstSubs);
      setCustomSubscriptions(secondSubs);
      expect(getCustomSubscriptions()).toEqual(secondSubs);
    });

    it('should handle empty array', () => {
      const subs: CustomSubscription[] = [
        {
          id: 'custom-1',
          name: 'Test',
          nameEn: 'Test',
          price: 100,
          category: 'custom',
          fallbackIcon: '📦',
          color: '#000000',
          isCustom: true,
        },
      ];

      setCustomSubscriptions(subs);
      setCustomSubscriptions([]);
      expect(getCustomSubscriptions()).toEqual([]);
    });

    it('should filter out invalid custom subscriptions', () => {
      // 不正なデータを直接挿入
      localStorage.setItem(
        'subscheck-custom-subscriptions',
        JSON.stringify([
          {
            id: 'custom-valid',
            name: 'Valid',
            nameEn: 'Valid',
            price: 100,
            category: 'custom',
            fallbackIcon: '📦',
            color: '#000000',
            isCustom: true,
          },
          {
            // id が欠落
            name: 'Invalid',
            price: 100,
            category: 'custom',
          },
          {
            // category が custom ではない
            id: 'custom-invalid',
            name: 'Invalid',
            nameEn: 'Invalid',
            price: 100,
            category: 'video',
            fallbackIcon: '📦',
            color: '#000000',
            isCustom: true,
          },
        ]),
      );

      const result = getCustomSubscriptions();
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('custom-valid');
    });

    it('should return empty array for invalid JSON', () => {
      localStorage.setItem('subscheck-custom-subscriptions', 'invalid-json');
      expect(getCustomSubscriptions()).toEqual([]);
    });

    it('should return empty array for non-array data', () => {
      localStorage.setItem('subscheck-custom-subscriptions', JSON.stringify({ foo: 'bar' }));
      expect(getCustomSubscriptions()).toEqual([]);
    });
  });

  describe('clearAllData', () => {
    it('should clear all SubsCheck data from localStorage', () => {
      setSelectedIds(['netflix', 'spotify']);
      setCustomSubscriptions([
        {
          id: 'custom-1',
          name: 'Test',
          nameEn: 'Test',
          price: 100,
          category: 'custom',
          fallbackIcon: '📦',
          color: '#000000',
          isCustom: true,
        },
      ]);

      clearAllData();

      expect(getSelectedIds()).toEqual([]);
      expect(getCustomSubscriptions()).toEqual([]);
    });

    it('should not affect other localStorage keys', () => {
      localStorage.setItem('other-key', 'other-value');
      setSelectedIds(['netflix']);

      clearAllData();

      expect(localStorage.getItem('other-key')).toBe('other-value');
    });
  });
});

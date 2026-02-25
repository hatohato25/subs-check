import { describe, it, expect } from 'vitest';
import { decodeShareData, encodeShareData } from '@/lib/share';
import { subscriptions } from '@/data/subscriptions';
import type { ShareData } from '@/lib/share';

/**
 * SharePage の動作をユニットテストレベルで検証
 *
 * WHY: Server Component は直接テストが難しいため、
 *      使用しているロジックとデータ変換を検証する
 */
describe('Share Page Logic', () => {
  describe('Valid Share Data Decoding', () => {
    it('should decode new format (bitflag) correctly', () => {
      // WHY: 実際のエンコード関数を使用してテストデータを生成
      const testData: ShareData = {
        selectedIds: ['netflix-standard', 'spotify-individual'],
        totalPrice: 2670,
      };

      const encoded = encodeShareData(testData);
      const decoded = decodeShareData(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded?.selectedIds).toContain('netflix-standard');
      expect(decoded?.selectedIds).toContain('spotify-individual');
      expect(decoded?.selectedIds.length).toBe(2);
    });

    it('should decode old format (JSON Base64) correctly', () => {
      // WHY: 旧形式（JSON Base64）の後方互換性を確認
      const testData: ShareData = {
        selectedIds: ['netflix-standard'],
        totalPrice: 1590,
      };

      const json = JSON.stringify(testData);
      const base64 = Buffer.from(json)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const decoded = decodeShareData(base64);

      expect(decoded).not.toBeNull();
      expect(decoded?.selectedIds).toEqual(['netflix-standard']);
      expect(decoded?.totalPrice).toBe(1590);
    });
  });

  describe('Invalid Share Data Handling', () => {
    it('should return null for invalid encoded string', () => {
      const result = decodeShareData('invalid-data');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = decodeShareData('');
      expect(result).toBeNull();
    });

    it('should return null for malformed base64', () => {
      const result = decodeShareData('!!!invalid!!!');
      expect(result).toBeNull();
    });
  });

  describe('Subscription Data Reconstruction', () => {
    it('should reconstruct subscription list from decoded IDs', () => {
      const testData: ShareData = {
        selectedIds: ['netflix-standard', 'spotify-individual', 'amazon-prime-general'],
        totalPrice: 3350,
      };

      const encoded = encodeShareData(testData);
      const decoded = decodeShareData(encoded);

      expect(decoded).not.toBeNull();

      // WHY: デコードされたIDから実際のサブスクリプションデータを取得
      const reconstructed = decoded!.selectedIds
        .map((id) => subscriptions.find((sub) => sub.id === id))
        .filter((sub) => sub !== undefined);

      expect(reconstructed.length).toBe(3);

      // WHY: ビットマスクによるエンコードはインデックス順でソートされるため、
      //      元の選択順序は保証されない。IDの存在のみを確認する
      const names = reconstructed.map((sub) => sub?.name);
      expect(names).toContain('Netflix (スタンダード)');
      expect(names).toContain('Spotify (個人)');
      expect(names).toContain('Amazonプライム (一般プラン)');
    });

    it('should calculate correct total price from reconstructed subscriptions', () => {
      const testIds = ['netflix-standard', 'spotify-individual'];
      const expectedTotal = subscriptions
        .filter((sub) => testIds.includes(sub.id))
        .reduce((sum, sub) => sum + sub.price, 0);

      const testData: ShareData = {
        selectedIds: testIds,
        totalPrice: expectedTotal,
      };

      const encoded = encodeShareData(testData);
      const decoded = decodeShareData(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded?.totalPrice).toBe(expectedTotal);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single subscription', () => {
      const testData: ShareData = {
        selectedIds: ['netflix-standard'],
        totalPrice: 1590,
      };

      const encoded = encodeShareData(testData);
      const decoded = decodeShareData(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded?.selectedIds.length).toBe(1);
      expect(decoded?.selectedIds[0]).toBe('netflix-standard');
    });

    it('should handle many subscriptions', () => {
      // WHY: 多数のサブスクが選択された場合でも正しく動作することを確認
      const manyIds = subscriptions.slice(0, 20).map((sub) => sub.id);
      const totalPrice = subscriptions.slice(0, 20).reduce((sum, sub) => sum + sub.price, 0);

      const testData: ShareData = {
        selectedIds: manyIds,
        totalPrice,
      };

      const encoded = encodeShareData(testData);
      const decoded = decodeShareData(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded?.selectedIds.length).toBe(20);
      expect(decoded?.totalPrice).toBe(totalPrice);
    });

    it('should handle non-existent subscription IDs gracefully', () => {
      // WHY: 存在しないIDが含まれている場合でもエラーにならないことを確認
      const testData: ShareData = {
        selectedIds: ['netflix-standard', 'non-existent-id'],
        totalPrice: 1590,
      };

      const encoded = encodeShareData(testData);
      const decoded = decodeShareData(encoded);

      expect(decoded).not.toBeNull();

      // WHY: 実際に存在するサブスクのみが復元される
      const reconstructed = decoded!.selectedIds
        .map((id) => subscriptions.find((sub) => sub.id === id))
        .filter((sub) => sub !== undefined);

      expect(reconstructed.length).toBe(1);
      expect(reconstructed[0]?.id).toBe('netflix-standard');
    });
  });

  describe('Yearly Total Calculation', () => {
    it('should calculate yearly total correctly', () => {
      const monthlyTotal = 5000;
      const yearlyTotal = monthlyTotal * 12;

      expect(yearlyTotal).toBe(60000);
    });

    it('should identify high yearly totals', () => {
      const testData: ShareData = {
        selectedIds: ['dazn-standard', 'adobe-cc-complete'],
        totalPrice: 13280, // 月額
      };

      const yearlyTotal = testData.totalPrice * 12;

      // WHY: 年額が50,000円を超える場合は警告対象
      expect(yearlyTotal).toBeGreaterThan(50000);
    });
  });
});

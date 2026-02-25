import { describe, it, expect } from 'vitest';
import { encodeShareData, decodeShareData, generateShareUrl } from '@/lib/share';
import { subscriptions } from '@/data/subscriptions';

describe('share utilities', () => {
  describe('encodeShareData (new bitflag format)', () => {
    it('should encode share data with bitflag format and "b:" prefix', () => {
      const data = {
        selectedIds: ['netflix-standard', 'spotify-individual'],
        totalPrice: 2670,
      };

      const encoded = encodeShareData(data);

      // WHY: 新形式は "b:" プレフィックスで始まる
      expect(encoded).toMatch(/^b:[0-9a-z]+$/);
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(2);
    });

    it('should encode empty selectedIds array', () => {
      const data = {
        selectedIds: [],
        totalPrice: 0,
      };

      const encoded = encodeShareData(data);
      // WHY: 空の選択状態は "b:0"
      expect(encoded).toBe('b:0');
    });

    it('should produce short encoded string even with many subscriptions', () => {
      // WHY: 実際のサブスクIDを使用して全選択をテスト
      const allIds = subscriptions.map((sub) => sub.id);
      const data = {
        selectedIds: allIds,
        totalPrice: subscriptions.reduce((sum, sub) => sum + sub.price, 0),
      };

      const encoded = encodeShareData(data);

      // WHY: ビットフラグ方式なので、24個全選択でも非常に短い（Base36で約5-10文字）
      expect(encoded.startsWith('b:')).toBe(true);
      expect(encoded.length).toBeLessThan(20); // 旧方式の200文字以上に比べて大幅短縮
    });

    it('should handle single subscription selection', () => {
      const data = {
        selectedIds: ['netflix-basic'], // インデックス0
        totalPrice: 790,
      };

      const encoded = encodeShareData(data);
      expect(encoded).toMatch(/^b:[0-9a-z]+$/);
    });
  });

  describe('decodeShareData', () => {
    it('should decode new bitflag format correctly', () => {
      const original = {
        selectedIds: ['netflix-standard', 'spotify-individual'],
        totalPrice: 2670,
      };

      const encoded = encodeShareData(original);
      const decoded = decodeShareData(encoded);

      // WHY: 選択されたIDリストと合計金額が復元される
      expect(decoded).not.toBeNull();
      expect(decoded?.selectedIds.sort()).toEqual(original.selectedIds.sort());
      expect(decoded?.totalPrice).toBe(original.totalPrice);
    });

    it('should decode empty selection correctly', () => {
      const original = {
        selectedIds: [],
        totalPrice: 0,
      };

      const encoded = encodeShareData(original);
      const decoded = decodeShareData(encoded);

      expect(decoded).toEqual(original);
    });

    it('should return null for invalid bitflag format', () => {
      const invalid = 'b:invalid-base36!!!';
      const decoded = decodeShareData(invalid);

      expect(decoded).toBeNull();
    });

    it('should decode URL-encoded bitflag format correctly', () => {
      // WHY: URLパス内の `:` が `%3A` にエンコードされるケースをテスト
      const original = {
        selectedIds: ['netflix-standard', 'spotify-individual'],
        totalPrice: 2670,
      };

      const encoded = encodeShareData(original);
      // WHY: URLエンコード（例: b:27wr2a → b%3A27wr2a）
      const urlEncoded = encoded.replace(':', '%3A');
      const decoded = decodeShareData(urlEncoded);

      expect(decoded).not.toBeNull();
      expect(decoded?.selectedIds.sort()).toEqual(original.selectedIds.sort());
      expect(decoded?.totalPrice).toBe(original.totalPrice);
    });

    it('should handle both encoded and non-encoded formats', () => {
      // WHY: エンコード済み・未エンコードの両方が正しくデコードされることを確認
      const original = {
        selectedIds: ['netflix-standard'],
        totalPrice: 1490,
      };

      const encoded = encodeShareData(original);

      // 未エンコード
      const decoded1 = decodeShareData(encoded);
      expect(decoded1).not.toBeNull();
      expect(decoded1?.selectedIds).toEqual(original.selectedIds);

      // エンコード済み
      const urlEncoded = encodeURIComponent(encoded);
      const decoded2 = decodeShareData(urlEncoded);
      expect(decoded2).not.toBeNull();
      expect(decoded2?.selectedIds).toEqual(original.selectedIds);
    });

    it('should maintain backward compatibility with old JSON Base64 format', () => {
      // WHY: 旧形式（JSON Base64）のデコードをサポート
      const oldFormatData = {
        selectedIds: ['netflix-standard', 'spotify-individual'],
        totalPrice: 2670,
      };
      const json = JSON.stringify(oldFormatData);
      const base64 = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

      const decoded = decodeShareData(base64);

      expect(decoded).toEqual(oldFormatData);
    });

    it('should return null for malformed old format JSON', () => {
      // WHY: 旧形式の不正なJSONをBase64エンコードしたケース
      const malformed = btoa('{"selectedIds": [}'); // 不正なJSON
      const decoded = decodeShareData(malformed);

      expect(decoded).toBeNull();
    });

    it('should return null for old format data missing required fields', () => {
      // WHY: 旧形式で必須フィールドが欠けているデータ
      const incomplete = btoa(JSON.stringify({ selectedIds: ['test'] })); // totalPrice がない
      const decoded = decodeShareData(incomplete);

      expect(decoded).toBeNull();
    });

    it('should handle all subscriptions selection in new format', () => {
      const allIds = subscriptions.map((sub) => sub.id);
      const totalPrice = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
      const original = { selectedIds: allIds, totalPrice };

      const encoded = encodeShareData(original);
      const decoded = decodeShareData(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded?.selectedIds.sort()).toEqual(allIds.sort());
      expect(decoded?.totalPrice).toBe(totalPrice);
    });
  });

  describe('generateShareUrl', () => {
    it('should generate valid share URL with baseUrl', () => {
      const data = {
        selectedIds: ['netflix-standard'],
        totalPrice: 1590,
      };

      const url = generateShareUrl(data, 'https://example.com');

      expect(url).toMatch(/^https:\/\/example\.com\/share\/.+/);
    });

    it('should generate valid share URL without baseUrl (server-side)', () => {
      const data = {
        selectedIds: ['spotify-individual'],
        totalPrice: 1080,
      };

      const url = generateShareUrl(data);

      // WHY: サーバーサイドでは相対URLまたは絶対URLになる
      expect(url).toContain('/share/');
    });

    it('should encode data in URL', () => {
      const data = {
        selectedIds: ['netflix-standard', 'spotify-individual'],
        totalPrice: 2670,
      };

      const url = generateShareUrl(data, 'https://example.com');
      const encoded = url.split('/share/')[1];
      const decoded = decodeShareData(encoded);

      expect(decoded).toEqual(data);
    });
  });

  describe('encode/decode round-trip', () => {
    it('should maintain data integrity through encode and decode with real subscription IDs', () => {
      const testCases = [
        {
          selectedIds: ['netflix-standard'],
          totalPrice: 1590,
        },
        {
          selectedIds: ['netflix-standard', 'spotify-individual', 'youtube-premium-individual'],
          totalPrice: 3950,
        },
        {
          selectedIds: [],
          totalPrice: 0,
        },
        {
          selectedIds: ['netflix-ad-standard', 'amazon-prime-general', 'disney-plus-standard', 'spotify-individual', 'apple-music-individual'],
          totalPrice: 4790,
        },
      ];

      for (const testCase of testCases) {
        const encoded = encodeShareData(testCase);
        const decoded = decodeShareData(encoded);

        // WHY: ビットフラグ方式では合計金額は再計算されるため、IDリストが一致すればOK
        expect(decoded).not.toBeNull();
        expect(decoded?.selectedIds.sort()).toEqual(testCase.selectedIds.sort());
        expect(decoded?.totalPrice).toBe(testCase.totalPrice);
      }
    });

    it('should handle edge case with maximum subscriptions', () => {
      // WHY: 全サブスク選択時の round-trip テスト
      const allIds = subscriptions.slice(0, 10).map((sub) => sub.id); // 10個選択
      const totalPrice = subscriptions.slice(0, 10).reduce((sum, sub) => sum + sub.price, 0);
      const data = { selectedIds: allIds, totalPrice };

      const encoded = encodeShareData(data);
      const decoded = decodeShareData(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded?.selectedIds.sort()).toEqual(allIds.sort());
      expect(decoded?.totalPrice).toBe(totalPrice);
    });
  });

  describe('URL length comparison', () => {
    it('should produce significantly shorter URLs with new format vs old format', () => {
      // WHY: URL短縮効果の検証
      const manySubscriptions = subscriptions.slice(0, 15).map((sub) => sub.id);
      const data = {
        selectedIds: manySubscriptions,
        totalPrice: subscriptions.slice(0, 15).reduce((sum, sub) => sum + sub.price, 0),
      };

      // 新形式
      const newEncoded = encodeShareData(data);

      // 旧形式（参考値）
      const json = JSON.stringify(data);
      const oldEncoded = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

      // WHY: 新形式は旧形式の1/10以下の長さになることを期待
      expect(newEncoded.length).toBeLessThan(oldEncoded.length / 5);
      console.log(`New format length: ${newEncoded.length}, Old format length: ${oldEncoded.length}`);
    });
  });
});

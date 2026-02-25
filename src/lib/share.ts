/**
 * シェア機能のユーティリティ
 *
 * 選択状態をURLセーフな文字列にエンコード/デコードする
 *
 * WHY: 新方式（ビットフラグ）と旧方式（JSON Base64）の両方をサポート
 * - 新方式: サブスクの選択状態をビットマスクで表現し、Base36エンコード（大幅なURL短縮）
 * - 旧方式: 後方互換性のため、旧形式のデコードもサポート
 */

import { subscriptions } from '@/data/subscriptions';

/**
 * シェアデータの型定義
 */
export type ShareData = {
  /** 選択されたサブスクIDの配列 */
  selectedIds: string[];
  /** 合計金額 */
  totalPrice: number;
};

/**
 * サブスクIDから固定インデックスを取得
 *
 * WHY: ビットフラグ方式で選択状態を表現するため、各IDに固定の位置を割り当てる
 *
 * @param id - サブスクID
 * @returns インデックス（0始まり）、見つからない場合は-1
 */
function getSubscriptionIndex(id: string): number {
  return subscriptions.findIndex((sub) => sub.id === id);
}

/**
 * 固定インデックスからサブスクIDを取得
 *
 * @param index - インデックス（0始まり）
 * @returns サブスクID、範囲外の場合はnull
 */
function getSubscriptionId(index: number): string | null {
  return subscriptions[index]?.id ?? null;
}

/**
 * 選択状態をビットフラグ方式でエンコード（新方式）
 *
 * WHY: URL長を大幅に短縮するため、各サブスクの選択状態を1ビットで表現
 * 例: 24個のサブスク → 24ビット → Base36で約5文字程度
 *
 * @param data - シェアデータ（選択ID配列と合計金額）
 * @returns Base36エンコードされた短い文字列（プレフィックス "b:" 付き）
 *
 * @example
 * const encoded = encodeShareData({ selectedIds: ['netflix-standard', 'spotify'], totalPrice: 2470 });
 * // => "b:abc123" （大幅に短縮）
 */
export function encodeShareData(data: ShareData): string {
  // WHY: ビットマスクを構築（選択されたサブスクの位置に対応するビットを立てる）
  let bitMask = 0n; // BigIntを使用（JavaScriptのnumberは53ビットまでしか正確に扱えないため）

  for (const id of data.selectedIds) {
    const index = getSubscriptionIndex(id);
    if (index !== -1) {
      // WHY: インデックス位置のビットを立てる（OR演算）
      bitMask |= 1n << BigInt(index);
    }
  }

  // WHY: Base36（0-9, a-z）でエンコードして文字列化
  const encoded = bitMask.toString(36);

  // WHY: 新形式であることを示すプレフィックスを付与（旧形式との区別のため）
  return `b:${encoded}`;
}

/**
 * ビットフラグ方式でデコード（新方式）
 *
 * WHY: エンコードされたビットマスクから選択IDリストを復元
 *
 * @param encoded - Base36エンコードされた文字列（プレフィックス "b:" なし）
 * @returns デコードされたシェアデータ、失敗時はnull
 */
function decodeBitflagFormat(encoded: string): ShareData | null {
  try {
    // WHY: Base36として有効な文字列かチェック（0-9, a-z のみ許可）
    if (!/^[0-9a-z]+$/.test(encoded)) {
      return null;
    }

    // WHY: Base36文字列を直接BigIntに変換
    // Number.parseIntでは53ビット以上の数値を正確に扱えないため、BigIntで手動パース
    let bitMask = 0n;
    for (let i = 0; i < encoded.length; i++) {
      const char = encoded[i];
      const digit =
        char >= '0' && char <= '9'
          ? char.charCodeAt(0) - 48 // '0' = 48
          : char.charCodeAt(0) - 87; // 'a' = 97, 97 - 87 = 10

      bitMask = bitMask * 36n + BigInt(digit);
    }

    const selectedIds: string[] = [];
    let totalPrice = 0;

    // WHY: 各ビットをチェックし、立っているビットに対応するサブスクIDを復元
    for (let i = 0; i < subscriptions.length; i++) {
      if ((bitMask & (1n << BigInt(i))) !== 0n) {
        const id = getSubscriptionId(i);
        if (id) {
          selectedIds.push(id);
          totalPrice += subscriptions[i].price;
        }
      }
    }

    return { selectedIds, totalPrice };
  } catch (error) {
    console.error('Failed to decode bitflag format:', error);
    return null;
  }
}

/**
 * JSON Base64方式でデコード（旧方式、後方互換性用）
 *
 * WHY: 既存のシェアURLをサポートするため、旧形式のデコードも維持
 *
 * @param encoded - Base64エンコードされたURLセーフな文字列
 * @returns デコードされたシェアデータ、失敗時はnull
 */
function decodeJsonBase64Format(encoded: string): ShareData | null {
  try {
    // WHY: URLセーフ文字列をBase64に戻す（-, _, パディング補完）
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    const json = atob(paddedBase64);
    const data = JSON.parse(json) as ShareData;

    // WHY: 最低限のバリデーション（必須フィールドの存在確認）
    if (!Array.isArray(data.selectedIds) || typeof data.totalPrice !== 'number') {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to decode JSON Base64 format:', error);
    return null;
  }
}

/**
 * エンコードされた文字列をデコードしてシェアデータに変換
 *
 * WHY: 新旧両方の形式を自動判別してデコード
 * - "b:" で始まる場合: 新方式（ビットフラグ）
 * - それ以外: 旧方式（JSON Base64）
 *
 * @param encoded - エンコードされた文字列（URLエンコード済みでも可）
 * @returns デコードされたシェアデータ、失敗時はnull
 *
 * @example
 * // 新形式
 * const data1 = decodeShareData("b:abc123");
 * const data2 = decodeShareData("b%3Aabc123"); // URLエンコード済みでもOK
 * // 旧形式（後方互換性）
 * const data3 = decodeShareData("eyJzZWxlY3RlZElkcyI6WyJuZXRmbGl4LXN0YW5kYXJkIl0sInRvdGFsUHJpY2UiOjE0OTB9");
 */
export function decodeShareData(encoded: string): ShareData | null {
  // WHY: URLエンコードされた文字列をデコード（例: b%3A27wr2a → b:27wr2a）
  // `:` が `%3A` にエンコードされている場合に対応
  const decoded = decodeURIComponent(encoded);

  // WHY: 新形式のプレフィックスチェック
  if (decoded.startsWith('b:')) {
    return decodeBitflagFormat(decoded.slice(2));
  }

  // WHY: 旧形式として処理（後方互換性）
  return decodeJsonBase64Format(decoded);
}

/**
 * シェアURLを生成
 *
 * WHY: 選択状態をエンコードしてシェア用URLを作成
 *
 * @param data - シェアデータ
 * @param baseUrl - ベースURL（デフォルト: 現在のオリジン）
 * @returns シェアページのURL
 *
 * @example
 * const url = generateShareUrl({ selectedIds: ['netflix-standard'], totalPrice: 1490 });
 * // => "https://example.com/share/eyJzZWxlY3RlZElkcyI6WyJuZXRmbGl4LXN0YW5kYXJkIl0sInRvdGFsUHJpY2UiOjE0OTB9"
 */
export function generateShareUrl(data: ShareData, baseUrl?: string): string {
  const encoded = encodeShareData(data);
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${origin}/share/${encoded}`;
}

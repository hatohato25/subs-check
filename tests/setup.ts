import '@testing-library/jest-dom';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// WHY: localStorage のモックを設定（jsdomでグローバルに設定されていない場合の対策）
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

// WHY: グローバルに localStorage を設定
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// WHY: 各テスト前にlocalStorageをクリア
beforeEach(() => {
  localStorageMock.clear();
});

// WHY: 各テスト後にReactコンポーネントを自動クリーンアップ
afterEach(() => {
  cleanup();
});

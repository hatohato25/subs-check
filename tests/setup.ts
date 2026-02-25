import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// WHY: 各テスト後にReactコンポーネントを自動クリーンアップ
afterEach(() => {
  cleanup();
});

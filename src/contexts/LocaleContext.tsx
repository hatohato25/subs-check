'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

/**
 * サポートする言語
 */
export type Locale = 'ja' | 'en';

/**
 * LocaleContext の型定義
 */
type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'subscheck-locale';

/**
 * LocaleProvider
 *
 * WHY: アプリ全体の言語状態を管理し、localStorageに永続化する
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ja');
  const [isHydrated, setIsHydrated] = useState(false);

  // 初期化: localStorageから言語設定を読み込む
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored === 'ja' || stored === 'en') {
        setLocaleState(stored);
      }
    } catch (error) {
      console.error('Failed to read locale from localStorage:', error);
    }

    setIsHydrated(true);
  }, []);

  // 言語変更時にlocalStorageに保存
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);

    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch (error) {
      console.error('Failed to save locale to localStorage:', error);
    }
  }, []);

  // WHY: ハイドレーション完了前は children を表示しない
  //      これにより、SSR と CSR の不一致を回避する
  if (!isHydrated) {
    return null;
  }

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

/**
 * useLocale フック
 *
 * WHY: コンポーネント内で locale と setLocale を取得するためのフック
 */
export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}

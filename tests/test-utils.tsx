import type { RenderHookOptions, RenderOptions } from '@testing-library/react';
import { render, renderHook } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { LocaleProvider } from '@/contexts/LocaleContext';

/**
 * テスト用のラッパーコンポーネント
 *
 * WHY: LocaleProviderなど、テストに必要なプロバイダーをラップする
 */
function AllTheProviders({ children }: { children: ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}

/**
 * カスタムrender関数
 *
 * WHY: 全てのプロバイダーをラップした状態でコンポーネントをレンダリングする
 */
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

/**
 * カスタムrenderHook関数
 *
 * WHY: 全てのプロバイダーをラップした状態でフックをレンダリングする
 */
function customRenderHook<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, 'wrapper'>
) {
  return renderHook(hook, { wrapper: AllTheProviders, ...options });
}

// re-export everything
export * from '@testing-library/react';
// override render with custom render
export { customRender as render, customRenderHook as renderHook };

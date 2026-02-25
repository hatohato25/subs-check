import type { ComponentProps } from 'react';

// WHY: Next.js の Image コンポーネントのモック
// テスト環境では画像の最適化は不要なので、通常のimgタグとして扱う
export default function MockImage({ src, alt, width, height, ...props }: ComponentProps<'img'>) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src as string} alt={alt} width={width} height={height} {...props} />;
}

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // 画像最適化の設定
  images: {
    formats: ['image/avif', 'image/webp'],
    // WHY: faviconなどの小さい画像にも最適化を適用
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // WHY: アイコン画像のキャッシュを最適化
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30日
  },

  // 環境変数の公開設定
  env: {
    NEXT_PUBLIC_APP_NAME: 'SubsCheck',
  },

  // WHY: @resvg/resvg-js のようなネイティブモジュールをサポートするため、
  // serverExternalPackagesに指定してバンドルから除外
  serverExternalPackages: ['@resvg/resvg-js'],

  // WHY: 本番環境でのパフォーマンス最適化
  compiler: {
    // WHY: console.logなどのデバッグログを本番環境で削除
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // WHY: 未使用のエクスポートを検出してバンドルサイズを削減
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
};

export default nextConfig;

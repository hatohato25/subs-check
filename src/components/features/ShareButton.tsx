'use client';

import { domToBlob } from 'modern-screenshot';
import { Camera, Check, Download, Loader2, Share2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { formatPrice } from '@/lib/format';
import { generateShareUrl } from '@/lib/share';
import { cn } from '@/lib/utils';
import type { Subscription } from '@/types/subscription';

type Props = {
  selectedSubscriptions: Subscription[];
  total: number;
  receiptRef: React.RefObject<HTMLDivElement | null>;
};

type ShareState = 'idle' | 'loading' | 'copied' | 'downloaded' | 'error';

/**
 * RECEIPTコンポーネントのスクリーンショットを撮影
 * WHY: modern-screenshotを使用してDOMを画像化
 *      html2canvasはoklab()カラー関数をサポートしていないため、
 *      modern-screenshotに移行
 */
async function captureReceiptImage(element: HTMLDivElement): Promise<Blob> {
  const blob = await domToBlob(element, {
    scale: 2, // 高解像度化
    backgroundColor: '#FDFCFB', // paper色
    style: {
      // アニメーションを無効化してキャプチャの安定性を向上
      animation: 'none',
      transition: 'none',
    },
  });

  if (!blob) {
    throw new Error('画像の生成に失敗しました');
  }

  return blob;
}

/**
 * シェアテキストを生成
 */
function generateShareText(subscriptions: Subscription[], total: number): string {
  const subscriptionList = subscriptions
    .slice(0, 5)
    .map((s) => `${s.fallbackIcon} ${s.name}`)
    .join('\n');

  const moreText = subscriptions.length > 5 ? `\n...他${subscriptions.length - 5}件` : '';

  return `私の月額サブスク合計は${formatPrice(total)}でした！\n\n${subscriptionList}${moreText}\n\n#SubsCheck`;
}

/**
 * Blobをダウンロード
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * シェアボタンコンポーネント
 *
 * RECEIPTコンポーネントのスクリーンショットを撮影し、X（Twitter）にシェアする
 * WHY: X Web Intentは画像の直接添付をサポートしていないため、
 *      画像をダウンロードしてからX投稿画面を開く
 */
export function ShareButton({ selectedSubscriptions, total, receiptRef }: Props) {
  const [state, setState] = useState<ShareState>('idle');

  const isDisabled = selectedSubscriptions.length === 0;

  // WHY: 3つのボタンで共通のベーススタイルを定義
  const baseButtonClasses = [
    'flex items-center justify-center gap-2',
    'font-display text-xl tracking-wide',
    'border-brutal rounded-sm',
    'transition-all duration-150',
  ];

  // WHY: ライトカラーボタンの共通スタイル（ダウンロード・リンクコピー）
  const lightButtonClasses = (successState: boolean) => [
    ...baseButtonClasses,
    'px-4 py-4 sm:px-6',
    !isDisabled && ['bg-paper text-ink', 'shadow-brutal', 'hover-lift', 'cursor-pointer'],
    isDisabled && ['bg-paper-aged text-ink-faded', 'cursor-not-allowed opacity-50'],
    successState && ['bg-accent-green text-paper'],
  ];

  // WHY: ダークカラーボタンの共通スタイル（メインシェアボタン）
  const darkButtonClasses = [
    ...baseButtonClasses,
    'flex-1',
    'px-6 py-4',
    !isDisabled && ['bg-ink text-paper', 'shadow-brutal', 'hover-lift', 'cursor-pointer'],
    isDisabled && ['bg-ink-faded text-paper-aged', 'cursor-not-allowed opacity-50'],
  ];

  /**
   * 画像をダウンロード
   */
  const handleDownloadImage = useCallback(async () => {
    if (isDisabled || !receiptRef.current) return;

    setState('loading');

    try {
      const blob = await captureReceiptImage(receiptRef.current);
      downloadBlob(blob, `subscheck-receipt-${Date.now()}.png`);

      setState('downloaded');
      setTimeout(() => setState('idle'), 2000);
    } catch (error) {
      console.error('画像ダウンロードエラー:', error);
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  }, [isDisabled, receiptRef]);

  /**
   * シェア処理
   * WHY: X Web Intentは画像の直接添付をサポートしていないため、
   *      画像をダウンロードしてからX投稿画面を開く
   */
  const handleShare = useCallback(async () => {
    if (isDisabled || !receiptRef.current) return;

    setState('loading');

    try {
      // 1. 画像をキャプチャしてダウンロード
      const blob = await captureReceiptImage(receiptRef.current);
      downloadBlob(blob, `subscheck-receipt-${Date.now()}.png`);

      // 2. X（Twitter）のWeb Intentを開く
      const shareText = generateShareText(selectedSubscriptions, total);
      const shareData = {
        selectedIds: selectedSubscriptions.map((s) => s.id),
        totalPrice: total,
      };
      const shareUrl = generateShareUrl(shareData);

      const twitterUrl = new URL('https://twitter.com/intent/tweet');
      twitterUrl.searchParams.set('text', shareText);
      twitterUrl.searchParams.set('url', shareUrl);

      window.open(twitterUrl.toString(), '_blank', 'noopener,noreferrer');
      setState('idle');
    } catch (error) {
      console.error('シェアエラー:', error);
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  }, [isDisabled, receiptRef, selectedSubscriptions, total]);

  /**
   * リンクをクリップボードにコピー
   */
  const handleCopyLink = useCallback(async () => {
    if (isDisabled) return;

    setState('loading');

    try {
      const shareData = {
        selectedIds: selectedSubscriptions.map((s) => s.id),
        totalPrice: total,
      };
      const shareUrl = generateShareUrl(shareData);

      await navigator.clipboard.writeText(shareUrl);
      setState('copied');
      setTimeout(() => setState('idle'), 2000);
    } catch (error) {
      console.error('コピーエラー:', error);
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  }, [isDisabled, selectedSubscriptions, total]);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* 画像ダウンロードボタン */}
      <button
        type="button"
        onClick={handleDownloadImage}
        disabled={isDisabled || state === 'loading'}
        className={cn(lightButtonClasses(state === 'downloaded'))}
        aria-label="レシート画像をダウンロード"
      >
        {state === 'loading' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : state === 'downloaded' ? (
          <>
            <Check className="w-5 h-5" />
            <span className="hidden sm:inline">ダウンロード済み</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">画像をダウンロード</span>
          </>
        )}
      </button>

      {/* Xでシェアボタン */}
      <button
        type="button"
        onClick={handleShare}
        disabled={isDisabled || state === 'loading'}
        className={cn(darkButtonClasses)}
        aria-label="Xでシェア（画像付き）"
      >
        {state === 'loading' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Camera className="w-5 h-5" />
            Xでシェア
          </>
        )}
      </button>

      {/* リンクコピーボタン */}
      <button
        type="button"
        onClick={handleCopyLink}
        disabled={isDisabled || state === 'loading'}
        className={cn(lightButtonClasses(state === 'copied'))}
        aria-label="シェアリンクをコピー"
      >
        {state === 'loading' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : state === 'copied' ? (
          <>
            <Check className="w-5 h-5" />
            <span className="hidden sm:inline">コピー済み</span>
          </>
        ) : (
          <>
            <Share2 className="w-5 h-5" />
            <span className="hidden sm:inline">リンクコピー</span>
          </>
        )}
      </button>
    </div>
  );
}

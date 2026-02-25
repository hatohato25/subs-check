import Link from 'next/link';
import { SubscriptionIconNext } from '@/components/ui/SubscriptionIconNext';
import { subscriptions } from '@/data/subscriptions';
import { formatPrice } from '@/lib/format';
import { decodeShareData } from '@/lib/share';
import { getUniqueIcons } from '@/lib/subscription-utils';
import { cn } from '@/lib/utils';
import type { Subscription } from '@/types/subscription';

type Props = {
  params: Promise<{ encoded: string }>;
};

/**
 * シェアページ
 *
 * WHY: ShareButtonで生成されたURLからサブスク選択状態を復元して表示
 * - URL パラメータから encoded 値を取得
 * - decodeShareData でデコード
 * - デコード失敗時は適切なエラー表示
 * - 成功時は選択されたサブスク一覧と合計金額を表示
 */
export default async function SharePage({ params }: Props) {
  // WHY: App Router の Dynamic Routes では params が Promise として渡される
  const { encoded } = await params;

  // WHY: エンコードされた文字列をデコードして選択状態を復元
  const shareData = decodeShareData(encoded);

  // デコード失敗時のエラー表示
  if (!shareData) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div
            className={cn(
              'bg-paper border-brutal rounded-sm',
              'shadow-brutal-lg',
              'p-8',
              'paper-texture',
              'text-center'
            )}
          >
            <div className="text-6xl mb-4">❌</div>
            <h1 className="font-display text-3xl tracking-wider text-ink mb-4">ERROR</h1>
            <p className="font-receipt text-sm text-ink-light mb-6">
              無効なシェアURLです。
              <br />
              URLが正しいか確認してください。
            </p>
            <Link
              href="/"
              className={cn(
                'inline-block',
                'px-6 py-3',
                'bg-highlight border-brutal rounded-sm',
                'shadow-brutal-md',
                'font-receipt font-bold text-sm text-ink',
                'transition-all duration-150',
                'hover-lift',
                'active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'
              )}
            >
              トップページへ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // WHY: shareDataに含まれるIDから実際のサブスクリプションデータを取得
  const selectedSubscriptions: Subscription[] = shareData.selectedIds
    .map((id) => subscriptions.find((sub) => sub.id === id))
    .filter((sub): sub is Subscription => sub !== undefined);

  // WHY: 選択されたサブスクのアイコンを重複排除して取得（TotalDisplayと同じロジック）
  const uniqueIcons = getUniqueIcons(selectedSubscriptions);

  const selectedCount = selectedSubscriptions.length;
  const yearlyTotal = shareData.totalPrice * 12;

  return (
    <main className="min-h-screen pb-32">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-paper-aged border-b-4 border-ink">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl tracking-wider text-ink">
                SUBSCHECK
              </h1>
              <p className="font-receipt text-xs text-ink-faded mt-1">シェアされたサブスク</p>
            </div>
            {/* 選択数バッジ */}
            {selectedCount > 0 && (
              <div
                className={cn(
                  'px-3 py-1',
                  'bg-highlight border-2 border-ink rounded-full',
                  'font-receipt text-sm font-bold'
                )}
              >
                {selectedCount} 件
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* レシート風の合計金額表示 */}
        <section className="mb-8">
          <div
            className={cn(
              'bg-paper border-brutal rounded-sm',
              'shadow-brutal-lg',
              'p-6',
              'paper-texture'
            )}
          >
            {/* ヘッダー */}
            <div className="text-center mb-4">
              <h2 className="font-display text-3xl tracking-wider text-ink">SHARED RECEIPT</h2>
              <p className="font-receipt text-xs text-ink-faded mt-1">
                {new Date().toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })}
              </p>
            </div>

            <hr className="receipt-divider" />

            {/* サブスク数とアイコン */}
            <div className="mb-4">
              <div className="flex justify-between items-center font-receipt text-sm mb-2">
                <span className="text-ink-light">選択中のサブスク</span>
                <span className="font-bold text-ink">{selectedCount} 件</span>
              </div>

              {/* アイコン一覧 */}
              {uniqueIcons.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {uniqueIcons.map((icon) => (
                    <div
                      key={icon}
                      className={cn(
                        'flex items-center justify-center',
                        'w-8 h-8',
                        'bg-paper-aged border border-ink-faded/20 rounded'
                      )}
                    >
                      <SubscriptionIconNext
                        icon={icon.startsWith('/') ? icon : undefined}
                        fallbackIcon={icon.startsWith('/') ? '📦' : icon}
                        alt="service icon"
                        size="md"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="receipt-dots" />

            {/* 月額合計 */}
            <div className="mb-2">
              <div className="flex justify-between items-baseline">
                <span className="font-receipt text-sm text-ink-light">月額合計</span>
                <span className="font-display text-5xl tracking-tight text-ink">
                  {formatPrice(shareData.totalPrice)}
                </span>
              </div>
              <p className="text-right font-receipt text-xs text-ink-faded mt-1">/月（税込）</p>
            </div>

            <hr className="receipt-divider" />

            {/* 年額換算 */}
            <div className="flex justify-between items-center font-receipt text-sm">
              <span className="text-ink-light">年額換算</span>
              <span
                className={cn(
                  'font-bold tabular-nums',
                  yearlyTotal > 100000 ? 'text-accent-red' : 'text-ink'
                )}
              >
                {formatPrice(yearlyTotal)}
              </span>
            </div>

            {/* 警告メッセージ（高額時） */}
            {yearlyTotal > 50000 && (
              <div
                className={cn(
                  'mt-4 p-3 rounded-sm',
                  'bg-highlight border-2 border-ink',
                  'font-receipt text-xs text-ink'
                )}
              >
                <span className="font-bold">⚠ CAUTION:</span> 年間 {formatPrice(yearlyTotal)}{' '}
                の出費です
              </div>
            )}
          </div>
        </section>

        {/* サブスク一覧 */}
        {selectedSubscriptions.length > 0 && (
          <section className="mb-8">
            <div
              className={cn(
                'bg-paper border-brutal rounded-sm',
                'shadow-brutal-md',
                'p-6',
                'paper-texture'
              )}
            >
              <h3 className="font-display text-xl tracking-wide text-ink mb-4">内訳</h3>
              <div className="space-y-3">
                {selectedSubscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className={cn(
                      'flex items-center justify-between',
                      'p-3 rounded-sm',
                      'bg-paper-aged border border-ink-faded/20',
                      'transition-colors hover:bg-paper'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* アイコン */}
                      <div className="flex items-center justify-center w-10 h-10">
                        <SubscriptionIconNext
                          icon={sub.icon}
                          fallbackIcon={sub.fallbackIcon}
                          alt={sub.nameEn}
                          size="lg"
                        />
                      </div>
                      {/* サービス名 */}
                      <div>
                        <div className="font-receipt text-sm font-bold text-ink">{sub.name}</div>
                        {sub.description && (
                          <div className="font-receipt text-xs text-ink-faded mt-0.5">
                            {sub.description}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* 価格 */}
                    <div className="font-display text-lg font-bold text-ink tabular-nums">
                      {formatPrice(sub.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 自分も試すボタン */}
        <section>
          <Link
            href="/"
            className={cn(
              'block',
              'w-full',
              'px-8 py-4',
              'bg-highlight border-brutal rounded-sm',
              'shadow-brutal-lg',
              'font-display text-xl tracking-wider text-center text-ink',
              'transition-all duration-150',
              'hover-lift',
              'active:translate-x-1 active:translate-y-1 active:shadow-none'
            )}
          >
            自分も試す →
          </Link>
        </section>
      </div>
    </main>
  );
}

/**
 * メタデータ生成
 *
 * WHY: 動的にOGタグを設定し、SNSシェア時に適切な情報を表示
 */
export async function generateMetadata({ params }: Props) {
  const { encoded } = await params;
  const shareData = decodeShareData(encoded);

  if (!shareData) {
    return {
      title: 'SubsCheck - エラー',
      description: '無効なシェアURLです',
    };
  }

  const selectedCount = shareData.selectedIds.length;
  const yearlyTotal = shareData.totalPrice * 12;
  const title = `SubsCheck - 月額合計 ${formatPrice(shareData.totalPrice)}`;
  const description = `${selectedCount}個のサブスクで月額${formatPrice(shareData.totalPrice)}、年間${formatPrice(yearlyTotal)}の出費です`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

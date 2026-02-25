import { type NextRequest, NextResponse } from 'next/server';
import type React from 'react';
import satori from 'satori';
import { subscriptions as presetSubscriptions } from '@/data/subscriptions';
import type { Subscription } from '@/types/subscription';

// WHY: Node.jsランタイムを明示的に指定することで、ネイティブモジュールの使用を可能にする
export const runtime = 'nodejs';

/**
 * OG画像生成API
 *
 * クエリパラメータ `ids` で指定されたサブスクIDの画像を生成
 * Satoriで SVG 生成 → Resvgで PNG 変換
 *
 * @example
 * GET /api/og?ids=netflix-standard,spotify,youtube-premium
 *
 * @returns PNG画像 (1200x630px)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    const theme = searchParams.get('theme') || 'light'; // WHY: ダークモード対応のためthemeパラメータを追加

    // パラメータのバリデーション
    if (!idsParam) {
      return NextResponse.json({ error: 'idsパラメータが必要です' }, { status: 400 });
    }

    const ids = idsParam.split(',').filter((id) => id.trim() !== '');

    if (ids.length === 0) {
      return NextResponse.json({ error: '少なくとも1つのサブスクIDが必要です' }, { status: 400 });
    }

    // サブスクデータの取得
    const selectedSubscriptions = ids
      .map((id) => presetSubscriptions.find((sub) => sub.id === id))
      .filter((sub): sub is Subscription => sub !== undefined);

    if (selectedSubscriptions.length === 0) {
      return NextResponse.json({ error: '有効なサブスクが見つかりませんでした' }, { status: 400 });
    }

    // 合計金額を計算
    const totalPrice = selectedSubscriptions.reduce((sum, sub) => sum + sub.price, 0);

    // WHY: テーマに応じた色設定（ライト/ダークモード）
    const isDark = theme === 'dark';
    const colors = {
      background: isDark ? '#1A1A2E' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#1A1A2E',
      subtext: isDark ? '#9CA3AF' : '#6B7280',
      cardBackground: isDark ? '#2D2D44' : '#F3F4F6',
      divider: isDark ? '#4B5563' : '#E5E7EB',
      accent: isDark ? '#60A5FA' : '#3B82F6',
    };

    // フォントデータを Google Fonts から取得
    // WHY: Satoriは画像生成時にフォントデータが必要。Google Fontsから動的にフェッチすることで、
    // プロジェクトにフォントファイルをバンドルせずに済む
    const [notoSansJP, inter] = await Promise.all([
      fetch('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap').then(
        (res) => res.text()
      ),
      fetch('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap').then(
        (res) => res.text()
      ),
    ]);

    // フォントURLを抽出してフォントデータをフェッチ
    // WHY: SatoriはフォントのArrayBufferが必要なため、CSSからURLを抽出して個別にフェッチ
    const notoSansJPUrl = notoSansJP.match(/url\((https:\/\/[^)]+)\)/)?.[1];
    const interUrl = inter.match(/url\((https:\/\/[^)]+)\)/)?.[1];

    if (!notoSansJPUrl || !interUrl) {
      return NextResponse.json({ error: 'フォントの読み込みに失敗しました' }, { status: 500 });
    }

    const [notoSansJPFont, interFont] = await Promise.all([
      fetch(notoSansJPUrl).then((res) => res.arrayBuffer()),
      fetch(interUrl).then((res) => res.arrayBuffer()),
    ]);

    // サブスクカードコンポーネント
    // WHY: 最大10件まで表示（画像に収まる範囲）
    const subscriptionCards = selectedSubscriptions.slice(0, 10).map((sub) => ({
      type: 'div',
      key: sub.id,
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          backgroundColor: colors.cardBackground,
          borderRadius: 12,
          padding: 16,
          width: 120,
        },
        children: [
          // アイコン
          {
            type: 'div',
            props: {
              style: {
                fontSize: 40,
                marginBottom: 8,
              },
              children: sub.fallbackIcon,
            },
          },
          // サービス名
          {
            type: 'div',
            props: {
              style: {
                fontSize: 14,
                fontWeight: 700,
                color: colors.text,
                marginBottom: 4,
                textAlign: 'center' as const,
              },
              children: sub.nameEn.length > 10 ? `${sub.nameEn.slice(0, 9)}...` : sub.nameEn,
            },
          },
          // 価格
          {
            type: 'div',
            props: {
              style: {
                fontSize: 16,
                fontWeight: 700,
                color: colors.accent,
              },
              children: `¥${sub.price.toLocaleString()}`,
            },
          },
        ],
      },
    }));

    // Satoriで SVG 生成
    // WHY: ReactElementライクな構造を渡すことでSVGを生成
    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.background,
            padding: '60px',
            fontFamily: '"Inter", "Noto Sans JP", sans-serif',
          },
          children: [
            // タイトル
            {
              type: 'div',
              props: {
                style: {
                  fontSize: 48,
                  fontWeight: 700,
                  color: colors.text,
                  marginBottom: 40,
                },
                children: 'My Subscriptions',
              },
            },
            // サブスク一覧
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexWrap: 'wrap' as const,
                  gap: 20,
                  justifyContent: 'center',
                  maxWidth: 1000,
                  marginBottom: 40,
                },
                children: subscriptionCards,
              },
            },
            // 区切り線
            {
              type: 'div',
              props: {
                style: {
                  width: 300,
                  height: 2,
                  backgroundColor: colors.divider,
                  marginBottom: 30,
                },
              },
            },
            // 合計金額
            {
              type: 'div',
              props: {
                style: {
                  fontSize: 36,
                  fontWeight: 700,
                  color: colors.text,
                  marginBottom: 10,
                },
                children: `Monthly Total: ¥${totalPrice.toLocaleString()}`,
              },
            },
            // 件数表示
            {
              type: 'div',
              props: {
                style: {
                  fontSize: 18,
                  color: colors.subtext,
                  marginBottom: 40,
                },
                children: `${selectedSubscriptions.length} subscription${selectedSubscriptions.length > 1 ? 's' : ''}`,
              },
            },
            // ブランディング
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute' as const,
                  bottom: 40,
                  right: 60,
                  fontSize: 14,
                  color: colors.subtext,
                },
                children: 'powered by SubsCheck',
              },
            },
          ],
        },
      } as React.ReactElement,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: interFont,
            weight: 400,
            style: 'normal',
          },
          {
            name: 'Inter',
            data: interFont,
            weight: 700,
            style: 'normal',
          },
          {
            name: 'Noto Sans JP',
            data: notoSansJPFont,
            weight: 700,
            style: 'normal',
          },
        ],
      }
    );

    // Resvgで PNG に変換
    // WHY: Resvgはネイティブモジュールのため、dynamic importで読み込む
    const { Resvg } = await import('@resvg/resvg-js');
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: 1200,
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // PNG画像を返却
    // WHY: NextResponseはBodyInitを期待するため、BufferをUint8Arrayに変換
    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('OG画像生成エラー:', error);
    return NextResponse.json({ error: '画像の生成に失敗しました' }, { status: 500 });
  }
}

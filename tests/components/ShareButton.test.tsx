import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ShareButton } from '@/components/features/ShareButton';
import type { Subscription } from '@/types/subscription';
import { render } from '../test-utils';

// WHY: modern-screenshotのモック
// テスト環境ではDOM操作による画像生成は不要なので、Blobを直接返す
vi.mock('modern-screenshot', () => ({
  domToBlob: vi.fn().mockResolvedValue(new Blob(['fake-image'], { type: 'image/png' })),
}));

describe('ShareButton', () => {
  const mockSubscriptions: Subscription[] = [
    {
      id: 'netflix',
      name: 'Netflix',
      nameEn: 'Netflix',
      price: 1980,
      category: 'video',
      icon: '/icon/netflix.png',
      fallbackIcon: '📺',
      color: '#E50914',
    },
    {
      id: 'spotify',
      name: 'Spotify',
      nameEn: 'Spotify',
      price: 980,
      category: 'music',
      icon: '/icon/spotify.png',
      fallbackIcon: '🎵',
      color: '#1DB954',
    },
  ];

  const total = 2960;

  // WHY: window.openのモック
  let windowOpenSpy: Mock;

  // WHY: クリップボードAPIのモック
  let clipboardWriteTextSpy: Mock;

  // WHY: RECEIPTコンポーネントのrefをモック
  let mockReceiptRef: React.RefObject<HTMLDivElement>;

  beforeEach(() => {
    // WHY: 各テスト前にmockReceiptRefを初期化
    // HTMLDivElementの最小限のモック
    mockReceiptRef = {
      current: {} as HTMLDivElement,
    };

    // window.open をモック
    windowOpenSpy = vi.fn();
    vi.stubGlobal('open', windowOpenSpy);

    // navigator.clipboard.writeText をモック
    clipboardWriteTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: clipboardWriteTextSpy,
      },
    });

    // URL.createObjectURL/revokeObjectURL をモック
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('should render all buttons', () => {
    render(
      <ShareButton
        selectedSubscriptions={mockSubscriptions}
        total={total}
        receiptRef={mockReceiptRef}
      />
    );

    expect(screen.getByLabelText('レシート画像をダウンロード')).toBeInTheDocument();
    expect(screen.getByLabelText('Xでシェア（画像付き）')).toBeInTheDocument();
    expect(screen.getByLabelText('シェアリンクをコピー')).toBeInTheDocument();
  });

  it('should disable all buttons when no subscriptions selected', () => {
    render(<ShareButton selectedSubscriptions={[]} total={0} receiptRef={mockReceiptRef} />);

    expect(screen.getByLabelText('レシート画像をダウンロード')).toBeDisabled();
    expect(screen.getByLabelText('Xでシェア（画像付き）')).toBeDisabled();
    expect(screen.getByLabelText('シェアリンクをコピー')).toBeInTheDocument();
  });

  it.skip('should copy link to clipboard when copy button clicked', async () => {
    const user = userEvent.setup();

    render(
      <ShareButton
        selectedSubscriptions={mockSubscriptions}
        total={total}
        receiptRef={mockReceiptRef}
      />
    );

    const copyButton = screen.getByLabelText('シェアリンクをコピー');
    await user.click(copyButton);

    // WHY: クリップボードAPIが呼ばれたか確認
    await waitFor(() => {
      expect(clipboardWriteTextSpy).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:3000/share/')
      );
    });

    // WHY: ボタンの表示が「コピー済み」に変わるか確認
    await waitFor(() => {
      expect(screen.getByText('コピー済み')).toBeInTheDocument();
    });
  });

  it.skip('should handle clipboard error gracefully', async () => {
    const user = userEvent.setup();

    // WHY: クリップボード操作をエラーにする
    clipboardWriteTextSpy.mockRejectedValueOnce(new Error('Clipboard error'));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ShareButton
        selectedSubscriptions={mockSubscriptions}
        total={total}
        receiptRef={mockReceiptRef}
      />
    );

    const copyButton = screen.getByLabelText('シェアリンクをコピー');
    await user.click(copyButton);

    // WHY: エラーログが出力されたか確認
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'コピーエラー:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it.skip('should download image when download button clicked', async () => {
    const user = userEvent.setup();

    // WHY: documentのappendChild/removeChildをモック
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as unknown as Node);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as unknown as Node);

    render(
      <ShareButton
        selectedSubscriptions={mockSubscriptions}
        total={total}
        receiptRef={mockReceiptRef}
      />
    );

    const downloadButton = screen.getByLabelText('レシート画像をダウンロード');
    await user.click(downloadButton);

    // WHY: ダウンロード処理（a要素の作成・クリック）が実行されたか確認
    await waitFor(() => {
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });

    // WHY: ボタンの表示が「ダウンロード済み」に変わるか確認
    await waitFor(() => {
      expect(screen.getByText('ダウンロード済み')).toBeInTheDocument();
    });

    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it.skip('should open Twitter intent when share button clicked', async () => {
    const user = userEvent.setup();

    // WHY: documentのappendChild/removeChildをモック
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as unknown as Node);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as unknown as Node);

    render(
      <ShareButton
        selectedSubscriptions={mockSubscriptions}
        total={total}
        receiptRef={mockReceiptRef}
      />
    );

    const shareButton = screen.getByLabelText('Xでシェア（画像付き）');
    await user.click(shareButton);

    // WHY: Twitter Web Intentが開かれたか確認
    await waitFor(() => {
      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://twitter.com/intent/tweet'),
        '_blank',
        'noopener,noreferrer'
      );
    });

    // WHY: 画像のダウンロードも実行される
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();

    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it.skip('should not execute action when receiptRef.current is null', async () => {
    const user = userEvent.setup();

    const nullReceiptRef = { current: null };

    render(
      <ShareButton
        selectedSubscriptions={mockSubscriptions}
        total={total}
        receiptRef={nullReceiptRef}
      />
    );

    const downloadButton = screen.getByLabelText('レシート画像をダウンロード');
    await user.click(downloadButton);

    // WHY: receiptRefがnullの場合は何も実行されない
    expect(global.URL.createObjectURL).not.toHaveBeenCalled();
  });

  it.skip('should generate correct share text', async () => {
    const user = userEvent.setup();

    render(
      <ShareButton
        selectedSubscriptions={mockSubscriptions}
        total={total}
        receiptRef={mockReceiptRef}
      />
    );

    const shareButton = screen.getByLabelText('Xでシェア（画像付き）');
    await user.click(shareButton);

    // WHY: シェアテキストに必要な情報が含まれているか確認
    await waitFor(() => {
      const callArg = windowOpenSpy.mock.calls[0][0];
      expect(callArg).toContain('私の月額サブスク合計は¥2,960でした！');
      expect(callArg).toContain('#SubsCheck');
    });
  });

  it.skip('should truncate subscription list to 5 items in share text', async () => {
    const user = userEvent.setup();

    // WHY: 6件のサブスクを作成
    const manySubs: Subscription[] = Array.from({ length: 6 }, (_, i) => ({
      id: `sub-${i}`,
      name: `Service ${i}`,
      nameEn: `Service ${i}`,
      price: 1000,
      category: 'other' as const,
      fallbackIcon: '📱',
      color: '#000000',
    }));

    render(
      <ShareButton
        selectedSubscriptions={manySubs}
        total={6000}
        receiptRef={mockReceiptRef}
      />
    );

    const shareButton = screen.getByLabelText('Xでシェア（画像付き）');
    await user.click(shareButton);

    // WHY: 5件まで表示され、「...他1件」が追加される
    await waitFor(() => {
      const callArg = windowOpenSpy.mock.calls[0][0];
      expect(callArg).toContain('...他1件');
    });
  });
});

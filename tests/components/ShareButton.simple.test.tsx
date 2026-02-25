import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';
import { ShareButton } from '@/components/features/ShareButton';
import type { Subscription } from '@/types/subscription';

// WHY: modern-screenshotのモック
vi.mock('modern-screenshot', () => ({
  domToBlob: vi.fn().mockResolvedValue(new Blob(['fake-image'], { type: 'image/png' })),
}));

describe('ShareButton - Simple Tests', () => {
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
  ];

  const total = 1980;
  let mockReceiptRef: React.RefObject<HTMLDivElement>;
  let clipboardWriteTextSpy: Mock;

  beforeEach(() => {
    mockReceiptRef = { current: {} as HTMLDivElement };
    clipboardWriteTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: clipboardWriteTextSpy },
    });
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
    expect(screen.getByLabelText('シェアリンクをコピー')).toBeDisabled();
  });

  it('should render with correct button labels', () => {
    render(
      <ShareButton
        selectedSubscriptions={mockSubscriptions}
        total={total}
        receiptRef={mockReceiptRef}
      />
    );

    // WHY: ボタンのラベルが正しく表示されているか確認
    expect(screen.getByText(/画像をダウンロード|ダウンロード済み/)).toBeInTheDocument();
    expect(screen.getByText('Xでシェア')).toBeInTheDocument();
    expect(screen.getByText(/リンクコピー|コピー済み/)).toBeInTheDocument();
  });
});

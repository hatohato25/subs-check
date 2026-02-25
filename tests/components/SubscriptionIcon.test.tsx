import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubscriptionIcon } from '@/components/ui/SubscriptionIcon';

describe('SubscriptionIcon', () => {
  it('should render image when icon is provided', () => {
    render(
      <SubscriptionIcon
        icon="/icons/netflix.png"
        fallbackIcon="📺"
        alt="Netflix"
        size="md"
      />
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/icons/netflix.png');
    expect(img).toHaveAttribute('alt', 'Netflix');
  });

  it('should render fallback emoji when icon is not provided', () => {
    const { container } = render(
      <SubscriptionIcon fallbackIcon="📺" size="md" />
    );

    expect(container.textContent).toBe('📺');
  });

  it('should apply correct size classes', () => {
    const { rerender } = render(
      <SubscriptionIcon fallbackIcon="📺" size="sm" />
    );
    expect(screen.getByText('📺')).toHaveClass('text-base');

    rerender(<SubscriptionIcon fallbackIcon="📺" size="md" />);
    expect(screen.getByText('📺')).toHaveClass('text-xl');

    rerender(<SubscriptionIcon fallbackIcon="📺" size="lg" />);
    expect(screen.getByText('📺')).toHaveClass('text-2xl');
  });

  it('should switch to fallback icon on image error', async () => {
    const { act } = await import('@testing-library/react');

    render(
      <SubscriptionIcon
        icon="/invalid-path.png"
        fallbackIcon="📺"
        alt="Service"
        size="md"
      />
    );

    const img = screen.getByRole('img');

    // WHY: 画像エラーをシミュレート（状態更新を伴うため act() でラップ）
    await act(async () => {
      img.dispatchEvent(new Event('error'));
    });

    // WHY: エラー後はフォールバック絵文字が表示される
    expect(screen.getByText('📺')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <SubscriptionIcon
        fallbackIcon="📺"
        size="md"
        className="custom-class"
      />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});

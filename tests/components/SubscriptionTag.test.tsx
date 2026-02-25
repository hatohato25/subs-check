import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubscriptionTag } from '@/components/features/SubscriptionTag';
import type { Subscription } from '@/types/subscription';

describe('SubscriptionTag', () => {
  const mockSubscription: Subscription = {
    id: 'netflix',
    name: 'Netflix',
    nameEn: 'Netflix',
    price: 1980,
    category: 'video',
    icon: '/icon/netflix.png',
    fallbackIcon: '📺',
    color: '#E50914',
    description: '映画・ドラマ見放題',
  };

  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render subscription name and price', () => {
    render(
      <SubscriptionTag subscription={mockSubscription} isSelected={false} onToggle={mockOnToggle} index={0} />
    );

    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText('¥1,980')).toBeInTheDocument();
  });

  it('should call onToggle when clicked', async () => {
    const user = userEvent.setup();
    render(
      <SubscriptionTag subscription={mockSubscription} isSelected={false} onToggle={mockOnToggle} index={0} />
    );

    await user.click(screen.getByRole('button'));
    expect(mockOnToggle).toHaveBeenCalledWith('netflix');
  });

  it('should show check mark when selected', () => {
    render(
      <SubscriptionTag subscription={mockSubscription} isSelected={true} onToggle={mockOnToggle} index={0} />
    );

    // aria-labelでチェック状態を確認
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('should show tooltip on hover with delay', async () => {
    vi.useFakeTimers();

    render(
      <SubscriptionTag subscription={mockSubscription} isSelected={false} onToggle={mockOnToggle} index={0} />
    );

    const button = screen.getByRole('button');

    // マウスをホバー
    act(() => {
      fireEvent.mouseEnter(button);
    });

    // 即座にはtooltipは表示されない
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // 300ms経過後にtooltipが表示される
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // tooltipが表示される
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    // tooltip内にサービス名が複数あるため、tooltipコンテナ内でテキストを確認
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('Netflix');
    expect(tooltip).toHaveTextContent('映画・ドラマ見放題');

    vi.useRealTimers();
  });

  it('should hide tooltip on mouse leave', async () => {
    vi.useFakeTimers();

    render(
      <SubscriptionTag subscription={mockSubscription} isSelected={false} onToggle={mockOnToggle} index={0} />
    );

    const button = screen.getByRole('button');

    // マウスをホバー
    act(() => {
      fireEvent.mouseEnter(button);
    });

    // 300ms経過してtooltipを表示
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // マウスを外す
    act(() => {
      fireEvent.mouseLeave(button);
    });

    // tooltipが消える
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should not show tooltip description when description is not provided', async () => {
    vi.useFakeTimers();

    const subWithoutDescription: Subscription = {
      ...mockSubscription,
      description: undefined,
    };

    render(
      <SubscriptionTag
        subscription={subWithoutDescription}
        isSelected={false}
        onToggle={mockOnToggle}
        index={0}
      />
    );

    const button = screen.getByRole('button');

    act(() => {
      fireEvent.mouseEnter(button);
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    // 名前のみ表示され、descriptionは表示されない
    expect(tooltip.textContent).toBe('Netflix');

    vi.useRealTimers();
  });

  it('should cancel tooltip display when mouse leaves before delay', async () => {
    vi.useFakeTimers();

    render(
      <SubscriptionTag subscription={mockSubscription} isSelected={false} onToggle={mockOnToggle} index={0} />
    );

    const button = screen.getByRole('button');

    // マウスをホバー
    act(() => {
      fireEvent.mouseEnter(button);
    });

    // 200ms後にマウスを外す（300ms delay未満）
    act(() => {
      vi.advanceTimersByTime(200);
    });

    act(() => {
      fireEvent.mouseLeave(button);
    });

    // さらに時間を進めてもtooltipは表示されない
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should display fallback icon when image fails to load', () => {
    render(
      <SubscriptionTag subscription={mockSubscription} isSelected={false} onToggle={mockOnToggle} index={0} />
    );

    // 画像要素を取得してエラーをトリガー
    const img = screen.getByAltText('');
    act(() => {
      fireEvent.error(img);
    });

    // fallbackIconが表示される
    expect(screen.getByText('📺')).toBeInTheDocument();
  });
});

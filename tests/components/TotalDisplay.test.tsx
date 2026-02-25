import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TotalDisplay } from '@/components/features/TotalDisplay';
import type { Subscription } from '@/types/subscription';

describe('TotalDisplay', () => {
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

  it('should render total price and selected count', () => {
    render(<TotalDisplay total={2960} selectedCount={2} selectedSubscriptions={mockSubscriptions} />);

    expect(screen.getByText('¥2,960')).toBeInTheDocument();
    expect(screen.getByText('2 件')).toBeInTheDocument();
  });

  it('should display unique icons for selected subscriptions', () => {
    render(<TotalDisplay total={2960} selectedCount={2} selectedSubscriptions={mockSubscriptions} />);

    // アイコン画像が表示されているか確認（2つ）
    const icons = screen.getAllByAltText('service icon');
    expect(icons).toHaveLength(2);
  });

  it('should deduplicate same icons', () => {
    const duplicatedSubs: Subscription[] = [
      mockSubscriptions[0],
      { ...mockSubscriptions[0], id: 'netflix-duplicate' },
      mockSubscriptions[1],
    ];

    render(<TotalDisplay total={4940} selectedCount={3} selectedSubscriptions={duplicatedSubs} />);

    // 重複するアイコンは1つにまとめられる（Netflix 1つ + Spotify 1つ = 2つ）
    const icons = screen.getAllByAltText('service icon');
    expect(icons).toHaveLength(2);
  });

  it('should display fallback emoji icon when icon is not provided', () => {
    const customSub: Subscription = {
      id: 'custom',
      name: 'Custom Service',
      nameEn: 'Custom Service',
      price: 500,
      category: 'custom',
      fallbackIcon: '✨',
      color: '#333333',
    };

    render(<TotalDisplay total={500} selectedCount={1} selectedSubscriptions={[customSub]} />);

    // fallbackIconの絵文字が表示されているか確認
    expect(screen.getByText('✨')).toBeInTheDocument();
  });

  it('should not display icons when no subscriptions selected', () => {
    render(<TotalDisplay total={0} selectedCount={0} selectedSubscriptions={[]} />);

    expect(screen.queryByAltText('service icon')).not.toBeInTheDocument();
    expect(screen.getByText('サブスクを選択してください')).toBeInTheDocument();
  });

  it('should display yearly total', () => {
    render(<TotalDisplay total={2960} selectedCount={2} selectedSubscriptions={mockSubscriptions} />);

    // 年額換算 = 2960 * 12 = 35,520
    expect(screen.getByText('¥35,520')).toBeInTheDocument();
  });

  it('should show warning message when yearly total exceeds 50,000', () => {
    const expensiveSubs: Subscription[] = [
      {
        id: 'expensive',
        name: 'Expensive Service',
        nameEn: 'Expensive Service',
        price: 5000,
        category: 'other',
        fallbackIcon: '💰',
        color: '#000000',
      },
    ];

    render(<TotalDisplay total={5000} selectedCount={1} selectedSubscriptions={expensiveSubs} />);

    // 年額 = 5000 * 12 = 60,000 > 50,000 なので警告表示
    expect(screen.getByText(/CAUTION:/)).toBeInTheDocument();
  });
});

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubscriptionIconNext } from '@/components/ui/SubscriptionIconNext';

describe('SubscriptionIconNext', () => {
  it('should render Next.js Image when icon starts with /', () => {
    render(
      <SubscriptionIconNext
        icon="/icons/netflix.png"
        fallbackIcon="📺"
        alt="Netflix"
        size="md"
      />
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Netflix');
  });

  it('should render fallback emoji when icon is not provided', () => {
    const { container } = render(
      <SubscriptionIconNext fallbackIcon="📺" size="md" />
    );

    expect(container.textContent).toBe('📺');
  });

  it('should render fallback emoji when icon does not start with /', () => {
    const { container } = render(
      <SubscriptionIconNext
        icon="https://example.com/icon.png"
        fallbackIcon="📺"
        size="md"
      />
    );

    expect(container.textContent).toBe('📺');
  });

  it('should apply correct size for images', () => {
    const { rerender } = render(
      <SubscriptionIconNext
        icon="/icons/netflix.png"
        fallbackIcon="📺"
        size="sm"
      />
    );
    let img = screen.getByRole('img');
    expect(img).toHaveAttribute('width', '16');
    expect(img).toHaveAttribute('height', '16');

    rerender(
      <SubscriptionIconNext
        icon="/icons/netflix.png"
        fallbackIcon="📺"
        size="md"
      />
    );
    img = screen.getByRole('img');
    expect(img).toHaveAttribute('width', '24');
    expect(img).toHaveAttribute('height', '24');

    rerender(
      <SubscriptionIconNext
        icon="/icons/netflix.png"
        fallbackIcon="📺"
        size="lg"
      />
    );
    img = screen.getByRole('img');
    expect(img).toHaveAttribute('width', '32');
    expect(img).toHaveAttribute('height', '32');
  });

  it('should apply correct size classes for emojis', () => {
    const { rerender } = render(
      <SubscriptionIconNext fallbackIcon="📺" size="sm" />
    );
    expect(screen.getByText('📺')).toHaveClass('text-base');

    rerender(<SubscriptionIconNext fallbackIcon="📺" size="md" />);
    expect(screen.getByText('📺')).toHaveClass('text-xl');

    rerender(<SubscriptionIconNext fallbackIcon="📺" size="lg" />);
    expect(screen.getByText('📺')).toHaveClass('text-2xl');
  });

  it('should apply custom className', () => {
    render(
      <SubscriptionIconNext
        icon="/icons/netflix.png"
        fallbackIcon="📺"
        size="md"
        className="custom-class"
      />
    );

    const img = screen.getByRole('img');
    expect(img).toHaveClass('custom-class');
  });
});

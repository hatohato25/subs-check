import { describe, expect, it } from 'vitest';
import { formatPrice } from '@/lib/format';

describe('formatPrice', () => {
  it('should format basic prices correctly', () => {
    expect(formatPrice(0)).toBe('¥0');
    expect(formatPrice(100)).toBe('¥100');
    expect(formatPrice(1000)).toBe('¥1,000');
    expect(formatPrice(1234)).toBe('¥1,234');
  });

  it('should format large prices with thousand separators', () => {
    expect(formatPrice(10000)).toBe('¥10,000');
    expect(formatPrice(123456)).toBe('¥123,456');
    expect(formatPrice(1234567)).toBe('¥1,234,567');
    expect(formatPrice(9999999)).toBe('¥9,999,999');
  });

  it('should handle negative values by converting to absolute', () => {
    expect(formatPrice(-100)).toBe('¥100');
    expect(formatPrice(-1234)).toBe('¥1,234');
  });

  it('should floor decimal values', () => {
    expect(formatPrice(123.45)).toBe('¥123');
    expect(formatPrice(999.99)).toBe('¥999');
    expect(formatPrice(1000.01)).toBe('¥1,000');
  });

  it('should handle edge cases', () => {
    expect(formatPrice(0.1)).toBe('¥0');
    expect(formatPrice(0.9)).toBe('¥0');
    expect(formatPrice(-0.5)).toBe('¥0');
  });

  it('should format real subscription prices correctly', () => {
    // 実際のサブスク価格例
    expect(formatPrice(790)).toBe('¥790'); // Netflix (広告つき)
    expect(formatPrice(980)).toBe('¥980'); // Spotify
    expect(formatPrice(1026)).toBe('¥1,026'); // Hulu
    expect(formatPrice(1280)).toBe('¥1,280'); // YouTube Premium
    expect(formatPrice(2189)).toBe('¥2,189'); // U-NEXT
    expect(formatPrice(6480)).toBe('¥6,480'); // Adobe Creative Cloud
  });
});

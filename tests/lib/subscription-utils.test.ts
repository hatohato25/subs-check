import { describe, expect, it } from 'vitest';
import { getUniqueIcons } from '@/lib/subscription-utils';
import type { Subscription } from '@/types/subscription';

describe('getUniqueIcons', () => {
  it('should return unique icons from subscriptions', () => {
    const subscriptions: Subscription[] = [
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

    const result = getUniqueIcons(subscriptions);
    expect(result).toEqual(['/icon/netflix.png', '/icon/spotify.png']);
  });

  it('should deduplicate same icons', () => {
    const subscriptions: Subscription[] = [
      {
        id: 'netflix-basic',
        name: 'Netflix Basic',
        nameEn: 'Netflix Basic',
        price: 990,
        category: 'video',
        icon: '/icon/netflix.png',
        fallbackIcon: '📺',
        color: '#E50914',
      },
      {
        id: 'netflix-premium',
        name: 'Netflix Premium',
        nameEn: 'Netflix Premium',
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

    const result = getUniqueIcons(subscriptions);
    // 同じアイコンは1つにまとめられる
    expect(result).toEqual(['/icon/netflix.png', '/icon/spotify.png']);
    expect(result).toHaveLength(2);
  });

  it('should use fallbackIcon when icon is not provided', () => {
    const subscriptions: Subscription[] = [
      {
        id: 'custom',
        name: 'Custom Service',
        nameEn: 'Custom Service',
        price: 500,
        category: 'custom',
        fallbackIcon: '✨',
        color: '#333333',
      },
    ];

    const result = getUniqueIcons(subscriptions);
    expect(result).toEqual(['✨']);
  });

  it('should prefer icon over fallbackIcon', () => {
    const subscriptions: Subscription[] = [
      {
        id: 'service',
        name: 'Service',
        nameEn: 'Service',
        price: 1000,
        category: 'other',
        icon: '/icon/service.png',
        fallbackIcon: '📦',
        color: '#000000',
      },
    ];

    const result = getUniqueIcons(subscriptions);
    expect(result).toEqual(['/icon/service.png']);
  });

  it('should return empty array when no subscriptions', () => {
    const result = getUniqueIcons([]);
    expect(result).toEqual([]);
  });

  it('should handle mixed icon and fallbackIcon subscriptions', () => {
    const subscriptions: Subscription[] = [
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
        id: 'custom',
        name: 'Custom',
        nameEn: 'Custom',
        price: 500,
        category: 'custom',
        fallbackIcon: '✨',
        color: '#333333',
      },
    ];

    const result = getUniqueIcons(subscriptions);
    expect(result).toEqual(['/icon/netflix.png', '✨']);
  });
});

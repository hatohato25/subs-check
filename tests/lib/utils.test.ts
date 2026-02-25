import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('should merge multiple class names', () => {
    expect(cn('p-4', 'bg-white', 'text-black')).toBe('p-4 bg-white text-black');
  });

  it('should handle conditional class names', () => {
    expect(cn('p-4', true && 'bg-white', false && 'text-red')).toBe('p-4 bg-white');
  });

  it('should filter out falsy values', () => {
    expect(cn('p-4', null, undefined, false, 'bg-white')).toBe('p-4 bg-white');
  });

  it('should merge conflicting Tailwind classes correctly', () => {
    // WHY: tailwind-mergeは後から指定されたクラスを優先する
    expect(cn('bg-white', 'bg-blue-500')).toBe('bg-blue-500');
    expect(cn('p-4', 'p-8')).toBe('p-8');
  });

  it('should handle arrays of class names', () => {
    expect(cn(['p-4', 'bg-white'], 'text-black')).toBe('p-4 bg-white text-black');
  });

  it('should handle nested arrays', () => {
    expect(cn(['p-4', ['bg-white', 'text-black']])).toBe('p-4 bg-white text-black');
  });

  it('should handle objects with boolean values', () => {
    expect(
      cn({
        'p-4': true,
        'bg-white': true,
        'text-red': false,
      })
    ).toBe('p-4 bg-white');
  });

  it('should handle mixed inputs', () => {
    expect(
      cn(
        'p-4',
        ['bg-white', { 'text-black': true, 'text-red': false }],
        null,
        undefined,
        'rounded-md'
      )
    ).toBe('p-4 bg-white text-black rounded-md');
  });

  it('should handle empty input', () => {
    expect(cn()).toBe('');
  });

  it('should handle only falsy values', () => {
    expect(cn(null, undefined, false)).toBe('');
  });

  it('should handle whitespace correctly', () => {
    expect(cn('p-4 ', ' bg-white', '  text-black  ')).toBe('p-4 bg-white text-black');
  });

  it('should merge responsive classes correctly', () => {
    // WHY: 同じプロパティの異なるブレークポイントは両方保持される
    expect(cn('p-4 sm:p-6 md:p-8', 'lg:p-10')).toBe('p-4 sm:p-6 md:p-8 lg:p-10');
  });

  it('should override responsive classes when specified again', () => {
    // WHY: 同じブレークポイントのプロパティは後勝ち
    expect(cn('sm:p-4', 'sm:p-8')).toBe('sm:p-8');
  });

  it('should handle hover and focus variants correctly', () => {
    expect(cn('hover:bg-white', 'hover:bg-blue-500')).toBe('hover:bg-blue-500');
    expect(cn('focus:ring-2', 'focus:ring-4')).toBe('focus:ring-4');
  });

  it('should preserve arbitrary values', () => {
    // WHY: Tailwind CSSの任意値（[...]）は保持される
    expect(cn('bg-[#ffffff]', 'p-[20px]')).toBe('bg-[#ffffff] p-[20px]');
  });

  it('should merge important classes correctly', () => {
    // WHY: !important修飾子付きのクラスも正しくマージされる
    expect(cn('!p-4', '!p-8')).toBe('!p-8');
  });

  it('should handle complex real-world scenarios', () => {
    // WHY: 実際のコンポーネントで使用されるような複雑なケース
    const isActive = true;
    const isDisabled = false;
    const size = 'large';

    const result = cn(
      'flex items-center justify-center',
      'px-4 py-2 rounded-md',
      'transition-colors duration-150',
      isActive && 'bg-blue-500 text-white',
      isDisabled && 'opacity-50 cursor-not-allowed',
      {
        'px-6 py-3': size === 'large',
        'px-3 py-1.5': size === 'small',
      }
    );

    expect(result).toBe(
      'flex items-center justify-center rounded-md transition-colors duration-150 bg-blue-500 text-white px-6 py-3'
    );
  });
});

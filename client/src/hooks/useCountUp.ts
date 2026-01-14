'use client';

import { useEffect, useState, useRef } from 'react';

export interface UseCountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  decimals?: number;
  separator?: string;
  prefix?: string;
  suffix?: string;
  easingFn?: (t: number, b: number, c: number, d: number) => number;
  onComplete?: () => void;
}

/**
 * Hook to animate counting up from start to end value
 *
 * @param options - Configuration options for the count up animation
 * @returns The current animated value as a formatted string
 *
 * @example
 * const count = useCountUp({ end: 1000, duration: 2000, prefix: '$' });
 * return <div>{count}</div>
 */
export function useCountUp({
  start = 0,
  end,
  duration = 1000,
  decimals = 0,
  separator = ',',
  prefix = '',
  suffix = '',
  easingFn = easeOutExpo,
  onComplete
}: UseCountUpOptions): string {
  const [count, setCount] = useState(start);
  const frameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = timestamp - startTimeRef.current;
      const currentCount = easingFn(progress, start, end - start, duration);

      if (progress < duration) {
        setCount(currentCount);
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
        if (onComplete) {
          onComplete();
        }
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [start, end, duration, onComplete]);

  // Format the number
  const formattedValue = formatNumber(count, decimals, separator);
  return `${prefix}${formattedValue}${suffix}`;
}

/**
 * Format a number with decimals and thousand separators
 */
function formatNumber(value: number, decimals: number, separator: string): string {
  const fixed = value.toFixed(decimals);
  const parts = fixed.split('.');

  // Add thousand separators
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return parts.join('.');
}

/**
 * Easing function: easeOutExpo
 * Decelerating to zero velocity
 */
function easeOutExpo(t: number, b: number, c: number, d: number): number {
  return c * (-Math.pow(2, (-10 * t) / d) + 1) + b;
}

/**
 * Alternative easing functions
 */

export function linear(t: number, b: number, c: number, d: number): number {
  return (c * t) / d + b;
}

export function easeInQuad(t: number, b: number, c: number, d: number): number {
  t /= d;
  return c * t * t + b;
}

export function easeOutQuad(t: number, b: number, c: number, d: number): number {
  t /= d;
  return -c * t * (t - 2) + b;
}

export function easeInOutQuad(t: number, b: number, c: number, d: number): number {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t + b;
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
}

export function easeInCubic(t: number, b: number, c: number, d: number): number {
  t /= d;
  return c * t * t * t + b;
}

export function easeOutCubic(t: number, b: number, c: number, d: number): number {
  t /= d;
  t--;
  return c * (t * t * t + 1) + b;
}

/**
 * Simplified hook for common use cases
 */
export function useSimpleCountUp(end: number, duration = 1000): string {
  return useCountUp({ end, duration });
}

/**
 * Hook for currency count up
 */
export function useCurrencyCountUp(
  end: number,
  currency = '$',
  duration = 1000
): string {
  return useCountUp({
    end,
    duration,
    prefix: currency,
    decimals: 2,
    separator: ','
  });
}

/**
 * Hook for percentage count up
 */
export function usePercentageCountUp(
  end: number,
  duration = 1000,
  decimals = 1
): string {
  return useCountUp({
    end,
    duration,
    suffix: '%',
    decimals,
    separator: ','
  });
}

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter } from '../src/services/rateLimiter.js';

describe('RateLimiter Service', () => {
  beforeEach(() => {
    RateLimiter.clear();
  });

  it('should allow requests within limit', () => {
    const key = 'test-user';
    const limit = 3;
    const window = 1000;

    expect(RateLimiter.check(key, limit, window).limited).toBe(false);
    expect(RateLimiter.check(key, limit, window).limited).toBe(false);
    const result = RateLimiter.check(key, limit, window);
    expect(result.limited).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should limit requests exceeding limit', () => {
    const key = 'test-user';
    const limit = 2;
    const window = 1000;

    RateLimiter.check(key, limit, window);
    RateLimiter.check(key, limit, window);
    
    const result = RateLimiter.check(key, limit, window);
    expect(result.limited).toBe(true);
    expect(result.resetText).toMatch(/\ds/);
  });

  it('should reset after window expires', async () => {
    vi.useFakeTimers();
    const key = 'test-user';
    const limit = 1;
    const window = 1000;

    RateLimiter.check(key, limit, window);
    expect(RateLimiter.check(key, limit, window).limited).toBe(true);

    vi.advanceTimersByTime(1100);

    expect(RateLimiter.check(key, limit, window).limited).toBe(false);
    vi.useRealTimers();
  });

  it('should track keys independently', () => {
    const key1 = 'user-1';
    const key2 = 'user-2';
    const limit = 1;
    const window = 1000;

    expect(RateLimiter.check(key1, limit, window).limited).toBe(false);
    expect(RateLimiter.check(key1, limit, window).limited).toBe(true);
    
    expect(RateLimiter.check(key2, limit, window).limited).toBe(false);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { isDuplicate, clearCache, cacheSize, startCleanup, stopCleanup } from '../src/core/idempotency.js';

describe('idempotency', () => {
  beforeEach(() => {
    clearCache();
    stopCleanup();
  });

  it('returns false for first occurrence', () => {
    expect(isDuplicate('msg-001')).toBe(false);
  });

  it('returns true for duplicate', () => {
    isDuplicate('msg-002');
    expect(isDuplicate('msg-002')).toBe(true);
  });

  it('tracks different IDs independently', () => {
    isDuplicate('msg-a');
    isDuplicate('msg-b');
    expect(isDuplicate('msg-a')).toBe(true);
    expect(isDuplicate('msg-b')).toBe(true);
    expect(isDuplicate('msg-c')).toBe(false);
  });

  it('tracks cache size', () => {
    isDuplicate('m1');
    isDuplicate('m2');
    isDuplicate('m3');
    expect(cacheSize()).toBe(3);
  });

  it('clears cache', () => {
    isDuplicate('m1');
    clearCache();
    expect(cacheSize()).toBe(0);
    expect(isDuplicate('m1')).toBe(false);
  });

  it('starts and stops cleanup without error', () => {
    expect(() => startCleanup(100)).not.toThrow();
    expect(() => stopCleanup()).not.toThrow();
  });
});

/** @type {Map<string, number[]>} */
const store = new Map();

/**
 * Professional In-Memory Sliding Window Rate Limiter
 */
export class RateLimiter {
  /**
   * Check if a request should be limited
   * @param {string} key - Unique identifier (IP, JID, or Token)
   * @param {number} limit - Max requests allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {{ limited: boolean, remaining: number, resetText: string }}
   */
  static check(key, limit, windowMs) {
    const now = Date.now();
    const timestamps = store.get(key) || [];

    const validTimestamps = timestamps.filter(ts => now - ts < windowMs);

    if (validTimestamps.length >= limit) {
      const oldest = validTimestamps[0];
      const resetIn = Math.ceil((windowMs - (now - oldest)) / 1000);
      
      return {
        limited: true,
        remaining: 0,
        resetText: `${resetIn}s`
      };
    }

    validTimestamps.push(now);
    store.set(key, validTimestamps);

    return {
      limited: false,
      remaining: limit - validTimestamps.length,
      resetText: '0s'
    };
  }

  /**
   * Clear the entire rate limiter store
   */
  static clear() {
    store.clear();
  }
}

setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of store.entries()) {
    const hasRecentActivity = timestamps.some(ts => now - ts < 15 * 60 * 1000);
    if (!hasRecentActivity) {
      store.delete(key);
    }
  }
}, 10 * 60 * 1000);

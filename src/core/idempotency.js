const DEFAULT_TTL = 30_000;
const cache = new Map();

let cleanupInterval = null;

/** @param {string} messageId @returns {boolean} */
export function isDuplicate(messageId) {
  if (cache.has(messageId)) return true;
  cache.set(messageId, Date.now());
  return false;
}

export function startCleanup(ttl = DEFAULT_TTL) {
  if (cleanupInterval) return;

  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of cache) {
      if (now - timestamp > ttl) cache.delete(key);
    }
  }, ttl);

  cleanupInterval.unref();
}

export function stopCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

export function clearCache() {
  cache.clear();
}

/** @returns {number} */
export function cacheSize() {
  return cache.size;
}

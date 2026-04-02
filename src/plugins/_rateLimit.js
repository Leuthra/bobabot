import { RateLimiter } from '../services/rateLimiter.js';
import config from '../config/index.js';

/**
 * Universal Bot Command Rate Limiter Middleware
 * Prevents users from spamming commands across all platforms.
 */
export default async function rateLimitMiddleware(m, next) {
  if (!m.command) return next();

  if (m.isOwner) return next();

  const { max, window } = config.bot.limit;
  const key = `bot:${m.platform}:${m.sender}`;

  const result = RateLimiter.check(key, max, window);

  if (result.limited) {
    await m.reply(`⚠️ *Too Many Requests*\n\nPlease slow down. You can send another command in ${result.resetText}.`);
    return;
  }

  return next();
}

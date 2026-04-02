import { RateLimiter } from '../../services/rateLimiter.js';
import config from '../../config/index.js';

/**
 * Hono Middleware to apply rate limiting to API routes
 */
export const rateLimitMiddleware = async (c, next) => {
  const authHeader = c.req.header('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  const ip = c.req.header('x-forwarded-for') || '127.0.0.1';
  
  const key = token || ip;
  const { max, window } = config.api.limit;

  const result = RateLimiter.check(`api:${key}`, max, window);

  if (result.limited) {
    return c.json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${result.resetText}.`,
      retry_after: result.resetText
    }, 429);
  }

  c.header('X-RateLimit-Limit', String(max));
  c.header('X-RateLimit-Remaining', String(result.remaining));

  await next();
};

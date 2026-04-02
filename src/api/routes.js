import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { bearerAuth } from 'hono/bearer-auth';
import { getStatus, broadcastMessage, getUsers, updateUser } from './controllers.js';
import { createLogger } from '../utils/logger.js';
import config from '../config/index.js';
import { rateLimitMiddleware } from './middlewares/rateLimit.js';

const log = createLogger('api');

export const app = new Hono().basePath('/api');

app.use('*', rateLimitMiddleware);

app.get('/status', getStatus);

if (config.api.secret) {
  app.use('*', bearerAuth({ token: config.api.secret }));
}

app.post('/broadcast', broadcastMessage);
app.get('/users', getUsers);
app.patch('/users/:id', updateUser);

/** @param {number} [port] */
export function startAPI(port) {
  const p = port || config.api.port;

  serve({ fetch: app.fetch, port: p }, () => {
    log.info(`API server running on http://localhost:${p}`);
  });
}

import { getPlugins } from '../core/pluginLoader.js';
import { runtime, delay } from '../utils/helpers.js';
import { getAdapters } from '../core/bootstrap.js';
import * as userService from '../services/user.js';
import prisma from '../services/database.js';
import config from '../config/index.js';

/** @param {import('hono').Context} c */
export async function getStatus(c) {
  const adapters = getAdapters();
  
  return c.json({
    status: 'online',
    name: config.bot.name || 'Bobabot',
    version: '2.0.0',
    uptime: runtime(process.uptime()),
    plugins: getPlugins().size,
    adapters: adapters.map(a => ({ name: a.name, connected: a.isConnected })),
    memory: `${(process.memoryUsage.rss() / 1024 / 1024).toFixed(1)} MB`,
  });
}

/** @param {import('hono').Context} c */
export async function broadcastMessage(c) {
  const { platform = 'all', text, media } = await c.req.json();
  
  if (!text && !media) {
    return c.json({ error: 'Message body or media is required' }, 400);
  }

  const users = await userService.getUsersForBroadcast(platform);
  const activeAdapters = getAdapters();
  
  const results = {
    total: users.length,
    success: 0,
    failed: 0,
    details: [],
  };

  (async () => {
    for (const user of users) {
      const adapter = activeAdapters.find(a => a.name === user.platform);
      if (!adapter || !adapter.isConnected) {
        results.failed++;
        continue;
      }

      try {
        if (media) {
          await adapter.sendMedia(user.platformId, media);
        } else {
          await adapter.sendMessage(user.platformId, text);
        }
        results.success++;
        
        await delay(platform === 'whatsapp' ? 1500 : 500);
      } catch (err) {
        results.failed++;
      }
    }
  })();

  return c.json({ 
    message: 'Broadcast started', 
    target_count: users.length,
    note: 'Processing in background'
  });
}

/** @param {import('hono').Context} c */
export async function getUsers(c) {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100
  });
  return c.json(users);
}

/** @param {import('hono').Context} c */
export async function updateUser(c) {
  const id = c.req.param('id');
  const body = await c.req.json();
  
  try {
    const updated = await prisma.user.update({
      where: { id },
      data: body
    });
    return c.json(updated);
  } catch (err) {
    return c.json({ error: err.message }, 400);
  }
}

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { connectDatabase, disconnectDatabase } from '../services/database.js';
import { loadPlugins, loadMiddlewares, startPluginHandler } from '../core/pluginLoader.js';
import { startCleanup, stopCleanup } from '../core/idempotency.js';
import { startAPI } from '../api/routes.js';
import { WhatsAppAdapter } from '../adapters/whatsapp/index.js';
import { TelegramAdapter } from '../adapters/telegram/index.js';
import { DiscordAdapter } from '../adapters/discord/index.js';
import eventBus from '../core/eventBus.js';
import config from '../config/index.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('bootstrap');
const __dirname = dirname(fileURLToPath(import.meta.url));

const adapters = [];

/** @returns {import('../adapters/base.js').BaseAdapter[]} */
export const getAdapters = () => adapters;

export async function bootstrap() {
  log.info(`Starting ${config.bot.name} v2.0...`);

  await connectDatabase();

  const pluginsDir = join(__dirname, '..', 'plugins');
  await loadMiddlewares(pluginsDir);
  await loadPlugins(pluginsDir);
  startPluginHandler();

  startCleanup();

  startAPI();

  if (config.whatsapp.sessionId) {
    const wa = new WhatsAppAdapter(eventBus);
    await wa.start();
    adapters.push(wa);
  }

  if (config.telegram.token) {
    log.info('Telegram token found, initializing adapter...');
    const tg = new TelegramAdapter(eventBus);
    await tg.start().catch(err => log.error({ err: err.message }, 'Telegram adapter failed to start'));
    adapters.push(tg);
  }

  if (config.discord.token) {
    log.info('Discord token found, initializing adapter...');
    const dc = new DiscordAdapter(eventBus);
    await dc.start().catch(err => log.error({ err: err.message }, 'Discord adapter failed to start'));
    adapters.push(dc);
  }

  registerShutdownHandlers();

  log.info(`${config.bot.name} is ready`);
}

function registerShutdownHandlers() {
  const shutdown = async (signal) => {
    log.info({ signal }, 'Shutting down...');

    for (const adapter of adapters) {
      try {
        await adapter.stop();
      } catch (err) {
        log.error({ adapter: adapter.name, err: err.message }, 'Adapter stop error');
      }
    }

    stopCleanup();
    await disconnectDatabase();

    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('uncaughtException', (err) => {
    log.fatal({ err }, 'Uncaught exception');
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    log.error({ reason }, 'Unhandled rejection');
  });
}

import { Telegraf } from 'telegraf';
import { createLogger } from '../../utils/logger.js';
import config from '../../config/index.js';

const log = createLogger('tg-client');

/**
 * @param {import('../../core/eventBus.js').default} eventBus
 */
export async function createTelegramClient(eventBus) {
  const token = config.telegram.token;
  if (!token) {
    log.error('Telegram token is missing!');
    throw new Error('TG_BOT_TOKEN is required for Telegram adapter');
  }

  const bot = new Telegraf(token);

  bot.catch((err, ctx) => {
    log.error({ err: err.message, updateId: ctx.update.update_id }, 'Telegraf error');
  });

  return bot;
}

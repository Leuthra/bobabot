import { createLogger } from '../../utils/logger.js';
import { serializeTelegram } from '../../serializers/telegram.js';

const log = createLogger('tg-events');

/**
 * @param {import('telegraf').Telegraf} bot
 * @param {import('../../core/eventBus.js').default} eventBus
 */
export function registerTelegramEvents(bot, eventBus) {
  bot.on(['message', 'callback_query'], async (ctx) => {
    try {
      const m = await serializeTelegram(ctx);
      if (!m) return;

      eventBus.emit('message.incoming', m);
    } catch (err) {
      log.error({ err: err.message }, 'Telegram serialization failed');
    }
  });

  log.debug('Telegram event listeners registered');
}

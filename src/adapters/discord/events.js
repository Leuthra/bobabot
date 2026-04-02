import { createLogger } from '../../utils/logger.js';
import { serializeDiscord } from '../../serializers/discord.js';

const log = createLogger('dc-events');

/**
 * @param {import('oceanic.js').Client} client
 * @param {import('../../core/eventBus.js').default} eventBus
 */
export function registerDiscordEvents(client, eventBus) {
  client.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;

    try {
      const m = await serializeDiscord(client, msg);
      if (!m) return;

      eventBus.emit('message.incoming', m);
    } catch (err) {
      log.error({ err: err.message, messageId: msg.id }, 'Discord serialization failed');
    }
  });

  client.on('ready', () => {
    log.info(`Discord client ready as ${client.user.username}`);
    eventBus.emit('adapter.ready', { platform: 'discord' });
  });

  log.debug('Discord event listeners registered');
}

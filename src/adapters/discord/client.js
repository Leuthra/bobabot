import { Client } from 'oceanic.js';
import { createLogger } from '../../utils/logger.js';
import config from '../../config/index.js';

const log = createLogger('dc-client');

/**
 * @param {import('../../core/eventBus.js').default} eventBus
 */
export async function createDiscordClient(eventBus) {
  const token = config.discord.token;
  if (!token) {
    log.error('Discord token is missing!');
    throw new Error('DISCORD_BOT_TOKEN is required for Discord adapter');
  }

  const client = new Client({
    auth: `Bot ${token}`,
    gateway: {
      intents: ['GUILD_MESSAGES', 'MESSAGE_CONTENT', 'DIRECT_MESSAGES', 'GUILDS']
    }
  });

  client.on('error', (err) => {
    log.error({ err: err.message }, 'Oceanic client error');
  });

  return client;
}

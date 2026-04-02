import { BaseAdapter } from '../base.js';
import { createTelegramClient } from './client.js';
import { registerTelegramEvents } from './events.js';
import { sendText, sendMedia, sendReaction, deleteMessage } from './sender.js';
import { createLogger } from '../../utils/logger.js';

const log = createLogger('tg-adapter');

export class TelegramAdapter extends BaseAdapter {
  /** @param {import('../../core/eventBus.js').default} eventBus */
  constructor(eventBus) {
    super('telegram', eventBus);
    this.bot = null;
  }

  async start() {
    try {
      log.info('Starting Telegram adapter...');
      this.bot = await createTelegramClient(this.eventBus);
      
      registerTelegramEvents(this.bot, this.eventBus);
      
      this.bot.launch({ dropPendingUpdates: true });
      this.isConnected = true;
      
      log.info('Telegram adapter running');
      this.eventBus.emit('adapter.ready', { platform: 'telegram' });
    } catch (err) {
      log.error({ err: err.message }, 'Failed to start Telegram adapter');
      throw err;
    }
  }

  async stop() {
    if (this.bot) {
      this.bot.stop('SIGTERM');
      this.bot = null;
    }
    this.isConnected = false;
    log.info('Telegram adapter stopped');
  }

  /** @param {string} to @param {string} text @param {object} [options] */
  async sendMessage(to, text, options = {}) {
    if (!this.bot) throw new Error('Telegram bot not initialized');
    return sendText(this.bot, to, text, options);
  }

  /** @param {string} to @param {object} media */
  async sendMedia(to, media) {
    if (!this.bot) throw new Error('Telegram bot not initialized');
    return sendMedia(this.bot, to, media);
  }

  /** @param {string} to @param {object} key @param {string} emoji */
  async sendReaction(to, key, emoji) {
    if (!this.bot) throw new Error('Telegram bot not initialized');
    return sendReaction(this.bot, to, key, emoji);
  }

  /** @param {string} to @param {object} key */
  async deleteMessage(to, key) {
    if (!this.bot) throw new Error('Telegram bot not initialized');
    return deleteMessage(this.bot, to, key);
  }
}

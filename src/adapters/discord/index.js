import { BaseAdapter } from '../base.js';
import { createDiscordClient } from './client.js';
import { registerDiscordEvents } from './events.js';
import { sendText, sendMedia, sendReaction, deleteMessage } from './sender.js';
import { createLogger } from '../../utils/logger.js';

const log = createLogger('dc-adapter');

export class DiscordAdapter extends BaseAdapter {
  /** @param {import('../../core/eventBus.js').default} eventBus */
  constructor(eventBus) {
    super('discord', eventBus);
    this.client = null;
  }

  async start() {
    try {
      log.info('Starting Discord adapter...');
      this.client = await createDiscordClient(this.eventBus);

      registerDiscordEvents(this.client, this.eventBus);

      await this.client.connect();
      this.isConnected = true;

      log.info('Discord adapter running');
    } catch (err) {
      log.error({ err: err.message }, 'Failed to start Discord adapter');
      throw err;
    }
  }

  async stop() {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }
    this.isConnected = false;
    log.info('Discord adapter stopped');
  }

  /** @param {string} to @param {string} text @param {object} [options] */
  async sendMessage(to, text, options = {}) {
    if (!this.client) throw new Error('Discord client not initialized');
    return sendText(this.client, to, text, options);
  }

  /** @param {string} to @param {object} media */
  async sendMedia(to, media) {
    if (!this.client) throw new Error('Discord client not initialized');
    return sendMedia(this.client, to, media);
  }

  /** @param {string} to @param {object} key @param {string} emoji */
  async sendReaction(to, key, emoji) {
    if (!this.client) throw new Error('Discord client not initialized');
    return sendReaction(this.client, to, key, emoji);
  }

  /** @param {string} to @param {object} key */
  async deleteMessage(to, key) {
    if (!this.client) throw new Error('Discord client not initialized');
    return deleteMessage(this.client, to, key);
  }
}

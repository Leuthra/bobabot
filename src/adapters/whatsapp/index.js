import { BaseAdapter } from '../base.js';
import { createWhatsAppClient } from './client.js';
import { sendText, sendMedia, sendReaction, deleteMessage } from './sender.js';
import { createLogger } from '../../utils/logger.js';

const log = createLogger('wa-adapter');

export class WhatsAppAdapter extends BaseAdapter {
  constructor(eventBus) {
    super('whatsapp', eventBus);
    this.sock = null;
  }

  async start() {
    log.info('Starting WhatsApp adapter...');
    this.sock = await createWhatsAppClient(this.eventBus, (newSock) => {
      this.sock = newSock;
      this.isConnected = true;
      log.debug('Socket reference updated');
    });
    this.isConnected = true;
  }

  async stop() {
    if (this.sock) {
      this.sock.end(undefined);
      this.sock = null;
    }
    this.isConnected = false;
    log.info('WhatsApp adapter stopped');
  }

  /** @param {string} to @param {string} text @param {object} [options] */
  async sendMessage(to, text, options = {}) {
    if (!this.sock) throw new Error('WhatsApp not connected');
    return sendText(this.sock, to, text, options);
  }

  /** @param {string} to @param {object} media */
  async sendMedia(to, media) {
    if (!this.sock) throw new Error('WhatsApp not connected');
    return sendMedia(this.sock, to, media);
  }

  /** @param {string} to @param {object} key @param {string} emoji */
  async sendReaction(to, key, emoji) {
    if (!this.sock) throw new Error('WhatsApp not connected');
    return sendReaction(this.sock, to, key, emoji);
  }

  /** @param {string} to @param {object} key */
  async deleteMessage(to, key) {
    if (!this.sock) throw new Error('WhatsApp not connected');
    return deleteMessage(this.sock, to, key);
  }
}

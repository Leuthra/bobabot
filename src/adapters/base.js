export class BaseAdapter {
  /** @param {string} name @param {import('../core/eventBus.js').default} eventBus */
  constructor(name, eventBus) {
    this.name = name;
    this.eventBus = eventBus;
    this.isConnected = false;
  }

  /** @returns {Promise<void>} */
  async start() {
    throw new Error(`${this.name}: start() not implemented`);
  }

  /** @returns {Promise<void>} */
  async stop() {
    throw new Error(`${this.name}: stop() not implemented`);
  }

  /** @param {string} to @param {string} text @param {object} [options] */
  async sendMessage(to, text, options = {}) {
    throw new Error(`${this.name}: sendMessage() not implemented`);
  }

  /** @param {string} to @param {object} media */
  async sendMedia(to, media) {
    throw new Error(`${this.name}: sendMedia() not implemented`);
  }

  /** @param {string} to @param {object} key @param {string} emoji */
  async sendReaction(to, key, emoji) {
    throw new Error(`${this.name}: sendReaction() not implemented`);
  }

  /** @param {string} to @param {object} key */
  async deleteMessage(to, key) {
    throw new Error(`${this.name}: deleteMessage() not implemented`);
  }
}

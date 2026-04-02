import { createLogger } from '../../utils/logger.js';

const log = createLogger('dc-sender');

/**
 * @param {import('oceanic.js').Client} client
 * @param {string} to
 * @param {string} text
 * @param {object} [options]
 */
export async function sendText(client, to, text, options = {}) {
  try {
    return await client.rest.channels.createMessage(to, { content: text, ...options });
  } catch (err) {
    log.error({ to, err: err.message }, 'Failed to send Discord text');
    throw err;
  }
}

/**
 * @param {import('oceanic.js').Client} client
 * @param {string} to
 * @param {object} media
 */
export async function sendMedia(client, to, media) {
  try {
    const { url, caption, buffer, filename } = media;
    const name = filename || (url ? url.split('/').pop() : 'file.bin');
    const contents = buffer || { url };

    return await client.rest.channels.createMessage(to, {
      content: caption || '',
      files: [{ contents, name }]
    });
  } catch (err) {
    log.error({ to, err: err.message }, 'Failed to send Discord media');
    throw err;
  }
}

/**
 * @param {import('oceanic.js').Client} client
 * @param {string} to
 * @param {object} key
 * @param {string} emoji
 */
export async function sendReaction(client, to, key, emoji) {
  try {
    const messageId = key.id || key;
    return await client.rest.channels.createReaction(to, messageId, emoji);
  } catch (err) {
    log.error({ to, err: err.message }, 'Failed to add Discord reaction');
    throw err;
  }
}

/**
 * @param {import('oceanic.js').Client} client
 * @param {string} to
 * @param {object} key
 */
export async function deleteMessage(client, to, key) {
  try {
    const messageId = key.id || key;
    return await client.rest.channels.deleteMessage(to, messageId);
  } catch (err) {
    log.error({ to, err: err.message }, 'Failed to delete Discord message');
    throw err;
  }
}

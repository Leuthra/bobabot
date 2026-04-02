import { createLogger } from '../../utils/logger.js';

const log = createLogger('tg-sender');

/**
 * @param {import('telegraf').Telegram | import('telegraf').Context} target
 * @param {string} to
 * @param {string} text
 * @param {object} [options]
 */
export async function sendText(target, to, text, options = {}) {
  try {
    const tg = target.telegram || target;
    return await tg.sendMessage(to, text, options);
  } catch (err) {
    log.error({ to, err: err.message }, 'Failed to send Telegram text');
    throw err;
  }
}

/**
 * @param {import('telegraf').Telegram | import('telegraf').Context} target
 * @param {string} to
 * @param {object} media
 */
export async function sendMedia(target, to, media) {
  try {
    const tg = target.telegram || target;
    const { url, caption, type, buffer } = media;
    const source = buffer || { url };

    switch (type) {
      case 'image':
      case 'photo':
        return await tg.sendPhoto(to, source, { caption });
      case 'video':
        return await tg.sendVideo(to, source, { caption });
      case 'audio':
        return await tg.sendAudio(to, source, { caption });
      default:
        return await tg.sendDocument(to, source, { caption });
    }
  } catch (err) {
    log.error({ to, err: err.message }, 'Failed to send Telegram media');
    throw err;
  }
}

/**
 * @param {import('telegraf').Telegram | import('telegraf').Context} target
 * @param {string} to
 * @param {object} key
 * @param {string} emoji
 */
export async function sendReaction(target, to, key, emoji) {
  try {
    const tg = target.telegram || target;
    if (tg.setMessageReaction) {
      return await tg.setMessageReaction(to, key.id || key, [{ type: 'emoji', emoji }]);
    }
  } catch (err) {
    log.error({ to, err: err.message }, 'Failed to send Telegram reaction');
    throw err;
  }
}

/**
 * @param {import('telegraf').Telegram | import('telegraf').Context} target
 * @param {string} to
 * @param {object} key
 */
export async function deleteMessage(target, to, key) {
  try {
    const tg = target.telegram || target;
    return await tg.deleteMessage(to, key.id || key);
  } catch (err) {
    log.error({ to, err: err.message }, 'Failed to delete Telegram message');
    throw err;
  }
}

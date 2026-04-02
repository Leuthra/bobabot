import { createLogger } from '../../utils/logger.js';

const log = createLogger('wa-sender');

/** @param {import('@whiskeysockets/baileys').WASocket} sock @param {string} jid @param {string} text @param {object} [options] */
export async function sendText(sock, jid, text, options = {}) {
  return sock.sendMessage(jid, { text, ...options });
}

/** @param {import('@whiskeysockets/baileys').WASocket} sock @param {string} jid @param {object} media */
export async function sendMedia(sock, jid, media) {
  const { type, buffer, url, caption, mimetype, fileName, gifPlayback } = media;

  const content = {};

  if (type === 'image') {
    content.image = buffer || { url };
    if (caption) content.caption = caption;
    if (mimetype) content.mimetype = mimetype;
  } else if (type === 'video') {
    content.video = buffer || { url };
    if (caption) content.caption = caption;
    if (mimetype) content.mimetype = mimetype;
    if (gifPlayback) content.gifPlayback = true;
  } else if (type === 'audio') {
    content.audio = buffer || { url };
    content.mimetype = mimetype || 'audio/mpeg';
    content.ptt = media.ptt || false;
  } else if (type === 'document') {
    content.document = buffer || { url };
    content.mimetype = mimetype || 'application/octet-stream';
    if (fileName) content.fileName = fileName;
    if (caption) content.caption = caption;
  } else if (type === 'sticker') {
    content.sticker = buffer || { url };
  }

  return sock.sendMessage(jid, content);
}

/** @param {import('@whiskeysockets/baileys').WASocket} sock @param {string} jid @param {object} key @param {string} emoji */
export async function sendReaction(sock, jid, key, emoji) {
  return sock.sendMessage(jid, { react: { text: emoji, key } });
}

/** @param {import('@whiskeysockets/baileys').WASocket} sock @param {string} jid @param {object} key */
export async function deleteMessage(sock, jid, key) {
  return sock.sendMessage(jid, { delete: key });
}

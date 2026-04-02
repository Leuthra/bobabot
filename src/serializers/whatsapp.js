import { downloadMediaMessage, getContentType } from '@whiskeysockets/baileys';
import { parseCommand, isGroupJid } from '../utils/helpers.js';
import { getUserProfile } from '../services/user.js';
import config from '../config/index.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('wa-serializer');

/** @param {import('@whiskeysockets/baileys').WASocket} sock @param {import('@whiskeysockets/baileys').WAMessage} raw */
export async function serializeWhatsApp(sock, raw) {
  const key = raw.key;
  const from = key.remoteJid;
  if (!from) return null;

  const isGroup = isGroupJid(from);
  const sender = isGroup
    ? key.participant || key.remoteJidAlt || ''
    : from;

  const msgType = getContentType(raw.message);
  if (!msgType) return null;

  const body = extractBody(raw.message, msgType);
  const parsed = parseCommand(body, config.bot.prefix);

  const pushName = raw.pushName || '';
  const userProfile = await getUserProfile(sender, 'whatsapp', pushName);

  let groupMetadata = null;
  let isAdmin = false;
  let isBotAdmin = false;

  if (isGroup) {
    try {
      groupMetadata = await sock.groupMetadata(from);
      const rawBotId = sock.user?.id || '';
      const botId = rawBotId.replace(/:\d+/, '');
      const botLid = sock.user?.lid?.replace(/:\d+/, '') || '';
      const participants = groupMetadata.participants || [];

      const hasAdminRole = (p) => p.admin === 'admin' || p.admin === 'superadmin';
      const matchId = (p, id) => {
        const pid = p.id?.replace(/:\d+/, '') || '';
        const ppn = p.phoneNumber?.replace(/:\d+/, '') || '';
        return pid === id || ppn === id;
      };

      isAdmin = participants.some(
        p => (matchId(p, sender.replace(/:\d+/, '')) ) && hasAdminRole(p)
      );

      isBotAdmin = participants.some(
        p => (matchId(p, botId) || matchId(p, botLid)) && hasAdminRole(p)
      );
    } catch (err) {
      log.warn({ from, err: err.message }, 'Failed to fetch group metadata');
    }
  }

  const isOwner = config.bot.owner ? sender.includes(config.bot.owner) : false;

  const m = {
    id: key.id,
    from,
    sender,
    pushName,
    platform: 'whatsapp',

    body: body || '',
    prefix: parsed?.prefix || '',
    command: parsed?.command || '',
    args: parsed?.args || [],
    text: parsed?.text || '',
    type: msgType.replace('Message', '').replace('message', ''),

    isGroup,
    isOwner,
    isAdmin,
    isBotAdmin,

    user: userProfile,
    groupMetadata,

    /** @param {string} text */
    reply: async (text) => {
      return sock.sendMessage(from, { text }, { quoted: raw });
    },

    /** @param {object} media */
    sendMedia: async (media) => {
      const { sendMedia: send } = await import('../adapters/whatsapp/sender.js');
      return send(sock, from, media);
    },

    /** @param {string} emoji */
    react: async (emoji) => {
      return sock.sendMessage(from, { react: { text: emoji, key } });
    },

    /** @returns {Promise<Buffer>} */
    download: async () => {
      return downloadMediaMessage(raw, 'buffer', {});
    },

    _raw: raw,
    _client: sock,
    _platform: 'whatsapp',
  };

  return m;
}

/** @param {object} message @param {string} msgType */
function extractBody(message, msgType) {
  if (!message) return '';

  const content = message[msgType];

  if (msgType === 'conversation') return message.conversation || '';
  if (msgType === 'extendedTextMessage') return content?.text || '';
  if (msgType === 'imageMessage') return content?.caption || '';
  if (msgType === 'videoMessage') return content?.caption || '';
  if (msgType === 'documentMessage') return content?.caption || '';
  if (msgType === 'buttonsResponseMessage') return content?.selectedButtonId || '';
  if (msgType === 'listResponseMessage') return content?.singleSelectReply?.selectedRowId || '';
  if (msgType === 'templateButtonReplyMessage') return content?.selectedId || '';

  return '';
}

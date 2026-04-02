import { getUserProfile } from '../services/user.js';
import { parseCommand } from '../utils/helpers.js';
import config from '../config/index.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('tg-serializer');

/**
 * @param {import('telegraf').Context} ctx
 */
export async function serializeTelegram(ctx) {
  const msg = ctx.message || ctx.callbackQuery?.message;
  if (!msg) return null;

  const chat = ctx.chat;
  const fromUser = ctx.from;
  if (!chat || !fromUser) return null;

  const isGroup = chat.type === 'group' || chat.type === 'supergroup';
  const sender = String(fromUser.id);
  const pushName = [fromUser.first_name, fromUser.last_name].filter(Boolean).join(' ');

  const body = msg.text || msg.caption || ctx.callbackQuery?.data || '';
  const parsed = parseCommand(body, config.bot.prefix);

  const userProfile = await getUserProfile(sender, 'telegram', pushName);

  let isAdmin = false;
  if (isGroup) {
    try {
      const member = await ctx.getChatMember(fromUser.id);
      isAdmin = ['administrator', 'creator'].includes(member.status);
    } catch (err) {
      log.warn({ chatId: chat.id, userId: fromUser.id, err: err.message }, 'Failed to get chat member status');
    }
  }

  const isOwner = config.bot.owner ? sender === config.bot.owner : false;

  const m = {
    id: String(msg.message_id),
    from: String(chat.id),
    sender,
    pushName,
    platform: 'telegram',

    body,
    prefix: parsed?.prefix || '',
    command: parsed?.command || '',
    args: parsed?.args || [],
    text: parsed?.text || '',
    type: msg.photo ? 'image' : msg.video ? 'video' : msg.document ? 'document' : 'text',

    isGroup,
    isOwner,
    isAdmin,
    isBotAdmin: true,

    user: userProfile,
    
    /** @param {string} text @param {object} [options] */
    reply: async (text, options = {}) => {
      return ctx.reply(text, { reply_parameters: { message_id: msg.message_id }, ...options });
    },

    /** @param {object} media */
    sendMedia: async (media) => {
      const { sendMedia: send } = await import('../adapters/telegram/sender.js');
      return send(ctx, String(chat.id), media);
    },

    /** @param {string} emoji */
    react: async (emoji) => {
      try {
        if (ctx.setMessageReaction) {
          return ctx.setMessageReaction([{ type: 'emoji', emoji }]);
        }
      } catch (err) {
        log.warn('Failed to set reaction');
      }
    },

    _raw: ctx,
    _client: ctx.telegram,
    _platform: 'telegram'
  };

  return m;
}

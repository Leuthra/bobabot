import { getUserProfile } from '../services/user.js';
import { parseCommand } from '../utils/helpers.js';
import config from '../config/index.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('dc-serializer');

/**
 * @param {import('oceanic.js').Client} client
 * @param {import('oceanic.js').Message} msg
 */
export async function serializeDiscord(client, msg) {
  if (!msg.author) return null;

  const isGroup = !!msg.guildID;
  const sender = msg.author.id;
  const pushName = msg.author.username;

  const body = msg.content || '';
  const parsed = parseCommand(body, config.bot.prefix);

  const userProfile = await getUserProfile(sender, 'discord', pushName);

  let isAdmin = false;
  let isBotAdmin = false;

  if (isGroup && msg.member) {
    isAdmin = msg.member.permissions.has('ADMINISTRATOR');
    
    const botMember = client.guilds.get(msg.guildID)?.members.get(client.user.id);
    if (botMember) {
      isBotAdmin = botMember.permissions.has('ADMINISTRATOR') || botMember.permissions.has('SEND_MESSAGES');
    }
  }

  const isOwner = config.bot.owner ? sender === config.bot.owner : false;

  const m = {
    id: msg.id,
    from: msg.channelID,
    sender,
    pushName,
    platform: 'discord',

    body,
    prefix: parsed?.prefix || '',
    command: parsed?.command || '',
    args: parsed?.args || [],
    text: parsed?.text || '',
    type: msg.attachments.size > 0 ? 'media' : 'text',

    isGroup,
    isOwner,
    isAdmin,
    isBotAdmin,

    user: userProfile,

    /** @param {string} text */
    reply: async (text) => {
      return client.rest.channels.createMessage(msg.channelID, {
        content: text,
        messageReference: { messageID: msg.id, channelID: msg.channelID }
      });
    },

    /** @param {object} media */
    sendMedia: async (media) => {
      const { sendMedia: send } = await import('../adapters/discord/sender.js');
      return send(client, msg.channelID, media);
    },

    /** @param {string} emoji */
    react: async (emoji) => {
      try {
        return client.rest.channels.createReaction(msg.channelID, msg.id, emoji);
      } catch (err) {
        log.warn({ err: err.message }, 'Failed to add Discord reaction');
      }
    },

    _raw: msg,
    _client: client,
    _platform: 'discord'
  };

  return m;
}

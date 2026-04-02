import * as userService from '../../services/user.js';
import { createLogger } from '../../utils/logger.js';

const log = createLogger('admin-plugin');

export default {
  command: ['premium', 'ban', 'unban', 'setlimit'],
  category: 'admin',
  desc: 'Manage users (Owner only)',
  isOwner: true,

  /** @param {import('../../serializers/whatsapp.js').UniversalMessage} m */
  execute: async (m) => {
    const { command, args } = m;

    if (args.length === 0) {
      return m.reply(`Usage: !${command} <platformId/@user> [value]`);
    }

    const targetId = args[0].replace('@', '');
    const user = await userService.findUser(targetId);

    if (!user) {
      return m.reply('❌ User not found in database.');
    }

    try {
      switch (command) {
        case 'premium': {
          const days = parseInt(args[1] || '30', 10);
          await userService.grantPremium(user.platformId, user.platform, days);
          return m.reply(`✅ Granted ${days} days premium to *${user.name}* (${user.platformId})`);
        }

        case 'ban': {
          await userService.banUser(user.platformId, user.platform);
          return m.reply(`✅ User *${user.name}* has been banned.`);
        }

        case 'unban': {
          await userService.unbanUser(user.platformId, user.platform);
          return m.reply(`✅ User *${user.name}* has been unbanned.`);
        }

        case 'setlimit': {
          const limit = parseInt(args[1] || '50', 10);
          await userService.resetAllLimits(limit);
          return m.reply(`✅ All user limits reset to ${limit}.`);
        }
      }
    } catch (err) {
      log.error({ err: err.message }, 'Admin command failed');
      return m.reply(`❌ Failed: ${err.message}`);
    }
  },
};

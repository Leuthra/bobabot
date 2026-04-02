import { runtime } from '../../utils/helpers.js';

export default {
  command: ['ping', 'p'],
  category: 'tools',
  desc: 'Check bot response time',

  /** @param {object} m */
  execute: async (m) => {
    const start = Date.now();
    const uptime = runtime(process.uptime());
    await m.reply(`🏓 Pong!\n⏱️ ${Date.now() - start}ms\n🕐 Uptime: ${uptime}`);
  },
};

export default {
  command: ['testinfo'],
  category: 'test',
  desc: 'Dump all context flags to chat',

  execute: async (m) => {
    const info = [
      `📋 *Context Info*`,
      ``,
      `*Identity*`,
      `• sender: ${m.sender}`,
      `• pushName: ${m.pushName}`,
      `• platform: ${m.platform}`,
      ``,
      `*Flags*`,
      `• isGroup: ${m.isGroup}`,
      `• isOwner: ${m.isOwner}`,
      `• isAdmin: ${m.isAdmin}`,
      `• isBotAdmin: ${m.isBotAdmin}`,
      ``,
      `*User Profile*`,
      `• id: ${m.user?.id}`,
      `• isPremium: ${m.user?.isPremium}`,
      `• isBanned: ${m.user?.isBanned}`,
      `• level: ${m.user?.level}`,
      `• limit: ${m.user?.limit}`,
      `• exp: ${m.user?.exp}`,
      ``,
      `*Message*`,
      `• from: ${m.from}`,
      `• type: ${m.type}`,
      `• command: ${m.command}`,
      `• args: [${m.args.join(', ')}]`,
    ];

    await m.reply(info.join('\n'));
  },
};

import { describe, it, expect, vi } from 'vitest';
import { serializeWhatsApp } from '../src/serializers/whatsapp.js';
import { serializeTelegram } from '../src/serializers/telegram.js';
import { serializeDiscord } from '../src/serializers/discord.js';

vi.mock('../src/services/user.js', () => ({
  getUserProfile: vi.fn().mockResolvedValue({ id: '1', name: 'Test User', isPremium: false }),
}));

vi.mock('../src/config/index.js', () => ({
  default: {
    bot: { prefix: ['!'], owner: '123' },
    whatsapp: { sessionId: 'test' },
    log: { level: 'info' },
    isDev: true
  },
}));

describe('Serializers Platform Consistency', () => {
  it('should serialize WhatsApp message to universal m', async () => {
    const mockSock = {
      user: { id: 'bot@s.whatsapp.net' },
      decodeJid: (id) => id,
    };
    const mockMsg = {
      key: { id: 'WA123', remoteJid: 'user@s.whatsapp.net', fromMe: false },
      message: { conversation: '!ping' },
      pushName: 'WA User',
    };

    const m = await serializeWhatsApp(mockSock, mockMsg);
    expect(m.id).toBe('WA123');
    expect(m.platform).toBe('whatsapp');
    expect(m.command).toBe('ping');
    expect(typeof m.reply).toBe('function');
  });

  it('should serialize Telegram context to universal m', async () => {
    const mockCtx = {
      message: {
        message_id: 456,
        from: { id: 789, first_name: 'TG User' },
        chat: { id: 789, type: 'private' },
        text: '!ping',
      },
      from: { id: 789, first_name: 'TG User' },
      chat: { id: 789, type: 'private' },
      telegram: {
        sendMessage: vi.fn(),
      },
    };

    const m = await serializeTelegram(mockCtx);
    expect(m.id).toBe('456');
    expect(m.platform).toBe('telegram');
    expect(m.command).toBe('ping');
    expect(m.sender).toBe('789');
  });

  it('should serialize Discord message to universal m', async () => {
    const mockClient = {
      user: { id: 'bot-dc' },
      rest: { channels: { createMessage: vi.fn() } },
    };
    const mockMsg = {
      id: 'DC999',
      author: { id: 'dc-user', username: 'DiscordUser', bot: false },
      channelID: 'chan-1',
      content: '!ping',
      attachments: new Map(),
      guildID: 'guild-1',
    };

    const m = await serializeDiscord(mockClient, mockMsg);
    expect(m.id).toBe('DC999');
    expect(m.platform).toBe('discord');
    expect(m.command).toBe('ping');
    expect(m.isGroup).toBe(true);
  });
});

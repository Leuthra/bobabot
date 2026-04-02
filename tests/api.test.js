import { describe, it, expect, vi } from 'vitest';
import { app } from '../src/api/routes.js';

vi.mock('../src/core/bootstrap.js', () => ({
  getAdapters: vi.fn().mockReturnValue([
    { name: 'whatsapp', isConnected: true, sendMessage: vi.fn(), sendMedia: vi.fn() },
    { name: 'telegram', isConnected: true, sendMessage: vi.fn(), sendMedia: vi.fn() },
  ]),
}));

vi.mock('../src/services/user.js', () => ({
  getUsersForBroadcast: vi.fn().mockResolvedValue([
    { platformId: 'u1', platform: 'whatsapp' },
    { platformId: 'u2', platform: 'telegram' },
  ]),
  getUserProfile: vi.fn(),
  findUser: vi.fn(),
  grantPremium: vi.fn(),
  banUser: vi.fn(),
  unbanUser: vi.fn(),
  consumeLimit: vi.fn(),
  addExp: vi.fn(),
  resetAllLimits: vi.fn(),
}));

vi.mock('../src/services/database.js', () => ({
  default: {
    user: {
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn(),
    },
  },
}));

vi.mock('../src/config/index.js', () => ({
  default: {
    api: { 
      port: 3000, 
      secret: 'test-secret',
      limit: { max: 10, window: 60000 }
    },
    bot: { name: 'Bobabot' },
    log: { level: 'info' },
    isDev: true
  },
}));

describe('API Routes Integration', () => {
  it('should return system status', async () => {
    const res = await app.request('/api/status');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('online');
    expect(body.name).toBe('Bobabot');
  });

  it('should require authentication for broadcast', async () => {
    const res = await app.request('/api/broadcast', {
      method: 'POST',
      body: JSON.stringify({ text: 'Hello' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(401);
  });

  it('should start broadcast with valid token', async () => {
    const res = await app.request('/api/broadcast', {
      method: 'POST',
      body: JSON.stringify({ text: 'Hello' }),
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-secret' 
      },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe('Broadcast started');
  });

  it('should return user list', async () => {
    const res = await app.request('/api/users', {
      headers: { 'Authorization': 'Bearer test-secret' }
    });
    expect(res.status).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });
});

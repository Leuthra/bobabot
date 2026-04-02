import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as userService from '../src/services/user.js';
import prisma from '../src/services/database.js';

vi.mock('../src/services/database.js', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

describe('User Service Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new user if not exists', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'uuid-1',
      platformId: 'user1',
      platform: 'whatsapp',
      name: 'New User',
      isPremium: false,
      limit: 25,
    });

    const user = await userService.getUserProfile('user1', 'whatsapp', 'New User');
    expect(prisma.user.create).toHaveBeenCalled();
    expect(user.name).toBe('New User');
  });

  it('should grant premium status correctly', async () => {
    prisma.user.update.mockResolvedValue({
      platformId: 'user1',
      platform: 'whatsapp',
      isPremium: true,
    });

    await userService.grantPremium('user1', 'whatsapp', 30);
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ isPremium: true }),
    }));
  });

  it('should ban a user correctly', async () => {
    await userService.banUser('user1', 'whatsapp');
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { isBanned: true },
    }));
  });

  it('should consume limit correctly', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'uuid-1', limit: 10, isPremium: false });
    prisma.user.update.mockResolvedValue({ limit: 9 });

    const result = await userService.consumeLimit('uuid-1', 1);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(9);
  });
});

import prisma from './database.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('user-service');

/**
 * @param {string} platformId
 * @param {string} platform
 * @param {string} [name]
 */
export async function getUserProfile(platformId, platform, name = '') {
  let user = await prisma.user.findUnique({
    where: { platformId_platform: { platformId, platform } },
  });

  if (user && user.name !== name && name) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name },
    });
  }

  if (!user) {
    user = await prisma.user.create({
      data: { platformId, platform, name: name || 'User' },
    });
    log.debug({ platformId, platform }, 'New user created');
  }

  if (user.isPremium && user.premiumEnd && new Date() > user.premiumEnd) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { isPremium: false },
    });
    log.info({ platformId }, 'Premium expired');
  }

  return {
    id: user.id,
    platformId: user.platformId,
    platform: user.platform,
    name: user.name,
    level: user.level,
    exp: user.exp,
    limit: user.limit,
    isPremium: user.isPremium,
    isBanned: user.isBanned,
    isRegistered: true,
  };
}

/** @param {string} userId @param {number} [cost] */
export async function consumeLimit(userId, cost = 1) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, remaining: 0 };
  if (user.isPremium) return { success: true, remaining: Infinity };
  if (user.limit < cost) return { success: false, remaining: user.limit };

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { limit: user.limit - cost },
  });

  return { success: true, remaining: updated.limit };
}

/** @param {string} userId @param {number} amount */
export async function addExp(userId, amount) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  let newExp = user.exp + amount;
  let newLevel = user.level;
  const threshold = (newLevel + 1) * 100;

  if (newExp >= threshold) {
    newExp -= threshold;
    newLevel += 1;
  }

  return prisma.user.update({
    where: { id: userId },
    data: { exp: newExp, level: newLevel },
  });
}

/** @param {string} platformId @param {string} platform */
export async function banUser(platformId, platform) {
  return prisma.user.update({
    where: { platformId_platform: { platformId, platform } },
    data: { isBanned: true },
  });
}

/** @param {string} platformId @param {string} platform */
export async function unbanUser(platformId, platform) {
  return prisma.user.update({
    where: { platformId_platform: { platformId, platform } },
    data: { isBanned: false },
  });
}

/** @param {string} platformId @param {string} platform @param {number} days */
export async function grantPremium(platformId, platform, days) {
  const premiumEnd = new Date();
  premiumEnd.setDate(premiumEnd.getDate() + days);

  return prisma.user.update({
    where: { platformId_platform: { platformId, platform } },
    data: { isPremium: true, premiumAt: new Date(), premiumEnd },
  });
}

/** @param {string} query */
export async function findUser(query) {
  return prisma.user.findFirst({
    where: {
      OR: [
        { platformId: query },
        { name: { contains: query } },
      ],
    },
  });
}

/** @param {string} [platform] */
export async function getUsersForBroadcast(platform = 'all') {
  const where = platform === 'all' ? {} : { platform };
  return prisma.user.findMany({ 
    where: { ...where, isBanned: false },
    select: { platformId: true, platform: true } 
  });
}

/** @param {number} newLimit */
export async function resetAllLimits(newLimit = 25) {
  return prisma.user.updateMany({ data: { limit: newLimit } });
}

import { PrismaClient } from '@prisma/client';
import { createLogger } from '../utils/logger.js';

const log = createLogger('database');

const prisma = new PrismaClient();

/** @returns {Promise<void>} */
export async function connectDatabase() {
  await prisma.$connect();
  log.info('Database connected');
}

/** @returns {Promise<void>} */
export async function disconnectDatabase() {
  await prisma.$disconnect();
  log.info('Database disconnected');
}

export default prisma;

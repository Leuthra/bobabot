import { initAuthCreds, BufferJSON } from '@whiskeysockets/baileys';
import prisma from '../../services/database.js';
import { createLogger } from '../../utils/logger.js';

const log = createLogger('wa-auth');

/** @param {string} sessionId */
export async function usePrismaAuthState(sessionId) {
  const readCreds = async () => {
    const row = await prisma.session.findUnique({ where: { id: sessionId } });
    if (row) return JSON.parse(row.data, BufferJSON.reviver);
    return initAuthCreds();
  };

  const writeCreds = async (creds) => {
    const data = JSON.stringify(creds, BufferJSON.replacer);
    await prisma.session.upsert({
      where: { id: sessionId },
      update: { data },
      create: { id: sessionId, data },
    });
  };

  const creds = await readCreds();

  return {
    state: {
      creds,
      keys: {
        /** @param {string} type @param {string[]} ids */
        get: async (type, ids) => {
          const result = {};
          if (!ids.length) return result;

          const rows = await prisma.authKey.findMany({
            where: {
              sessionId,
              type,
              keyId: { in: ids },
            },
          });

          for (const row of rows) {
            try {
              result[row.keyId] = JSON.parse(row.data, BufferJSON.reviver);
            } catch (err) {
              log.warn({ type, keyId: row.keyId }, 'Failed to parse auth key');
            }
          }

          return result;
        },

        /** @param {object} data */
        set: async (data) => {
          const ops = [];

          for (const [type, entries] of Object.entries(data)) {
            for (const [keyId, value] of Object.entries(entries)) {
              if (value) {
                ops.push(
                  prisma.authKey.upsert({
                    where: { sessionId_type_keyId: { sessionId, type, keyId } },
                    update: { data: JSON.stringify(value, BufferJSON.replacer) },
                    create: { sessionId, type, keyId, data: JSON.stringify(value, BufferJSON.replacer) },
                  })
                );
              } else {
                ops.push(
                  prisma.authKey.deleteMany({
                    where: { sessionId, type, keyId },
                  })
                );
              }
            }
          }

          await prisma.$transaction(ops);
        },
      },
    },

    saveCreds: () => writeCreds(creds),
  };
}

/** @param {string} sessionId */
export async function deleteSession(sessionId) {
  await prisma.$transaction([
    prisma.session.deleteMany({ where: { id: sessionId } }),
    prisma.authKey.deleteMany({ where: { sessionId } }),
  ]);
  log.info({ sessionId }, 'Session deleted');
}

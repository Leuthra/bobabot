import { createLogger } from '../../utils/logger.js';
import { serializeWhatsApp } from '../../serializers/whatsapp.js';
import prisma from '../../services/database.js';

const log = createLogger('wa-events');

/** @param {import('@whiskeysockets/baileys').WASocket} sock @param {import('../../core/eventBus.js').default} eventBus */
export function registerWhatsAppEvents(sock, eventBus) {
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const raw of messages) {
      if (raw.key.fromMe) continue;
      if (!raw.message) continue;

      try {
        const m = await serializeWhatsApp(sock, raw);
        if (!m) continue;
        eventBus.emit('message.incoming', m);
      } catch (err) {
        log.error({ err, messageId: raw.key.id }, 'Serialization failed');
      }
    }
  });

  sock.ev.on('lid-mapping.update', async (mappings) => {
    for (const { lid, pn } of mappings) {
      if (!lid || !pn) continue;

      try {
        await prisma.lidMapping.upsert({
          where: { lid },
          update: { pn },
          create: { lid, pn },
        });
      } catch (err) {
        log.warn({ lid, pn, err }, 'LID mapping upsert failed');
      }
    }
  });
}

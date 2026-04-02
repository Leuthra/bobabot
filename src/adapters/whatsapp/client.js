import makeWASocket, { DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import { usePrismaAuthState, deleteSession } from './auth.js';
import { registerWhatsAppEvents } from './events.js';
import { createLogger } from '../../utils/logger.js';
import config from '../../config/index.js';

const log = createLogger('wa-client');

/**
 * @param {import('../../core/eventBus.js').default} eventBus
 * @param {(sock: any) => void} [onSocketCreated]
 */
export async function createWhatsAppClient(eventBus, onSocketCreated) {
  const sessionId = config.whatsapp.sessionId;
  const { state, saveCreds } = await usePrismaAuthState(sessionId);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: log,
    generateHighQualityLinkPreview: false,
    markOnlineOnConnect: false,
    syncFullHistory: false,
  });

  registerWhatsAppEvents(sock, eventBus);

  if (onSocketCreated) onSocketCreated(sock);

  let reconnectAttempts = 0;
  const MAX_RECONNECT = 5;

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      qrcode.generate(qr, { small: true });
      log.info('Scan QR code above to connect');
    }

    if (connection === 'open') {
      reconnectAttempts = 0;
      log.info('WhatsApp connected');
      eventBus.emit('adapter.ready', { platform: 'whatsapp' });
    }

    if (connection === 'close') {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;

      if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
        log.error('Session logged out, deleting session');
        await deleteSession(sessionId);
        eventBus.emit('adapter.disconnected', { platform: 'whatsapp', reason: 'loggedOut' });
        return;
      }

      if (statusCode === 463) {
        log.error('Error 463 — session conflict, deleting session');
        await deleteSession(sessionId);
        eventBus.emit('adapter.disconnected', { platform: 'whatsapp', reason: 'conflict' });
        return;
      }

      if (reconnectAttempts < MAX_RECONNECT) {
        reconnectAttempts++;
        const delayMs = Math.min(reconnectAttempts * 2000, 10_000);
        log.warn({ attempt: reconnectAttempts, delayMs }, 'Reconnecting...');
        setTimeout(() => createWhatsAppClient(eventBus, onSocketCreated), delayMs);
      } else {
        log.error('Max reconnect attempts reached');
        eventBus.emit('adapter.disconnected', { platform: 'whatsapp', reason: 'maxRetries' });
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);

  return sock;
}

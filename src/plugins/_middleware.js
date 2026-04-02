import { createLogger } from '../utils/logger.js';

const log = createLogger('middleware');

/** @param {object} m @returns {boolean} */
export default async function globalMiddleware(m) {
  log.debug({ sender: m.sender, command: m.command || '(none)', platform: m.platform }, 'incoming');
  return true;
}

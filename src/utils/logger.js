import pino from 'pino';
import config from '../config/index.js';

const transport = config.isDev
  ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
  : undefined;

const logger = pino({
  level: config?.log?.level || 'info',
  transport,
});

/** @param {string} module */
export function createLogger(module) {
  return logger.child({ module });
}

export default logger;

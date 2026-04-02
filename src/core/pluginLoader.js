import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createLogger } from '../utils/logger.js';
import { isDuplicate } from './idempotency.js';
import eventBus from './eventBus.js';

const log = createLogger('plugin-loader');
const plugins = new Map();
const commandIndex = new Map();

/** @param {string} dir */
async function scanDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await scanDir(fullPath)));
    } else if (entry.name.endsWith('.js') && !entry.name.startsWith('_')) {
      files.push(fullPath);
    }
  }

  return files;
}

/** @param {string} pluginsDir */
export async function loadPlugins(pluginsDir) {
  plugins.clear();
  commandIndex.clear();

  const files = await scanDir(pluginsDir);

  for (const file of files) {
    try {
      const fileUrl = pathToFileURL(file).href;
      const mod = await import(fileUrl);
      const plugin = mod.default;

      if (!plugin?.command || !plugin?.execute) {
        log.warn({ file: relative(pluginsDir, file) }, 'Skipped invalid plugin');
        continue;
      }

      const commands = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
      const pluginId = commands[0];

      plugins.set(pluginId, { ...plugin, _file: file });

      for (const cmd of commands) {
        commandIndex.set(cmd, pluginId);
      }

      log.debug({ pluginId, commands }, 'Plugin loaded');
    } catch (err) {
      log.error({ file, err: err.message }, 'Failed to load plugin');
    }
  }

  log.info(`Loaded ${plugins.size} plugins (${commandIndex.size} commands)`);
  return plugins;
}

/** @returns {Map} */
export function getPlugins() {
  return plugins;
}

/** @returns {Map} */
export function getCommandIndex() {
  return commandIndex;
}

const middlewares = [];

/** @param {string} pluginsDir */
export async function loadMiddlewares(pluginsDir) {
  const entries = await readdir(pluginsDir, { withFileTypes: true });
  const files = entries
    .filter(e => e.isFile() && e.name.endsWith('.js') && e.name.startsWith('_'))
    .map(e => join(pluginsDir, e.name));

  for (const file of files) {
    try {
      const fileUrl = pathToFileURL(file).href;
      const mod = await import(fileUrl);
      if (typeof mod.default === 'function') {
        middlewares.push(mod.default);
        log.info({ file: relative(pluginsDir, file) }, 'Middleware loaded');
      }
    } catch (err) {
      log.error({ file, err: err.message }, 'Failed to load middleware');
    }
  }
}

/** @param {object} m @param {function} finalAction */
async function runMiddlewares(m, finalAction) {
  let index = -1;

  const dispatch = async (i) => {
    if (i <= index) return Promise.reject(new Error('next() called multiple times'));
    index = i;
    const fn = i === middlewares.length ? finalAction : middlewares[i];
    if (!fn) return;
    return fn(m, () => dispatch(i + 1));
  };

  return dispatch(0);
}

const VALIDATION_MESSAGES = {
  isGroup: '⚠️ This command can only be used in groups.',
  isAdmin: '⚠️ You must be a group administrator to use this command.',
  isBotAdmin: '⚠️ The bot must be a group administrator to execute this command.',
  isOwner: '⚠️ This command is restricted to the bot owner.',
  isPremium: '⚠️ This command is for premium users only.',
};

/** @param {object} m */
async function handleMessage(m) {
  if (!m.command) return;
  if (isDuplicate(m.id)) return;
  if (m.user?.isBanned) return;

  await runMiddlewares(m, async () => {
    const pluginId = commandIndex.get(m.command);
    if (!pluginId) return;

    const plugin = plugins.get(pluginId);
    if (!plugin) return;

  if (plugin.isGroup && !m.isGroup) {
    return m.reply(VALIDATION_MESSAGES.isGroup);
  }
  if (plugin.isAdmin && !m.isAdmin && !m.isOwner) {
    return m.reply(VALIDATION_MESSAGES.isAdmin);
  }
  if (plugin.isBotAdmin && !m.isBotAdmin) {
    return m.reply(VALIDATION_MESSAGES.isBotAdmin);
  }
  if (plugin.isOwner && !m.isOwner) {
    return m.reply(VALIDATION_MESSAGES.isOwner);
  }
  if (plugin.isPremium && !m.user?.isPremium && !m.isOwner) {
    return m.reply(VALIDATION_MESSAGES.isPremium);
  }

  try {
    log.info({ command: m.command, sender: m.sender, chat: m.from, platform: m.platform }, 'Executing plugin');
    await plugin.execute(m);
  } catch (err) {
    log.error({ command: m.command, err: err.message }, 'Plugin execution error');
    eventBus.emit('plugin.error', { command: m.command, error: err, m });
    await m.reply('❌ An error occurred while executing the command.').catch(() => {});
  }
  });
}

export function startPluginHandler() {
  eventBus.on('message.incoming', handleMessage);
  log.info('Plugin handler registered');
}

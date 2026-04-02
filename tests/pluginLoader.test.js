import { describe, it, expect } from 'vitest';
import { loadPlugins, getPlugins, getCommandIndex } from '../src/core/pluginLoader.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pluginsDir = join(__dirname, '..', 'src', 'plugins');

describe('pluginLoader', () => {
  it('loads plugins from directory', async () => {
    await loadPlugins(pluginsDir);
    const plugins = getPlugins();
    const index = getCommandIndex();

    expect(plugins.size).toBeGreaterThan(0);
    expect(index.has('ping')).toBe(true);
    expect(index.has('p')).toBe(true);
  });

  it('skips files starting with underscore', async () => {
    await loadPlugins(pluginsDir);
    const plugins = getPlugins();

    for (const [, plugin] of plugins) {
      expect(plugin._file).not.toContain('_middleware');
    }
  });

  it('plugin has required fields', async () => {
    await loadPlugins(pluginsDir);
    const plugins = getPlugins();

    for (const [, plugin] of plugins) {
      expect(plugin.command).toBeDefined();
      expect(plugin.execute).toBeInstanceOf(Function);
    }
  });
});

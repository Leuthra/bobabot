import { describe, it, expect } from 'vitest';
import { parseCommand, formatBytes, runtime, isUrl, normalizeJid, isGroupJid, isPnJid, isLidJid, delay } from '../src/utils/helpers.js';

describe('parseCommand', () => {
  const prefixes = ['!', '.', '/'];

  it('parses a basic command with prefix', () => {
    const result = parseCommand('!ping', prefixes);
    expect(result).toEqual({
      prefix: '!',
      command: 'ping',
      args: [],
      text: '',
    });
  });

  it('parses command with arguments', () => {
    const result = parseCommand('.kick @user alasan spam', prefixes);
    expect(result).toEqual({
      prefix: '.',
      command: 'kick',
      args: ['@user', 'alasan', 'spam'],
      text: '@user alasan spam',
    });
  });

  it('parses command with slash prefix', () => {
    const result = parseCommand('/help menu', prefixes);
    expect(result).toEqual({
      prefix: '/',
      command: 'help',
      args: ['menu'],
      text: 'menu',
    });
  });

  it('returns null for no prefix', () => {
    expect(parseCommand('hello world', prefixes)).toBeNull();
  });

  it('returns null for empty body', () => {
    expect(parseCommand('', prefixes)).toBeNull();
    expect(parseCommand(null, prefixes)).toBeNull();
    expect(parseCommand(undefined, prefixes)).toBeNull();
  });

  it('returns null for prefix-only input', () => {
    expect(parseCommand('!', prefixes)).toBeNull();
    expect(parseCommand('! ', prefixes)).toBeNull();
  });

  it('lowercases the command', () => {
    const result = parseCommand('!PING', prefixes);
    expect(result.command).toBe('ping');
  });

  it('handles extra whitespace', () => {
    const result = parseCommand('!  ping   arg1   arg2', prefixes);
    expect(result.command).toBe('ping');
    expect(result.args).toEqual(['arg1', 'arg2']);
  });
});

describe('formatBytes', () => {
  it('formats zero bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500.0 B');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1048576)).toBe('1.0 MB');
  });

  it('formats gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1.0 GB');
  });
});

describe('runtime', () => {
  it('formats seconds only', () => {
    expect(runtime(45)).toBe('45s');
  });

  it('formats minutes and seconds', () => {
    expect(runtime(130)).toBe('2m 10s');
  });

  it('formats hours', () => {
    expect(runtime(3661)).toBe('1h 1m 1s');
  });

  it('formats days', () => {
    expect(runtime(90061)).toBe('1d 1h 1m 1s');
  });

  it('handles zero', () => {
    expect(runtime(0)).toBe('0s');
  });
});

describe('isUrl', () => {
  it('detects valid http URL', () => {
    expect(isUrl('http://example.com')).toBe(true);
  });

  it('detects valid https URL', () => {
    expect(isUrl('https://example.com/path?q=1')).toBe(true);
  });

  it('rejects non-URL strings', () => {
    expect(isUrl('not a url')).toBe(false);
    expect(isUrl('ftp://files.com')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isUrl('')).toBe(false);
  });
});

describe('normalizeJid', () => {
  it('strips device suffix', () => {
    expect(normalizeJid('628123456789:5@s.whatsapp.net')).toBe('628123456789@s.whatsapp.net');
  });

  it('handles already clean JID', () => {
    expect(normalizeJid('628123456789@s.whatsapp.net')).toBe('628123456789@s.whatsapp.net');
  });

  it('handles empty input', () => {
    expect(normalizeJid('')).toBe('');
    expect(normalizeJid(null)).toBe('');
  });
});

describe('JID type checks', () => {
  it('isGroupJid', () => {
    expect(isGroupJid('120363xxx@g.us')).toBe(true);
    expect(isGroupJid('628xxx@s.whatsapp.net')).toBe(false);
    expect(isGroupJid(null)).toBe(false);
  });

  it('isPnJid', () => {
    expect(isPnJid('628xxx@s.whatsapp.net')).toBe(true);
    expect(isPnJid('120363xxx@g.us')).toBe(false);
  });

  it('isLidJid', () => {
    expect(isLidJid('abc123@lid')).toBe(true);
    expect(isLidJid('628xxx@s.whatsapp.net')).toBe(false);
  });
});

describe('delay', () => {
  it('resolves after specified ms', async () => {
    const start = Date.now();
    await delay(50);
    expect(Date.now() - start).toBeGreaterThanOrEqual(40);
  });
});

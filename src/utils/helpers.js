/** @param {number} ms */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** @param {string} body @param {string[]} prefixes */
export function parseCommand(body, prefixes) {
  if (!body || typeof body !== 'string') return null;

  const trimmed = body.trim();
  const prefix = prefixes.find(p => trimmed.startsWith(p));
  if (!prefix) return null;

  const withoutPrefix = trimmed.slice(prefix.length).trim();
  if (!withoutPrefix) return null;

  const [command, ...args] = withoutPrefix.split(/\s+/);

  return {
    prefix,
    command: command.toLowerCase(),
    args,
    text: args.join(' '),
  };
}

/** @param {number} bytes */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
}

/** @param {number} seconds */
export function runtime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  parts.push(`${s}s`);

  return parts.join(' ');
}

/** @param {string} str */
export function isUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** @param {string} jid */
export function normalizeJid(jid) {
  if (!jid) return '';
  return jid.replace(/:\d+/, '').split('@')[0] + '@' + (jid.split('@')[1] || 's.whatsapp.net');
}

/** @param {string} jid */
export function isGroupJid(jid) {
  return jid?.endsWith('@g.us') || false;
}

/** @param {string} jid */
export function isPnJid(jid) {
  return jid?.endsWith('@s.whatsapp.net') || false;
}

/** @param {string} jid */
export function isLidJid(jid) {
  return jid?.endsWith('@lid') || false;
}

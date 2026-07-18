import { getEnv } from './env.js';
type Level = 'debug' | 'info' | 'warn' | 'error';
const ranks: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const secretKeys = /authorization|token|key|secret|password|prompt|document|content/i;
function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, secretKeys.test(key) ? '[REDACTED]' : redact(val)]));
  return value;
}
export function log(level: Level, message: string, context: Record<string, unknown> = {}): void {
  let configured: Level = 'info';
  try { configured = getEnv().LOG_LEVEL; } catch { /* startup logging */ }
  if (ranks[level] < ranks[configured]) return;
  const safeContext = redact(context) as Record<string, unknown>;
  const entry = JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...safeContext });
  (level === 'error' ? console.error : level === 'warn' ? console.warn : console.log)(entry);
}

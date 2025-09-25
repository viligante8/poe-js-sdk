import type { AxiosRequestConfig } from 'axios';

export function headersToObject(
  headers: AxiosRequestConfig['headers']
): Record<string, string> {
  if (!headers) return {};
  const anyHeaders = headers as unknown as {
    toJSON?: () => Record<string, unknown>;
    [k: string]: unknown;
  };
  const base = anyHeaders?.toJSON
    ? anyHeaders.toJSON()
    : (headers as Record<string, unknown>);
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(base || {})) {
    if (v === undefined || v === null) continue;
    out[k] = Array.isArray(v) ? v.join(', ') : String(v);
  }
  return out;
}

export function redactHeaderValues(
  headers: Record<string, string>,
  redact: string[]
): Record<string, string> {
  const lower = new Set(redact.map((h) => h.toLowerCase()));
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    out[k] = lower.has(k.toLowerCase()) ? '***' : v;
  }
  return out;
}

function shQuote(value: string): string {
  // Single-quote and escape single quotes for POSIX shells
  return "'" + value.replaceAll("'", String.raw`'\''`) + "'";
}

export function buildCurl(config: AxiosRequestConfig): string {
  const method = (config.method || 'GET').toUpperCase();
  let url = config.url || '';
  if (!/^https?:\/\//i.test(url)) {
    const base = config.baseURL || '';
    try {
      url = new URL(url, base).toString();
    } catch {
      // leave as-is
    }
  }
  const headerObject = headersToObject(config.headers);
  const flags: string[] = [`-X ${method}`, shQuote(url)];
  for (const [name, value] of Object.entries(headerObject)) {
    if (name.toLowerCase() === 'content-length') continue;
    flags.push(`-H ${shQuote(`${name}: ${value}`)}`);
  }
  if (config.data !== undefined && method !== 'GET') {
    const bodyString =
      typeof config.data === 'string'
        ? config.data
        : JSON.stringify(config.data);
    flags.push(`--data-raw ${shQuote(bodyString)}`);
  }
  return `curl ${flags.join(' ')}`;
}

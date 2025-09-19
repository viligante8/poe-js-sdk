export class PoEApiError extends Error {
  code?: number | undefined;
  status: number;
  url?: string | undefined;
  details?: unknown;
  headers?: Record<string, string> | undefined;

  constructor(message: string, opts: { code?: number; status: number; url?: string; details?: unknown; headers?: Record<string, string> }) {
    super(message);
    this.name = 'PoEApiError';
    this.code = opts.code ?? undefined;
    this.status = opts.status;
    this.url = opts.url ?? undefined;
    this.details = opts.details;
    this.headers = opts.headers ?? undefined;
  }
}

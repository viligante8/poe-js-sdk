/**
 * Error thrown for structured API errors from the PoE API.
 * Mirrors `{ error: { code, message } }` payloads and includes HTTP metadata.
 */
export class PoEApiError extends Error {
  code?: number | undefined;
  status: number;
  url?: string | undefined;
  details?: unknown;
  headers?: Record<string, string> | undefined;

  /**
   * @param message Error message
   * @param opts.code Optional PoE error code
   * @param opts.status HTTP status code
   * @param opts.url Request URL if available
   * @param opts.details Raw error payload
   * @param opts.headers Response headers
   */
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

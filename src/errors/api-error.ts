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
  constructor(
    message: string,
    options: {
      code?: number;
      status: number;
      url?: string;
      details?: unknown;
      headers?: Record<string, string>;
    }
  ) {
    super(message);
    this.name = 'PoEApiError';
    this.code = options.code ?? undefined;
    this.status = options.status;
    this.url = options.url ?? undefined;
    this.details = options.details;
    this.headers = options.headers ?? undefined;
  }
}

/**
 * The single failure type every caller in the app sees.
 *
 * The Axios interceptor normalises transport errors, HTTP errors and malformed
 * responses into this shape, so no component ever inspects an AxiosError.
 */
export class ApiRequestError extends Error {
  /** HTTP status, or 0 when the request never reached the server. */
  readonly status: number;
  /** Stable machine code from the API, used to look up a translated message. */
  readonly code: string;
  /** Field name → message, ready to hand to react-hook-form's `setError`. */
  readonly fieldErrors: Record<string, string>;

  constructor(message: string, status: number, code: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get hasFieldErrors(): boolean {
    return Object.keys(this.fieldErrors).length > 0;
  }
}

export function isApiRequestError(value: unknown): value is ApiRequestError {
  return value instanceof ApiRequestError;
}

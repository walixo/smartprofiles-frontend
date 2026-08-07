import axios, { AxiosError, type AxiosInstance } from 'axios';
import { ApiRequestError } from './api-error';
import { getStoredToken } from './auth-storage';

interface ErrorEnvelope {
  success: false;
  message?: string;
  code?: string;
  errors?: Array<{ field?: string; message?: string; code?: string }>;
}

interface SuccessEnvelope<T> {
  success: true;
  data: T;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiRequestError(error)),
);

/**
 * Unwraps the success envelope so callers work with `data` directly.
 * A 2xx that is not shaped like an envelope is treated as a failure — a proxy
 * returning an HTML error page must not surface as a successful result.
 */
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<SuccessEnvelope<T>>(url, params ? { params } : undefined);
  return unwrap(response.data);
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.post<SuccessEnvelope<T>>(url, body);
  return unwrap(response.data);
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.patch<SuccessEnvelope<T>>(url, body);
  return unwrap(response.data);
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await apiClient.delete<SuccessEnvelope<T>>(url);
  return unwrap(response.data);
}

function unwrap<T>(payload: SuccessEnvelope<T> | undefined): T {
  if (!payload || payload.success !== true) {
    throw new ApiRequestError('The server returned an unexpected response.', 0, 'MALFORMED_RESPONSE');
  }
  return payload.data;
}

function toApiRequestError(error: unknown): ApiRequestError {
  if (error instanceof ApiRequestError) {
    return error;
  }

  if (!(error instanceof AxiosError)) {
    return new ApiRequestError('Something went wrong.', 0, 'UNKNOWN_ERROR');
  }

  if (!error.response) {
    const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
    return new ApiRequestError(
      isTimeout ? 'The request timed out.' : 'Cannot reach the server. Check your connection.',
      0,
      isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
    );
  }

  const { status, data } = error.response;
  const envelope = isErrorEnvelope(data) ? data : undefined;

  return new ApiRequestError(
    envelope?.message ?? fallbackMessageForStatus(status),
    status,
    envelope?.code ?? fallbackCodeForStatus(status),
    toFieldErrors(envelope?.errors),
  );
}

function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
  return typeof value === 'object' && value !== null && 'success' in value;
}

/**
 * Values are a translation KEY when the server supplied a field code, and the
 * server's own English sentence otherwise. Both are safe to pass to `t()`,
 * which returns unknown keys unchanged — so consumers always render the best
 * available text without having to know which case they got.
 */
function toFieldErrors(errors: ErrorEnvelope['errors']): Record<string, string> {
  if (!Array.isArray(errors)) return {};

  const result: Record<string, string> = {};
  for (const entry of errors) {
    if (!entry?.field || entry.field in result) continue;

    const value = entry.code ? `error.${entry.code}` : entry.message;
    if (value) result[entry.field] = value;
  }
  return result;
}

function fallbackMessageForStatus(status: number): string {
  if (status === 401) return 'Please sign in to continue.';
  if (status === 403) return 'You do not have access to this resource.';
  if (status === 404) return 'We could not find what you were looking for.';
  if (status === 429) return 'Too many requests. Please try again shortly.';
  if (status >= 500) return 'Something went wrong on our end.';
  return 'The request could not be completed.';
}

function fallbackCodeForStatus(status: number): string {
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500) return 'INTERNAL_ERROR';
  return 'REQUEST_FAILED';
}

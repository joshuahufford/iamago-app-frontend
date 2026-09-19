import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

import { tokenStore } from '@/auth/tokens';
import type { ApiErrorBody } from '@/api/types';

/** Fired when refreshing fails, so the auth provider can drop the session. */
export const SESSION_EXPIRED_EVENT = 'iamago:session-expired';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const access = tokenStore.access;
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

type RetriableRequest = AxiosRequestConfig & { _retry?: boolean };

// A single in-flight refresh shared by every 401'd request, so a burst of
// parallel calls triggers one refresh rather than one each.
let refreshInFlight: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshInFlight) {
    const refresh = tokenStore.refresh;
    if (!refresh) {
      return Promise.reject(new Error('No refresh token'));
    }

    refreshInFlight = axios
      .post<{ access: string; refresh?: string }>(
        `${api.defaults.baseURL}/auth/refresh/`,
        { refresh },
        { headers: { 'Content-Type': 'application/json' } },
      )
      .then((response) => {
        const { access, refresh: rotated } = response.data;
        // The backend rotates refresh tokens, so store the new one when present.
        if (rotated) {
          tokenStore.set({ access, refresh: rotated });
        } else {
          tokenStore.setAccess(access);
        }
        return access;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as RetriableRequest | undefined;
    const isAuthEndpoint = original?.url?.includes('/auth/login/') ||
      original?.url?.includes('/auth/refresh/');

    if (error.response?.status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        const access = await refreshAccessToken();
        original.headers = { ...original.headers, Authorization: `Bearer ${access}` };
        return api.request(original);
      } catch {
        tokenStore.clear();
        window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
      }
    }

    return Promise.reject(error);
  },
);

/** Human-readable message for any error thrown by the API layer. */
export function errorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return 'Cannot reach the server. Is the backend running?';
    }
    return error.response.data?.detail ?? fallback;
  }
  return fallback;
}

/** Field-level errors from the backend envelope, flattened for Mantine forms. */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return {};

  const errors = error.response?.data?.errors;
  if (!errors) return {};

  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.join(' ') : String(messages),
    ]),
  );
}

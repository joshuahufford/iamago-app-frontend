import type { TokenPair } from '@/api/types';

const ACCESS_KEY = 'iamago.access';
const REFRESH_KEY = 'iamago.refresh';

/**
 * Token storage.
 *
 * localStorage keeps the session across reloads at the cost of being readable
 * by any script on the origin. If you later need protection against XSS token
 * theft, move the refresh token to an httpOnly cookie issued by the backend —
 * this module is the only place that would need to change.
 */
export const tokenStore = {
  get access() {
    return safeRead(ACCESS_KEY);
  },

  get refresh() {
    return safeRead(REFRESH_KEY);
  },

  set(tokens: TokenPair) {
    safeWrite(ACCESS_KEY, tokens.access);
    safeWrite(REFRESH_KEY, tokens.refresh);
  },

  setAccess(access: string) {
    safeWrite(ACCESS_KEY, access);
  },

  clear() {
    safeRemove(ACCESS_KEY);
    safeRemove(REFRESH_KEY);
  },
};

function safeRead(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* Storage unavailable (private mode, blocked cookies) — stay in memory. */
  }
}

function safeRemove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

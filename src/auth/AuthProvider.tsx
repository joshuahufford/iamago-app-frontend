import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { authApi } from '@/api/auth';
import { SESSION_EXPIRED_EVENT } from '@/api/client';
import type { LoginPayload, RegisterPayload, User } from '@/api/types';
import { AuthContext, type AuthContextValue } from '@/auth/AuthContext';
import { tokenStore } from '@/auth/tokens';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On boot, a stored token is only a hint — ask the API who we actually are.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!tokenStore.access) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await authApi.me();
        if (!cancelled) setUser(me);
      } catch {
        tokenStore.clear();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  // The API client fires this when a refresh fails; drop the session to match.
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { access, refresh, user: loggedIn } = await authApi.login(payload);
    tokenStore.set({ access, refresh });
    setUser(loggedIn);
  }, []);

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await authApi.register(payload);
      await login({ email: payload.email, password: payload.password });
    },
    [login],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
      setUser,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

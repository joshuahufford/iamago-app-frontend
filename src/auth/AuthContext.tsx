import { createContext } from 'react';

import type { LoginPayload, RegisterPayload, User } from '@/api/types';

export interface AuthContextValue {
  user: User | null;
  /** True until the initial "am I logged in?" check has settled. */
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

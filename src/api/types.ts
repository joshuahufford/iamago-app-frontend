export interface Profile {
  bio: string;
  avatar_url: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_staff: boolean;
  date_joined: string;
  profile: Profile;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface LoginResponse extends TokenPair {
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  profile?: Partial<Profile>;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

/** The error envelope every DRF failure is normalised into by the backend. */
export interface ApiErrorBody {
  detail: string;
  errors: Record<string, string[] | string>;
}

/** Paginated list response shape used by DRF's PageNumberPagination. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
